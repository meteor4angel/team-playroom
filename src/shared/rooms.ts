import type {MajorityReveal} from './majority';
import type { QuestionCount } from './colorClash';
import type { ActivityState, RecordedAnswer } from './gameTypes';
export type RoomSettings = { count: QuestionCount; scoring: 'individual' | 'teams'; cue: boolean; timer?:number;turnTimer?:number;content?:import('./facilitation').Card[] };
export type PlayerView = { id: string; nickname: string; team: 'A' | 'B'; roundTeam: 'A' | 'B'; ready: boolean; active: boolean; connected: boolean; score: number; answered: number; finished: boolean; participated: number };
export type RoomView = { code: string; game: string; hostId: string; revision: number; phase: 'lobby' | 'playing' | 'finished' | 'closed'; settings: RoomSettings; seed: number; round: number; startsAt: number; endsAt: number; expiresAt: number; activity?:ActivityState; majority?: {index:number;reveals:MajorityReveal[]}; players: PlayerView[]; you: string; answers: RecordedAnswer[]; serverNow: number };
export type RoomAction =
 | { type: 'settings'; settings: RoomSettings }
 | { type: 'ready'; ready: boolean; team: 'A' | 'B' }
 | { type: 'start' }
 | { type: 'answer'; round: number; index: number; choice: string }
 | { type:'chain';round:number;index:number;word:string }
 | { type:'skip';round:number;turnId:string }
 | { type:'bingo';round:number;marks:number[] }
 | { type:'advance';round:number;index:number }
 | { type:'revote';round:number;index:number }
 | { type: 'finish' }
 | { type: 'leave' };
export type Credentials = { code: string; playerId: string; token: string };
export function leaderboard(players: PlayerView[], round: number) {
  const individuals = players.filter(p => p.participated === round).sort((a,b)=>b.score-a.score || a.nickname.localeCompare(b.nickname));
  let previousScore = -1, rank = 0;
  const ranked = individuals.map((p,i) => { if (p.score !== previousScore) { rank=i+1; previousScore=p.score; } return {...p,rank}; });
  const teams = (['A','B'] as const).map(team=>({team,score:individuals.filter(p=>p.roundTeam===team).reduce((total,p)=>total+p.score,0)}));
  return {individuals: ranked, teams};
}
