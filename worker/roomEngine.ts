import {roundCount,sessionCards,validateContent,pokerValues,validSentence} from '../src/shared/facilitation';
import {isCompetitive,startingLetter,validWord,normalizeWord,bingoLines} from '../src/shared/collection';
import {revealVotes,correctPrediction} from '../src/shared/majority';
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
function validateSettings(s: RoomSettings,game='color-clash') {
  requireValue(s && questionCounts.includes(s.count) && ['individual','teams'].includes(s.scoring) && typeof s.cue==='boolean','Invalid room settings.');
  requireValue(s.timer===undefined||[0,60,180,300,600].includes(s.timer),'Invalid round timer.');
  requireValue(s.turnTimer===undefined||[0,15,30,60,120].includes(s.turnTimer),'Invalid turn timer.');
  validateContent(game,s.content);
}
export function createRoom(code: string, name: string, settings: RoomSettings, now: number, game='color-clash'): { room: Room; player: Player } {
  requireValue(typeof game==='string'&&Object.hasOwn(gameAdapters,game),'This game does not support rooms yet.');validateSettings(settings,game);
  if(!isCompetitive(game))settings={...settings,scoring:'individual',cue:false};
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
function resolveCollective(room:Room,force=false):void {
 if(!room.majority||room.majority.index>=roundCount(room.game,room.settings))return;
 const index=room.majority.index;
 const active=room.players.filter(p=>p.active&&p.participated===room.round);
 if(!force&&!active.every(p=>p.answers[index]))return;
 const voters=room.players.filter(p=>p.participated===room.round&&p.answers[index]);
 if(!voters.length)return;
 const reveal=revealVotes(index,voters.map(p=>p.answers[index].choice));
 voters.forEach(p=>p.answers[index].correct=room.game==='guess-the-majority'&&correctPrediction(p.answers[index].choice,reveal));
 room.majority.reveals.push(reveal);room.majority.index++;
}
function resolveActivity(room:Room,force=false):void {
 if(gameAdapters[room.game].activity!=='spotlight'||!room.activity||room.activity.index>=roundCount(room.game,room.settings))return;
 if(['sprint-spotlight','this-or-that-office-edition'].includes(room.game))return;
 const index=room.activity.index;const active=room.players.filter(p=>p.active&&p.participated===room.round);
 if(!force&&!active.every(p=>p.answers[index]))return;
 const voters=room.players.filter(p=>p.participated===room.round&&p.answers[index]);if(!voters.length)return;
 room.activity.reveals.push({index,entries:voters.map(p=>({id:p.id,nickname:p.nickname,text:p.answers[index].choice}))});room.activity.index++;
}
function advanceTurn(room:Room,previous:string){if(!room.activity)return;const roster=room.players.filter(p=>p.participated===room.round);const index=roster.findIndex(p=>p.id===previous);for(let i=1;i<=roster.length;i++){const next=roster[(index+i)%roster.length];if(next.active){room.activity.turnId=next.id;return;}}room.activity.turnId='';}
function revealBallots(room:Room,force=false){
 if(!['sprint-spotlight','this-or-that-office-edition'].includes(room.game)||!room.activity||room.activity.revealed)return;
 const active=room.players.filter(p=>p.active&&p.participated===room.round);const ballots=room.activity.ballots??{};
 if(!force&&!active.every(p=>ballots[p.id]!==undefined))return;
 const entries=room.players.filter(p=>p.participated===room.round&&ballots[p.id]!==undefined).map(p=>({id:p.id,nickname:p.nickname,text:ballots[p.id]}));
 room.activity.reveals.push({index:room.activity.index,entries});room.activity.revealed=true;if(room.activity.reveals.length>24)room.activity.reveals.shift();
}
function finishStoryTurn(room:Room,player:Player,text:string,now:number){
 const state=room.activity!;state.chain.push({id:player.id,nickname:player.nickname,word:text});state.index++;
 player.answers.push({choice:text,correct:false,points:0});
 if(state.index>=room.settings.count){room.phase='finished';room.players.filter(p=>p.active).forEach(p=>p.finished=true);state.turnEndsAt=0;}
 else{advanceTurn(room,player.id);state.turnEndsAt=room.settings.turnTimer?now+room.settings.turnTimer*1000:0;}
}
export function settle(room: Room, now: number): boolean {
  let changed=false;
  if(room.phase==='playing'&&room.game==='collaborative-word-chain'&&room.activity?.turnEndsAt&&now>=room.activity.turnEndsAt&&now<room.endsAt&&now<room.expiresAt){const current=room.players.find(p=>p.id===room.activity!.turnId);if(current){finishStoryTurn(room,current,'[Turn skipped: time expired.]',now);changed=true;}}
  if(now>=room.expiresAt && room.phase!=='closed') {room.phase='closed';changed=true;}
  else if(room.phase==='playing' && (now>=room.endsAt || (room.game!=='sprint-bingo'&&room.players.filter(p=>p.active).every(p=>p.finished)))) {resolveCollective(room,true);resolveActivity(room,true);revealBallots(room,true);room.phase='finished';changed=true;}
  if(changed) room.revision++; return changed;
}
export function act(room: Room, player: Player, action: RoomAction, now: number, seedFactory=newSeed): void {
  settle(room,now); requireValue(room.phase!=='closed','This room has expired. Create a new room.');
  const host=room.hostId===player.id;
  const before=room.phase==='lobby'||room.phase==='finished';
  switch(action.type) {
    case 'settings':
      requireValue(host && before,'Only the host can change settings between rounds.');validateSettings(action.settings,room.game);
      room.settings=isCompetitive(room.game)?action.settings:{...action.settings,scoring:'individual',cue:false}; room.players.forEach(p=>p.ready=false); room.phase='lobby'; break;
    case 'ready':
      requireValue(before && typeof action.ready==='boolean' && ['A','B'].includes(action.team),'Readiness can only change between rounds.');
      player.ready=action.ready; player.team=action.team; break;
    case 'start': {
      requireValue(host && before,'Only the host can start or rematch between rounds.');
      const active=room.players.filter(p=>p.active);
      requireValue(active.length>=2 && active.every(p=>p.ready),'At least two players must join and everyone must be ready.');
      requireValue(room.settings.scoring!=='teams'||(['A','B'].every(t=>active.some(p=>p.team===t))),'Both teams need at least one player.');
      let seed=seedFactory(room.seed);
      if(room.game==='collaborative-word-chain'&&room.round>0){while(seed%active.length===room.seed%active.length)seed=newSeed(room.seed);} requireValue(seed!==room.seed,'Rematch needs a new seed.');
      room.majority=gameAdapters[room.game].collective?{index:0,reveals:[]}:undefined;
      room.activity=gameAdapters[room.game].activity?{index:0,reveals:[],chain:[],turnId:active[seed%active.length].id,marks:Object.fromEntries(active.map(p=>[p.id,[12]])),ballots:{},revealed:false,turnEndsAt:room.settings.turnTimer?now+5000+room.settings.turnTimer*1000:0}:undefined;
      room.seed=seed; room.round++; room.startsAt=now+5000; room.endsAt=room.startsAt+(room.settings.timer||600)*1000; room.phase='playing';
      active.forEach(p=>{p.answers=[];p.finished=false;p.ready=false;p.participated=room.round;p.roundTeam=p.team;}); break;
    }
    case 'answer': {
      if(['sprint-spotlight','this-or-that-office-edition'].includes(room.game)){
       requireValue(action.round===room.round&&room.phase==='playing'&&now>=room.startsAt&&now<room.endsAt,'This round is not accepting votes.');
       const state=room.activity!;requireValue(action.index===state.index&&!state.revealed,'Wait for the facilitator to open a vote.');
       const options=room.game==='sprint-spotlight'?pokerValues:sessionCards(room.game,room.seed,room.settings)[state.index].options!.map((_,i)=>String(i));
       requireValue(options.includes(action.choice),'Choose a listed option.');
       const existing=state.ballots?.[player.id];if(existing!==undefined){requireValue(existing===action.choice,'Your vote is already recorded.');return;}
       state.ballots={...state.ballots,[player.id]:action.choice};revealBallots(room);break;
      }

      requireValue(!['chain','bingo'].includes(gameAdapters[room.game].activity??''),'Use this game’s activity controls.');
      requireValue(action.round===room.round,'The round changed. Please reconnect.');
      requireValue(Number.isInteger(action.index) && action.index>=0 && gameAdapters[room.game].validChoice(action.choice),'Invalid answer.');
      if(action.index<player.answers.length) {requireValue(player.answers[action.index].choice===action.choice,'That answer is already recorded.');return;}
      requireValue(room.phase==='playing' && now>=room.startsAt && now<room.endsAt && !player.finished,'This round is not accepting answers.');
      requireValue(action.index===player.answers.length && action.index<roundCount(room.game,room.settings),'Answer questions in order.');
      requireValue(!room.majority||action.index===room.majority.index,'Wait for everyone to vote before the next question.');
      requireValue(gameAdapters[room.game].activity!=='spotlight'||action.index===room.activity?.index,'Wait for everyone to respond.');
      player.answers.push(gameAdapters[room.game].answer(room.seed,room.settings,action.index,action.choice));
      player.finished=player.answers.length===roundCount(room.game,room.settings); resolveCollective(room);resolveActivity(room); settle(room,now); break;
    }
    case 'chain': {
      requireValue(gameAdapters[room.game].activity==='chain'&&room.activity,'This room is not a word chain.');
      requireValue(action.round===room.round,'The round changed. Please reconnect.');
      const text=typeof action.word==='string'?action.word.trim():'';const previous=room.activity.chain[action.index];
      if(previous){requireValue(previous.id===player.id&&previous.word===text,'That turn is already recorded.');return;}
      requireValue(room.phase==='playing'&&now>=room.startsAt&&now<room.endsAt,'This round is not accepting sentences.');
      requireValue(room.activity.turnId===player.id&&action.index===room.activity.chain.length,'Wait for your turn.');
      requireValue(validSentence(text),'Use a sentence of 10–240 characters.');finishStoryTurn(room,player,text,now);break;
    }
    case 'skip': {
      requireValue(host&&room.phase==='playing'&&now>=room.startsAt&&gameAdapters[room.game].activity==='chain'&&room.activity,'Only the host can skip an active story turn.');
      requireValue(action.round===room.round&&action.turnId===room.activity.turnId,'The turn changed.');const current=room.players.find(p=>p.id===room.activity!.turnId)!;finishStoryTurn(room,current,'[Turn skipped by facilitator.]',now);break;
    }
    case 'advance':case 'revote': {
      requireValue(host&&room.phase==='playing'&&['sprint-spotlight','this-or-that-office-edition'].includes(room.game)&&room.activity,'Only the facilitator can control this vote.');
      requireValue(action.round===room.round&&action.index===room.activity.index,'The task changed.');
      requireValue(room.activity.revealed,'Wait for the shared reveal.');
      if(action.type==='advance'){room.activity.index++;if(room.activity.index>=roundCount(room.game,room.settings)){room.phase='finished';room.players.filter(p=>p.active).forEach(p=>p.finished=true);}}
      room.activity.ballots={};room.activity.revealed=false;break;
    }
    case 'bingo': {
      requireValue(gameAdapters[room.game].activity==='bingo'&&room.activity&&room.phase==='playing'&&now>=room.startsAt&&now<room.endsAt,'This room is not accepting bingo marks.');
      requireValue(action.round===room.round,'The round changed. Please reconnect.');
      requireValue(Array.isArray(action.marks)&&action.marks.length<=25&&new Set(action.marks).size===action.marks.length&&action.marks.every(i=>Number.isInteger(i)&&i>=0&&i<25),'Invalid bingo cells.');
      room.activity.marks[player.id]=Array.from(new Set([...action.marks,12])).sort((a,b)=>a-b);player.finished=bingoLines(room.activity.marks[player.id])>0;if(player.finished&&!room.activity.firstBingo)room.activity.firstBingo={ids:[player.id],at:now};else if(player.finished&&room.activity.firstBingo?.at===now&&!room.activity.firstBingo.ids.includes(player.id))room.activity.firstBingo.ids.push(player.id);settle(room,now);break;
    }
    case 'finish': requireValue(host && room.phase==='playing','Only the host can end an active round.');resolveCollective(room,true);resolveActivity(room,true);revealBallots(room,true);room.phase='finished';break;
    case 'leave':
      player.active=false;
      if(host) room.hostId=room.players.find(p=>p.active)?.id ?? '';
      if(!room.players.some(p=>p.active)) room.phase='closed';else {resolveCollective(room);resolveActivity(room);revealBallots(room);if(room.activity?.turnId===player.id){advanceTurn(room,player.id);room.activity.turnEndsAt=room.settings.turnTimer?now+room.settings.turnTimer*1000:0;}settle(room,now);}break;
    default: throw new Error('Unknown room action.');
  }
  room.revision++;
}
export function snapshot(room: Room, player: Player, connected: Set<string>, now: number): RoomView {
  return { ...room,activity:room.activity?{...room.activity,ballots:room.activity.ballots?.[player.id]!==undefined?{[player.id]:room.activity.ballots[player.id]}:{},submissions:Object.keys(room.activity.ballots??{}),chain:room.game==='collaborative-word-chain'&&room.phase==='playing'?room.activity.chain.slice(-1):room.activity.chain}:undefined,players:room.players.map(({token: _token, answers, ...p})=>({...p,score:gameAdapters[room.game].score(answers),answered:gameAdapters[room.game].activity==='bingo'?(room.activity?.marks[p.id]?.length??1)-1:answers.length,connected:connected.has(p.id)})),you:player.id,answers:player.answers,serverNow:now };
}
