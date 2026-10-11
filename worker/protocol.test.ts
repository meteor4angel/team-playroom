import {describe,expect,it} from 'vitest';
import worker,{RoomDurableObject} from './index';
import type {Credentials,RoomView} from '../src/shared/rooms';

function fixture() {
 const objects=new Map<string,RoomDurableObject>();const contexts=new Map<string,ReturnType<typeof context>>();
 const env={ALLOWED_ORIGINS:'https://team-playroom.pages.dev',ROOMS:{idFromName:(code:string)=>code,get(code:string){if(!objects.has(code)){const ctx=context();contexts.set(code,ctx);objects.set(code,new RoomDurableObject(ctx as unknown as DurableObjectState,env as never));}return {fetch:(request:Request)=>objects.get(code)!.fetch(request)};}}};
 function context(){const storage=new Map<string,unknown>();let queue=Promise.resolve();return {storage:{get:async(key:string)=>structuredClone(storage.get(key)),put:async(key:string,value:unknown)=>{storage.set(key,structuredClone(value));},setAlarm:async()=>{},deleteAll:async()=>{storage.clear();}},sockets:[] as FakeSocket[],blockConcurrencyWhile<T>(fn:()=>Promise<T>):Promise<T>{const p=queue.then(fn);queue=p.then(()=>{},()=>{});return p;},getWebSockets(){return this.sockets;}};}
 async function call(path:string,data?:unknown,token?:string){return worker.fetch(new Request('https://room.test'+path,{method:data===undefined?'GET':'POST',headers:{Origin:'https://team-playroom.pages.dev','Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)}),env as never);}
 return {call,objects,contexts};
}
class FakeSocket{
 attachment:unknown={connectedAt:Date.now(),window:Date.now(),messages:0};messages:string[]=[];closed=false;
 serializeAttachment(data:unknown){this.attachment=data;}deserializeAttachment(){return this.attachment;}send(message:string){this.messages.push(message);}close(){this.closed=true;}
}
describe('Worker HTTP and WebSocket protocol (mocked platform storage/sockets)',()=>{
 it('creates and joins through the actual HTTP router and enforces private actions',async()=>{
  const {call}=fixture();const created=await call('/api/rooms',{nickname:'Host',game:'color-clash',settings:{count:8,scoring:'individual',cue:false}});
  expect(created.status).toBe(201);const host=await created.json<{credentials:Credentials;room:RoomView}>();const path='/api/rooms/'+host.credentials.code;
  expect(created.headers.get('Access-Control-Allow-Origin')).toBe('https://team-playroom.pages.dev');
  const joined=await call(path+'/join',{nickname:'Friend'});expect(joined.status).toBe(200);const friend=await joined.json<{credentials:Credentials;room:RoomView}>();
  expect((await call(path+'/state',undefined,'fake')).status).toBe(400);
  expect((await call(path+'/action',{type:'start'},friend.credentials.token)).status).toBe(400);
  const view=await (await call(path+'/state',undefined,host.credentials.token)).json<{credentials:Credentials;room:RoomView}>();expect(view.room.players).toHaveLength(2);expect(JSON.stringify(view)).not.toContain(host.credentials.token);
 });
 it('authenticates hibernation attachments and broadcasts ready changes to both members',async()=>{
  const {call,objects,contexts}=fixture();const host=await (await call('/api/rooms',{nickname:'Host',game:'color-clash',settings:{count:12,scoring:'teams',cue:false}})).json<{credentials:Credentials;room:RoomView}>();
  const code=host.credentials.code;const friend=await (await call('/api/rooms/'+code+'/join',{nickname:'Friend'})).json<{credentials:Credentials;room:RoomView}>();
  const first=new FakeSocket(),second=new FakeSocket();contexts.get(code)!.sockets.push(first,second);
  const room=objects.get(code)!;
  await room.webSocketMessage(first as unknown as WebSocket,JSON.stringify({type:'auth',token:host.credentials.token}));
  await room.webSocketMessage(second as unknown as WebSocket,JSON.stringify({type:'auth',token:friend.credentials.token}));
  await call('/api/rooms/'+code+'/action',{type:'ready',ready:true,team:'A'},host.credentials.token);
  for(const socket of [first,second]){const view=JSON.parse(socket.messages.at(-1)!);expect(view.type).toBe('snapshot');expect(view.room.players[0].ready).toBe(true);expect(view.room.players.every((p:{connected:boolean})=>p.connected)).toBe(true);expect(JSON.stringify(view)).not.toContain(host.credentials.token);}
  const unauth=new FakeSocket();await room.webSocketMessage(unauth as unknown as WebSocket,JSON.stringify({type:'auth',token:'bad'}));expect(unauth.closed).toBe(true);
 });
 it('persists and restores the room after object reconstruction and deletes it on expiry',async()=>{
  const {call,contexts}=fixture();const host=await (await call('/api/rooms',{nickname:'Host',game:'color-clash',settings:{count:12,scoring:'individual',cue:false}})).json<{credentials:Credentials;room:RoomView}>();
  const code=host.credentials.code;const ctx=contexts.get(code)!;const env={ALLOWED_ORIGINS:'',ROOMS:{}};
  const restored=new RoomDurableObject(ctx as unknown as DurableObjectState,env as never);
  const response=await restored.fetch(new Request('https://room/state',{headers:{Authorization:'Bearer '+host.credentials.token}}));expect((await response.json<{credentials:Credentials;room:RoomView}>()).room.code).toBe(code);
  const persisted=await ctx.storage.get('room') as {expiresAt:number};persisted.expiresAt=Date.now()-1;await ctx.storage.put('room',persisted);
  const expired=new RoomDurableObject(ctx as unknown as DurableObjectState,env as never);await ctx.blockConcurrencyWhile(async()=>{});await expired.alarm();expect(await ctx.storage.get('room')).toBeUndefined();
 });
});

