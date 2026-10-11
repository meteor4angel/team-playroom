import {describe,it,expect} from 'vitest';
import {act,createRoom,joinRoom,snapshot,settle} from './roomEngine';
import {majorityQuestions,correctPrediction,revealVotes,validMajorityChoice} from '../src/shared/majority';
function setup(){const {room,player:host}=createRoom('ABCDEFGH','Host',{count:8,scoring:'teams',cue:false},1000,'guess-the-majority');const friend=joinRoom(room,'Friend',1000);const third=joinRoom(room,'Third',1000);for(const p of [host,friend,third])act(room,p,{type:'ready',ready:true,team:p.team},1000);act(room,host,{type:'start'},1000,()=>123);return {room,host,friend,third};}
describe('majority rounds',()=>{
 it('generates stable, distinct prompts and accepts only two-part ballots',()=>{
  const a=majorityQuestions(123,20);expect(a).toEqual(majorityQuestions(123,20));expect(new Set(a.map(p=>p.question)).size).toBe(20);expect(a).not.toEqual(majorityQuestions(124,20));expect(validMajorityChoice('AB')).toBe(true);expect(validMajorityChoice('A')).toBe(false);expect(()=>majorityQuestions(0,8)).toThrow();
 });
 it('awards points for predictions independently of preference, including ties',()=>{
  const result=revealVotes(0,['AA','AB','BA']);expect(result.majority).toBe('A');expect(correctPrediction('BA',result)).toBe(true);expect(correctPrediction('AB',result)).toBe(false);const tie=revealVotes(0,['AA','BB']);expect(correctPrediction('AB',tie)).toBe(true);expect(correctPrediction('BA',tie)).toBe(true);expect(correctPrediction('AA',revealVotes(0,[]))).toBe(false);
 });
 it('hides other ballots and scores until all votes, then advances together',()=>{
  const {room,host,friend,third}=setup();act(room,host,{type:'answer',round:1,index:0,choice:'BA'},6000);const view=snapshot(room,friend,new Set(),6000);expect(view.answers).toEqual([]);expect(JSON.stringify(view)).not.toContain(host.token);expect(view.players[0].score).toBe(0);expect(view.majority?.reveals).toEqual([]);
  expect(()=>act(room,host,{type:'answer',round:1,index:1,choice:'AA'},6000)).toThrow('Wait');act(room,friend,{type:'answer',round:1,index:0,choice:'AB'},6000);act(room,third,{type:'answer',round:1,index:0,choice:'AA'},6000);
  expect(room.majority?.index).toBe(1);expect(room.majority?.reveals[0]).toEqual({index:0,A:2,B:1,majority:'A',voters:3});expect(snapshot(room,host,new Set(),6000).players.map(p=>p.score)).toEqual([100,0,100]);act(room,host,{type:'answer',round:1,index:0,choice:'BA'},6000);expect(room.majority?.reveals).toHaveLength(1);
 });
 it('finishes all questions and resets shared state on rematch',()=>{
  const {room,host,friend,third}=setup();for(let i=0;i<8;i++)for(const p of [host,friend,third])act(room,p,{type:'answer',round:1,index:i,choice:'AA'},6000);
  expect(room.phase).toBe('finished');expect(room.majority?.reveals).toHaveLength(8);expect(snapshot(room,host,new Set(),6000).players.every(p=>p.score===800)).toBe(true);
  for(const p of [host,friend,third])act(room,p,{type:'ready',ready:true,team:p.team},7000);act(room,host,{type:'start'},7000,()=>456);expect(room.seed).toBe(456);expect(room.majority).toEqual({index:0,reveals:[]});expect(host.answers).toEqual([]);expect(()=>act(room,friend,{type:'answer',round:1,index:0,choice:'AA'},13000)).toThrow('round changed');
 });
 it('unblocks voting when a non-voter leaves and preserves submitted votes',()=>{
  const {room,host,friend,third}=setup();act(room,host,{type:'answer',round:1,index:0,choice:'AB'},6000);act(room,friend,{type:'answer',round:1,index:0,choice:'BB'},6000);act(room,third,{type:'leave'},6000);expect(room.majority?.reveals[0].majority).toBe('tie');expect(host.answers[0].correct).toBe(true);expect(friend.answers[0].correct).toBe(true);
 });
 it('resolves submitted partial ballots on timeout or host finish',()=>{
  const {room,host,friend}=setup();act(room,friend,{type:'answer',round:1,index:0,choice:'BB'},6000);expect(()=>act(room,friend,{type:'finish'},6000)).toThrow('Only');act(room,host,{type:'finish'},6000);expect(friend.answers[0].correct).toBe(true);expect(room.majority?.reveals[0].voters).toBe(1);
  const other=setup();act(other.room,other.host,{type:'answer',round:1,index:0,choice:'AA'},6000);settle(other.room,other.room.endsAt);expect(other.room.phase).toBe('finished');expect(other.host.answers[0].correct).toBe(true);
 });
});
