import {validMajorityChoice} from '../src/shared/majority';
import {extraSlugs,specs,puzzleQuestions,puzzlePoints} from '../src/shared/collection';
import {colors,makeQuestions,score,type ColorName} from '../src/shared/colorClash';
import type {RecordedAnswer} from '../src/shared/gameTypes';
import type {RoomSettings} from '../src/shared/rooms';
export type GameAdapter = {collective?: boolean;activity?:'spotlight'|'chain'|'bingo'; validChoice(choice: string): boolean; answer(seed: number, settings: RoomSettings, index: number, choice: string): RecordedAnswer; score(answers: RecordedAnswer[]): number};
export const gameAdapters: Record<string,GameAdapter>={
 'guess-the-majority':{collective:true,validChoice:validMajorityChoice,score,answer:(_seed,_settings,_index,choice)=>({choice,correct:false})},
 'color-clash': {
  validChoice: choice=>colors.some(c=>c.name===choice),
  score,
  answer: (seed,settings,index,choice)=>({choice:choice as ColorName,correct:choice===makeQuestions(seed,settings.count)[index].ink}),
 },
};
for(const game of extraSlugs){const spec=specs[game];gameAdapters[game]={
 collective:spec.kind==='poll',activity:spec.kind==='spotlight'||spec.kind==='chain'||spec.kind==='bingo'?spec.kind:undefined,
 validChoice:choice=>typeof choice==='string'&&(spec.kind==='poll'?/^[AB]$/.test(choice):spec.kind==='spotlight'?choice.trim().length>=2&&choice.trim().length<=160&&!/[\u0000-\u001f\u007f]/.test(choice):choice.length>0&&choice.length<=160),
 answer:(seed,settings,index,choice)=>spec.kind==='puzzle'?{choice,...puzzlePoints(puzzleQuestions(game,seed,settings.count)[index],choice)}:{choice:choice.trim(),correct:false,points:0},
 score:answers=>spec.competitive?answers.reduce((sum,a)=>sum+(a.points??(a.correct?100:0)),0):0,
};}

gameAdapters['this-or-that-office-edition'].collective=false;gameAdapters['this-or-that-office-edition'].activity='spotlight';
