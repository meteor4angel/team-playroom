import { act, authorize, createRoom, joinRoom, settle, snapshot, type Room } from './roomEngine';
import type { RoomAction, RoomSettings } from '../src/shared/rooms';
interface Env { ROOMS: DurableObjectNamespace; ALLOWED_ORIGINS: string }
type Attachment = { playerId?: string; connectedAt: number; window: number; messages: number };
const json = (value: unknown, status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Room request failed.';

export class RoomDurableObject {
  private room?: Room;
  constructor(private ctx: DurableObjectState, private env: Env) {
    ctx.blockConcurrencyWhile(async()=>{this.room=await ctx.storage.get<Room>('room');});
  }
  private connected() { return new Set(this.ctx.getWebSockets().map(ws=>(ws.deserializeAttachment() as Attachment)?.playerId).filter((id): id is string=>!!id)); }
  private broadcast() {
    if(!this.room) return;
    const connected=this.connected();
    for(const ws of this.ctx.getWebSockets()) {
      const attachment=ws.deserializeAttachment() as Attachment;
      const player=this.room.players.find(p=>p.id===attachment?.playerId);
      if(!player) continue;
      try { ws.send(JSON.stringify({type:'snapshot',room:snapshot(this.room,player,connected,Date.now())})); } catch { /* A reconnect gets a fresh snapshot. */ }
    }
  }
  private async persist() {
    if(!this.room) return;
    await this.ctx.storage.put('room',this.room);
    await this.ctx.storage.setAlarm(this.room.phase==='closed'?Date.now()+100:this.room.phase==='playing'?Math.min(this.room.endsAt,this.room.expiresAt):this.room.expiresAt);
  }
  async fetch(request: Request): Promise<Response> {
    return this.ctx.blockConcurrencyWhile(async()=>{
      try {
        const path=new URL(request.url).pathname;
        if(path==='/create' && request.method==='POST') {
          if(this.room) return json({error:'Room code collision.'},409);
          const body=await request.json() as {nickname:string;settings:RoomSettings;game:string};
          const {room,player}=createRoom(request.headers.get('X-Room-Code')!,body.nickname,body.settings,Date.now(),body.game);
          this.room=room; await this.persist();
          return json({credentials:{code:room.code,playerId:player.id,token:player.token},room:snapshot(room,player,this.connected(),Date.now())},201);
        }
        if(!this.room || Date.now()>=this.room.expiresAt || this.room.phase==='closed') return json({error:'Room not found or expired. Create a new room.'},404);
        if(settle(this.room,Date.now())) {await this.persist();this.broadcast();}
        if(path==='/join' && request.method==='POST') {
          const body=await request.json() as {nickname:string};
          const player=joinRoom(this.room,body.nickname,Date.now()); await this.persist();this.broadcast();
          return json({credentials:{code:this.room.code,playerId:player.id,token:player.token},room:snapshot(this.room,player,this.connected(),Date.now())});
        }
        if(path==='/ws' && request.headers.get('Upgrade')?.toLowerCase()==='websocket') {
          if(this.ctx.getWebSockets().length>=32) return json({error:'Too many room connections.'},429);
          const pair=new WebSocketPair(); const [client,server]=Object.values(pair);
          this.ctx.acceptWebSocket(server);
          server.serializeAttachment({connectedAt:Date.now(),window:Date.now(),messages:0} satisfies Attachment);
          return new Response(null,{status:101,webSocket:client});
        }
        const player=authorize(this.room,(request.headers.get('Authorization') ?? '').replace(/^Bearer /,''));
        if(path==='/state' && request.method==='GET') return json({room:snapshot(this.room,player,this.connected(),Date.now())});
        if(path==='/action' && request.method==='POST') {
          act(this.room,player,await request.json() as RoomAction,Date.now());await this.persist();this.broadcast();
          return json({room:snapshot(this.room,player,this.connected(),Date.now())});
        }
        return json({error:'Not found.'},404);
      } catch(error) {return json({error:errorText(error)},400);}
    });
  }
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    await this.ctx.blockConcurrencyWhile(async()=>{
      try {
        if(typeof message!=='string'||message.length>4096) throw new Error('Invalid room message.');
        const attachment=ws.deserializeAttachment() as Attachment;
        if(Date.now()-attachment.window>10000){attachment.window=Date.now();attachment.messages=0;}
        attachment.messages++;ws.serializeAttachment(attachment);
        if(attachment.messages>30) {ws.close(1008,'Too many messages.');return;}
        if(!this.room||Date.now()>=this.room.expiresAt) throw new Error('Room expired.');
        const body=JSON.parse(message) as {type:string;token?:string};
        if(body.type==='auth') {
          if(Date.now()-attachment.connectedAt>10000) throw new Error('Connection authentication timed out.');
          const player=authorize(this.room,body.token??'');
          // Replace older tabs for the same room session; a player contributes once.
          for(const other of this.ctx.getWebSockets()) if(other!==ws && (other.deserializeAttachment() as Attachment)?.playerId===player.id) other.close(4001,'Session opened in another tab.');
          attachment.playerId=player.id;ws.serializeAttachment(attachment);this.broadcast();return;
        }
        if(!attachment.playerId) throw new Error('Authenticate the room connection first.');
        if(body.type==='sync') { if(settle(this.room,Date.now())) await this.persist();this.broadcast(); }
        else throw new Error('Use the room action endpoint for changes.');
      } catch(error) {try {ws.send(JSON.stringify({type:'error',error:errorText(error)}));if(!(ws.deserializeAttachment() as Attachment)?.playerId)ws.close(1008,'Authentication failed.');} catch{} }
    });
  }
  webSocketClose(ws: WebSocket, code: number, reason: string) {ws.close(code,reason);this.broadcast();}
  webSocketError(ws: WebSocket) {ws.close(1011,'Reconnect to continue.');this.broadcast();}
  async alarm() {
    if(!this.room) return;
    if(Date.now()>=this.room.expiresAt || this.room.phase==='closed') {
      for(const ws of this.ctx.getWebSockets()) ws.close(4004,'Room expired.');
      await this.ctx.storage.deleteAll();this.room=undefined;return;
    }
    settle(this.room,Date.now());await this.persist();this.broadcast();
  }
}

