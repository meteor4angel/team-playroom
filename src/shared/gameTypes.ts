export type RecordedAnswer = {choice: string; correct: boolean;points?:number};
export type ActivityReveal={index:number;entries:{id:string;nickname:string;text:string}[]};
export type ChainEntry={id:string;nickname:string;word:string};
export type ActivityState={index:number;reveals:ActivityReveal[];ballots?:Record<string,string>;submissions?:string[];revealed?:boolean;turnEndsAt?:number;firstBingo?:{ids:string[];at:number};chain:ChainEntry[];turnId:string;marks:Record<string,number[]>};
