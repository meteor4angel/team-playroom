import type { QuestionCount } from './colorClash';
import type { RecordedAnswer } from './gameTypes';
export type RoomSettings = { count: QuestionCount; scoring: 'individual' | 'teams'; cue: boolean };
export type PlayerView = { id: string; nickname: string; team: 'A' | 'B'; roundTeam: 'A' | 'B'; ready: boolean; active: boolean; connected: boolean; score: number; answered: number; finished: boolean; participated: number };
export type RoomView = { code: string; game: string; hostId: string; revision: number; phase: 'lobby' | 'playing' | 'finished' | 'closed'; settings: RoomSettings; seed: number; round: number; startsAt: number; endsAt: number; expiresAt: number; players: PlayerView[]; you: string; answers: RecordedAnswer[]; serverNow: number };
export type RoomAction =
 | { type: 'settings'; settings: RoomSettings }
 | { type: 'ready'; ready: boolean; team: 'A' | 'B' }
 | { type: 'start' }
 | { type: 'answer'; round: number; index: number; choice: string }
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