// Best-effort burst protection; room/session caps remain authoritative.
const bursts=new Map<string,{time:number;count:number}>();
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin=request.headers.get('Origin');
    const allowed=env.ALLOWED_ORIGINS.split(',').map(s=>s.trim());
    if(origin&&!allowed.includes(origin)) return json({error:'Origin not allowed.'},403);
    const cors={'Access-Control-Allow-Origin':origin??allowed[0], 'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Vary':'Origin'};
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
    const url=new URL(request.url);
    let payload: string | undefined;
    if(url.pathname==='/health') return json({ok:true,version:'0.3',backend:'Durable Objects'});
    if(request.method==='POST') {
      const ip=request.headers.get('CF-Connecting-IP')??'local'; const now=Date.now();
      if(bursts.size>1000) bursts.clear();
      const bucket=bursts.get(ip)??{time:now,count:0}; if(now-bucket.time>10000){bucket.time=now;bucket.count=0;}bucket.count++;bursts.set(ip,bucket);
      if(bucket.count>60) return new Response(JSON.stringify({error:'Please slow down and retry.'}),{status:429,headers:{...cors,'Content-Type':'application/json'}});
      payload=await request.text();
      if(payload.length>4096) return json({error:'Request too large.'},413);
    }
    let code='',path='';
    if(url.pathname==='/api/rooms' && request.method==='POST') {
      const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      code=Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%alphabet.length]).join('');path='/create';
    } else {
      const match=url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{8})\/(join|state|action|ws)$/);
      if(!match) return json({error:'Not found.'},404);[,code,path]=match;path='/'+path;
    }
    const headers=new Headers(request.headers);headers.set('X-Room-Code',code);
    const response=await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(new Request('https://room'+path,{method:request.method,headers,body:payload}));
    if(response.status===101) return response;
    const result=new Response(response.body,response);for(const [key,value] of Object.entries(cors)) result.headers.set(key,value);return result;
  },
};
