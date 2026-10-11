import {colors,makeQuestions,score,type ColorName} from '../src/shared/colorClash';
import type {RecordedAnswer} from '../src/shared/gameTypes';
import type {RoomSettings} from '../src/shared/rooms';
export type GameAdapter = {validChoice(choice: string): boolean; answer(seed: number, settings: RoomSettings, index: number, choice: string): RecordedAnswer; score(answers: RecordedAnswer[]): number};
export const gameAdapters: Record<string,GameAdapter>={
 'color-clash': {
  validChoice: choice=>colors.some(c=>c.name===choice),
  score,
  answer: (seed,settings,index,choice)=>({choice:choice as ColorName,correct:choice===makeQuestions(seed,settings.count)[index].ink}),
 },
};
