import {describe,expect,it} from 'vitest';
import {act,authorize,createRoom,joinRoom,settle,snapshot} from './roomEngine';
import {makeQuestions} from '../src/shared/colorClash';
import {leaderboard} from '../src/shared/rooms';
function fixture(){const {room,player:host}=createRoom('ABCDEFGH','Host',{count:8,scoring:'teams',cue:false},1000);const friend=joinRoom(room,'Friend',1000);return {room,host,friend};}
describe('shared room lifecycle',()=>{
 it('requires host permission, readiness, and two populated teams',()=>{
  const {room,host,friend}=fixture();
  expect(()=>act(room,friend,{type:'start'},1000)).toThrow('Only the host');
  expect(()=>act(room,host,{type:'start'},1000)).toThrow('ready');
  act(room,host,{type:'ready',ready:true,team:'A'},1000);act(room,friend,{type:'ready',ready:true,team:'A'},1000);
  expect(()=>act(room,host,{type:'start'},1000)).toThrow('Both teams');
  act(room,friend,{type:'ready',ready:true,team:'B'},1000);act(room,host,{type:'start'},1000,()=>849251);
  expect(room.startsAt).toBe(6000);expect(room.seed).toBe(849251);
  expect(()=>joinRoom(room,'Late',7000)).toThrow('started');
 });
 it('scores on the server, rejects stale/out-of-order answers and permits identical retries',()=>{
  const {room,host,friend}=fixture();
  for(const p of [host,friend])act(room,p,{type:'ready',ready:true,team:p.team},1000);
  act(room,host,{type:'start'},1000,()=>111);
  const choice=makeQuestions(111,8)[0].ink;
  expect(()=>act(room,host,{type:'answer',round:1,index:0,choice},2000)).toThrow('not accepting');
  expect(()=>act(room,host,{type:'answer',round:1,index:1,choice},6000)).toThrow('order');
  expect(()=>act(room,host,{type:'answer',round:0,index:0,choice},6000)).toThrow('round changed');
  act(room,host,{type:'answer',round:1,index:0,choice},6000);act(room,host,{type:'answer',round:1,index:0,choice},6000);
  expect(host.answers).toHaveLength(1);expect(snapshot(room,host,new Set(),6000).players[0].score).toBe(100);
  expect(()=>act(room,host,{type:'answer',round:1,index:0,choice:choice==='Red'?'Blue':'Red'},6000)).toThrow('already recorded');
 });
 it('completes both players, ranks contributions, and rematches with a different seed',()=>{
  const {room,host,friend}=fixture();for(const p of [host,friend])act(room,p,{type:'ready',ready:true,team:p.team},1000);act(room,host,{type:'start'},1000,()=>111);
  for(const p of [host,friend])for(const [index,q] of makeQuestions(111,8).entries())act(room,p,{type:'answer',round:1,index,choice:q.ink},6000);
  expect(room.phase).toBe('finished');const view=snapshot(room,host,new Set(),6000);const table=leaderboard(view.players,1);
  expect(table.individuals.map(p=>p.rank)).toEqual([1,1]);expect(table.teams.map(t=>t.score)).toEqual([800,800]);
  act(room,friend,{type:'ready',ready:true,team:'A'},7000);expect(leaderboard(snapshot(room,host,new Set(),7000).players,1).teams.map(t=>t.score)).toEqual([800,800]);
  act(room,friend,{type:'ready',ready:true,team:'B'},7000);act(room,host,{type:'ready',ready:true,team:'A'},7000);act(room,host,{type:'start'},7000,()=>222);
  expect(room.seed).toBe(222);expect(room.round).toBe(2);expect(host.answers).toHaveLength(0);expect(makeQuestions(111,8)).not.toEqual(makeQuestions(222,8));
 });
 it('restricts settings, resets readiness and hides session tokens',()=>{
  const {room,host,friend}=fixture();expect(()=>act(room,friend,{type:'settings',settings:{count:20,scoring:'individual',cue:true}},1000)).toThrow('Only the host');
  act(room,host,{type:'ready',ready:true,team:'A'},1000);act(room,host,{type:'settings',settings:{count:20,scoring:'individual',cue:true}},1000);expect(host.ready).toBe(false);
  expect(JSON.stringify(snapshot(room,host,new Set(),1000))).not.toContain(host.token);expect(()=>authorize(room,'fake')).toThrow();
 });
 it('transfers host on leave and expires rooms and unfinished rounds',()=>{
  const {room,host,friend}=fixture();act(room,host,{type:'leave'},1000);expect(room.hostId).toBe(friend.id);expect(()=>authorize(room,host.token)).toThrow();
  settle(room,room.expiresAt);expect(room.phase).toBe('closed');
  const other=fixture();for(const p of [other.host,other.friend])act(other.room,p,{type:'ready',ready:true,team:p.team},1000);act(other.room,other.host,{type:'start'},1000,()=>111);settle(other.room,other.room.endsAt);expect(other.room.phase).toBe('finished');
 });
 it('rejects duplicate nicknames and caps membership',()=>{
  const {room}=fixture();expect(()=>joinRoom(room,'host',1000)).toThrow('already in use');for(let i=0;i<10;i++)joinRoom(room,'Player '+i,1000);expect(()=>joinRoom(room,'Overflow',1000)).toThrow('full');
 });
});
