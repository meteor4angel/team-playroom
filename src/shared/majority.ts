import {questionCounts,type QuestionCount} from './colorClash';
export type Pick='A'|'B';
export type MajorityPrompt={question:string;A:string;B:string};
export type MajorityReveal={index:number;A:number;B:number;majority:Pick|'tie';voters:number};
export const prompts:MajorityPrompt[]=[
 ['Your ideal team break?','A coffee chat','A quick game'],
 ['How do you like to plan?','A detailed checklist','Room to improvise'],
 ['Your preferred meeting time?','Morning','Afternoon'],
 ['For a tricky problem?','Think alone first','Brainstorm together'],
 ['A team celebration?','Shared lunch','An activity together'],
 ['Your desk style?','Clear and minimal','Full of personality'],
 ['A free afternoon?','Explore somewhere new','Relax somewhere familiar'],
 ['Learning something new?','Watch a demo','Try it hands-on'],
 ['Your ideal project rhythm?','Small daily milestones','One big weekly goal'],
 ['Team communication?','A quick call','A thoughtful message'],
 ['A snack to share?','Something sweet','Something savory'],
 ['Your travel style?','Plan the itinerary','Follow your curiosity'],
 ['A creative session?','Music in the background','Peace and quiet'],
 ['An unexpected challenge?','Start with research','Start with an experiment'],
 ['Team trivia category?','Movies and music','Science and nature'],
 ['Your weekend pace?','Get out and about','Stay in and recharge'],
 ['Your workday break?','A short walk','A quiet sit-down'],
 ['Receiving feedback?','Talk it through','Read it and reflect'],
 ['A team mascot?','A curious cat','An enthusiastic dog'],
 ['A shared adventure?','A mountain trail','A seaside escape'],
 ['Your note-taking style?','Typed and searchable','Handwritten and sketched'],
 ['A new idea arrives?','Make a quick prototype','Sketch the whole concept'],
 ['An office treat?','Pizza','Tacos'],
 ['A friendly contest?','Word puzzles','Visual puzzles'],
 ['A rainy day?','A good book','A good film'],
 ['A team playlist?','Upbeat favorites','Calm background tunes'],
 ['A project kickoff?','Start with the big picture','Start with the first step'],
 ['A tiny superpower?','Always find lost things','Always remember names'],
 ['A workspace upgrade?','Better lighting','A more comfortable chair'],
 ['Your ideal team ritual?','Share a weekly win','Ask a fun weekly question'],
 ['Trying a new hobby?','Take a class','Learn by exploring'],
 ['A surprise day off?','Make spontaneous plans','Enjoy having no plans'],
].map(([question,A,B])=>({question,A,B}));
export function majorityQuestions(seed:number,count:QuestionCount):MajorityPrompt[]{
 if(!Number.isInteger(seed)||seed<1||seed>2147483646||!questionCounts.includes(count))throw new Error('Invalid round settings.');
 let state=seed;const random=()=>{state=state*16807%2147483647;return(state-1)/2147483646;};
 const pool=prompts.map(p=>({...p}));for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,count).map(p=>random()<.5?p:{question:p.question,A:p.B,B:p.A});
}
export function validMajorityChoice(choice:string){return typeof choice==='string'&&/^[AB]{2}$/.test(choice);}
export function revealVotes(index:number,choices:string[]):MajorityReveal{
 const A=choices.filter(c=>c[0]==='A').length;const B=choices.length-A;
 return {index,A,B,majority:A===B?'tie':A>B?'A':'B',voters:choices.length};
}
export function correctPrediction(choice:string,reveal:MajorityReveal){return reveal.voters>0&&(reveal.majority==='tie'||choice[1]===reveal.majority);}
export function simulatedChoices(seed:number,index:number):string[]{
 let state=(seed+index*7919)%2147483646+1;
 return Array.from({length:5},()=>{state=state*16807%2147483647;return state%2?'AA':'BB';});
}
