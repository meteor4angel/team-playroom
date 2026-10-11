import { newSeed, questionCounts } from '../src/shared/colorClash';
import type {RecordedAnswer} from '../src/shared/gameTypes';
import type { RoomAction, RoomSettings, RoomView, PlayerView } from '../src/shared/rooms';
import { gameAdapters } from './gameAdapters';
export type Player = Omit<PlayerView, 'connected' | 'answered' | 'score'> & {token: string; answers: RecordedAnswer[]};
export type Room = Omit<RoomView, 'players' | 'you' | 'answers' | 'serverNow'> & {players: Player[]};
function requireValue(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message); }
function nickname(value: unknown): string {
  requireValue(typeof value==='string', 'Enter a nickname.');
  const name=value.trim(); requireValue(name.length>=2 && name.length<=24 && !/[\u0000-\u001f\u007f]/.test(name), 'Use a nickname of 2–24 characters.'); return name;
}
function validateSettings(s: RoomSettings) {
  requireValue(s && questionCounts.includes(s.count) && ['individual','teams'].includes(s.scoring) && typeof s.cue==='boolean','Invalid room settings.');
}
export function createRoom(code: string, name: string, settings: RoomSettings, now: number, game='color-clash'): { room: Room; player: Player } {
  requireValue(gameAdapters[game],'This game does not support rooms yet.');validateSettings(settings);
  const player: Player={id:crypto.randomUUID(),token:crypto.randomUUID()+crypto.randomUUID(),nickname:nickname(name),team:'A',roundTeam:'A',ready:false,active:true,finished:false,participated:0,answers:[]};
  const room: Room={code,game,hostId:player.id,revision:1,phase:'lobby',settings,seed:0,round:0,startsAt:0,endsAt:0,expiresAt:now+2*60*60*1000,players:[player]};
  return {room,player};
}
export function joinRoom(room: Room, name: string, now: number): Player {
  requireValue(now<room.expiresAt && room.phase==='lobby','This room has started or expired. Ask the host for a new lobby.');
  requireValue(room.players.filter(p=>p.active).length<12 && room.players.length<24,'This room is full.');
  const clean=nickname(name); requireValue(!room.players.some(p=>p.active && p.nickname.toLowerCase()===clean.toLowerCase()),'That nickname is already in use.');
  const player: Player={id:crypto.randomUUID(),token:crypto.randomUUID()+crypto.randomUUID(),nickname:clean,team:room.players.filter(p=>p.active).length%2?'B':'A',roundTeam:'A',ready:false,active:true,finished:false,participated:0,answers:[]};
  room.players.push(player); room.revision++; return player;
}
export function authorize(room: Room, token: string): Player {
  const player=room.players.find(p=>p.token===token && p.active); requireValue(player,'Room session not found. Join the room again.'); return player;
}
export function settle(room: Room, now: number): boolean {
  let changed=false;
  if(now>=room.expiresAt && room.phase!=='closed') {room.phase='closed';changed=true;}
  else if(room.phase==='playing' && (now>=room.endsAt || room.players.filter(p=>p.active).every(p=>p.finished))) {room.phase='finished';changed=true;}
  if(changed) room.revision++; return changed;
}
export function act(room: Room, player: Player, action: RoomAction, now: number, seedFactory=newSeed): void {
  settle(room,now); requireValue(room.phase!=='closed','This room has expired. Create a new room.');
  const host=room.hostId===player.id;
  const before=room.phase==='lobby'||room.phase==='finished';
  switch(action.type) {
    case 'settings':
      requireValue(host && before,'Only the host can change settings between rounds.');validateSettings(action.settings);
      room.settings=action.settings; room.players.forEach(p=>p.ready=false); room.phase='lobby'; break;
    case 'ready':
      requireValue(before && typeof action.ready==='boolean' && ['A','B'].includes(action.team),'Readiness can only change between rounds.');
      player.ready=action.ready; player.team=action.team; break;
    case 'start': {
      requireValue(host && before,'Only the host can start or rematch between rounds.');
      const active=room.players.filter(p=>p.active);
      requireValue(active.length>=2 && active.every(p=>p.ready),'At least two players must join and everyone must be ready.');
      requireValue(room.settings.scoring!=='teams'||(['A','B'].every(t=>active.some(p=>p.team===t))),'Both teams need at least one player.');
      const seed=seedFactory(room.seed); requireValue(seed!==room.seed,'Rematch needs a new seed.');
      room.seed=seed; room.round++; room.startsAt=now+5000; room.endsAt=room.startsAt+10*60*1000; room.phase='playing';
      active.forEach(p=>{p.answers=[];p.finished=false;p.ready=false;p.participated=room.round;p.roundTeam=p.team;}); break;
    }
    case 'answer': {
      requireValue(action.round===room.round,'The round changed. Please reconnect.');
      requireValue(Number.isInteger(action.index) && action.index>=0 && gameAdapters[room.game].validChoice(action.choice),'Invalid answer.');
      if(action.index<player.answers.length) {requireValue(player.answers[action.index].choice===action.choice,'That answer is already recorded.');return;}
      requireValue(room.phase==='playing' && now>=room.startsAt && now<room.endsAt && !player.finished,'This round is not accepting answers.');
      requireValue(action.index===player.answers.length && action.index<room.settings.count,'Answer questions in order.');
      player.answers.push(gameAdapters[room.game].answer(room.seed,room.settings,action.index,action.choice));
      player.finished=player.answers.length===room.settings.count; settle(room,now); break;
    }
    case 'finish': requireValue(host && room.phase==='playing','Only the host can end an active round.');room.phase='finished';break;
    case 'leave':
      player.active=false;
      if(host) room.hostId=room.players.find(p=>p.active)?.id ?? '';
      if(!room.players.some(p=>p.active)) room.phase='closed';else settle(room,now);break;
    default: throw new Error('Unknown room action.');
  }
  room.revision++;
}
export function snapshot(room: Room, player: Player, connected: Set<string>, now: number): RoomView {
  return { ...room,players:room.players.map(({token: _token, answers, ...p})=>({...p,score:gameAdapters[room.game].score(answers),answered:answers.length,connected:connected.has(p.id)})),you:player.id,answers:player.answers,serverNow:now };
}
