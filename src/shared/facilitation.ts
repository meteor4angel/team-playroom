import {rng,shuffle} from './random';
import {activityQuestions,bingoCard,type ExtraSlug} from './collection';
import type {RoomSettings} from './rooms';
export type Card={question:string;options?:string[]};
export const pokerValues=['0','1','2','3','5','8','13','21','?','Pass'];
export const facilitatedGames=['this-or-that-office-edition','sprint-spotlight','collaborative-word-chain','sprint-bingo'];
export const isFacilitated=(game:string)=>facilitatedGames.includes(game);
export function validateContent(game:string,cards:Card[]|undefined){
 if(cards===undefined||cards.length===0)return;
 if(!Array.isArray(cards)||cards.length>24)throw new Error('Use at most 24 content entries.');
 if(game==='sprint-bingo'&&cards.length!==24)throw new Error('Bingo needs exactly 24 unique prompts.');
 if(game!=='sprint-bingo'&&cards.length>12)throw new Error('Use at most 12 questions or tasks.');
 if(!['this-or-that-office-edition','sprint-spotlight','sprint-bingo'].includes(game))throw new Error('This game uses generated content.');
 for(const card of cards){if(!card||typeof card.question!=='string'||card.question.trim().length<3||card.question.length>100||/[\u0000-\u001f\u007f]/.test(card.question))throw new Error('Each prompt needs 3–100 characters.');
 if(game==='this-or-that-office-edition'&&(!Array.isArray(card.options)||card.options.length<2||card.options.length>3||card.options.some(o=>typeof o!=='string'||o.trim().length<1||o.length>40||/[\u0000-\u001f\u007f]/.test(o))||new Set(card.options.map(o=>o.trim().toLowerCase())).size!==card.options.length))throw new Error('Use two or three distinct options, each at most 40 characters.');}
 if(new Set(cards.map(c=>c.question.trim().toLowerCase())).size!==cards.length)throw new Error('Use distinct prompts.');
 if(JSON.stringify(cards).length>3000)throw new Error('Shorten the content to fit the room limit (3,000 characters).');
}
const tasks=['Add keyboard navigation to the dashboard','Design an export preview','Handle a failed network request','Add a searchable activity list','Improve the empty-state experience','Create a reusable status indicator','Document the release process','Add validation to a settings form','Improve mobile navigation','Create an accessible confirmation dialog','Add a retry action for failed uploads','Investigate slow page rendering','Add tests for a scoring rule','Simplify a multi-step setup','Design a filter panel','Refactor a shared UI component','Review authorization checks','Add an audit-friendly change summary','Prototype a new welcome screen','Add a loading state'];
export function sessionCards(game:string,seed:number,settings:RoomSettings):Card[]{
    if (settings.content?.length) {
        const cards = settings.content.map(c => ({
            ...c,
            options: c.options ? [...c.options] : undefined,
        }));

        return game === 'sprint-spotlight'
            ? cards
            : shuffle(cards, rng(seed));
    }
    if(game==='sprint-spotlight')return shuffle(tasks.map(question=>({question:'Estimate effort: '+question})),rng(seed)).slice(0,settings.count);
    if(game==='sprint-bingo')return bingoCard(seed).filter((_,i)=>i!==12).map(question=>({question}));
 return activityQuestions(game as ExtraSlug,seed,settings.count).map(c=>({question:c.question,options:[c.A!,c.B!]}));
}
export function sessionBingo(seed:number,settings:RoomSettings){const cards=sessionCards('sprint-bingo',seed,settings);return Array.from({length:25},(_,i)=>i===12?'FREE SPACE':cards[i<12?i:i-1].question);}
export function roundCount(game:string,settings:RoomSettings){return ['this-or-that-office-edition','sprint-spotlight'].includes(game)&&settings.content?.length?settings.content.length:settings.count;}
export const storySetups=['An ordinary planning meeting discovers a message from the future.','A team opens an office cupboard and finds a door to another world.','The sprint demo is interrupted by a talking robot with a secret.','A team must launch a product on a floating island before sunset.','An elevator takes the team to an office that does not exist.','A forgotten sticky note begins granting wishes.','The company mascot disappears just before the big event.','A mysterious package arrives with no sender and one instruction.'];
const twists=['Introduce an unexpected ally.','Reveal a surprising obstacle.','Make an ordinary object important.','Someone must choose between two good options.','A small mistake creates a big opportunity.','Add a secret that changes the situation.','Connect back to an earlier detail.','A character misunderstands an important message.','Make teamwork solve part of the problem.','Introduce a ticking deadline.','Reveal an unexpected talent.','Give a character a reason to change their mind.','Let a rival offer help.','Introduce a clue hidden in plain sight.','Make the plan go delightfully wrong.','Bring in a strange but useful invention.','Create a moment of humor.','Give the team a new shared goal.','Explain why the mystery began.','Bring the story to a satisfying conclusion.'];
export function storyPrompts(seed:number,count:number){const random=rng(seed);const opening=storySetups[Math.floor(random()*storySetups.length)];const prompts=shuffle(twists,random).slice(0,count);prompts[count-1]='Bring the story to a satisfying conclusion.';return {opening,prompts};}
export function validSentence(value:unknown){return typeof value==='string'&&value.trim().length>=10&&value.trim().length<=240&&!/[\u0000-\u001f\u007f]/.test(value);}
