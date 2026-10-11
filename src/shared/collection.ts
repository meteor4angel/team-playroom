import {makeCase,type Fact} from './detective';
import {type QuestionCount,questionCounts} from './colorClash';
import {rng,shuffle} from './random';
export const extraSlugs=['pixel-reveal','team-detective','spot-the-difference','this-or-that-office-edition','sprint-spotlight','memory-grid','collaborative-word-chain','sprint-bingo'] as const;
export type ExtraSlug=typeof extraSlugs[number];
export type GameKind='puzzle'|'poll'|'spotlight'|'chain'|'bingo';
export type GameSpec={name:string;kind:GameKind;rules:string[];competitive:boolean;maxPoints:number};
export const specs:Record<ExtraSlug,GameSpec>={
 'pixel-reveal':{name:'Pixel Reveal',kind:'puzzle',competitive:true,maxPoints:300,rules:['Identify the original pixel drawing. Reveal more of it if you need a clue.','You get one guess: a correct answer earns 300 points at stage 1, 200 at stage 2, or 100 at stage 3. A wrong answer earns zero.','Every match has a new seeded mix of drawings, colors, orientations, and reveal order. Text descriptions explain the interface; identifying the picture is a visual challenge.']},
 'team-detective':{name:'Team Detective',kind:'puzzle',competitive:true,maxPoints:100,rules:['Solve a workplace logic case involving four leads, four projects, and four presentation days. Each lead has one project and one day; no two share a project or day.','Combine exclusions, ordering, and consecutive-day clues to identify the requested project owner. Every generated case has exactly one complete schedule.','Correct answers earn 100 points, wrong answers zero. Review the full schedule after answering. Use notes or discuss the logic; there is no speed bonus.']},
 'spot-the-difference':{name:'Spot the Difference',kind:'puzzle',competitive:true,maxPoints:300,rules:['Compare two original illustrated 5 × 5 scenes. Exactly three cells differ. Select those cells on the second scene.','Submit three cells once: each correct cell earns 100 points; each incorrect cell subtracts 100, with a minimum of zero per scene.','The symbols, colors, orientations, and changed cells vary each match. Cell descriptions provide an accessible text comparison.']},
 'this-or-that-office-edition':{name:'This or That: Office Edition',kind:'poll',competitive:false,maxPoints:0,rules:['Privately choose one option for each workplace preference prompt. There are no right answers or points.','Reveal the vote totals after everyone submits, then share the stories behind your choices. Submitted preferences are counted even if someone leaves.','Facilitators can enter questions with two or three options. Apply content before starting; every participant receives the same seeded order. The facilitator advances after each reveal.']},
 'sprint-spotlight':{name:'Planning Poker',kind:'spotlight',competitive:false,maxPoints:0,rules:['The facilitator enters stories or uses example tasks. Everyone privately estimates relative effort with 0, 1, 2, 3, 5, 8, 13, or 21. ? asks for clarification; Pass abstains.','Reveal when everyone has voted. Discuss low/high estimates, scope, uncertainty, and dependencies; the facilitator can re-vote or advance. No player rankings.','Load more story batches in the same room, with no fixed overall story quota. Up to 12 custom stories are loaded per batch to keep storage bounded. Rooms expire after two hours; record final agreed estimates in your usual planning tool.']},
 'memory-grid':{name:'Memory Grid',kind:'puzzle',competitive:true,maxPoints:100,rules:['Study the four highlighted cells in a 4 × 4 grid for five seconds, or hide them when you are ready.','After they disappear, select the four cells you remember. Correct cells earn 25 points; wrong cells subtract 25, with a minimum of zero per grid. Submit once.','A numbered list of highlighted cells appears during study for text access. Enable extended study to hide the pattern when ready; in online rooms the host chooses this for everyone. Every grid changes with the seeded round. No speed bonus.']},
 'collaborative-word-chain':{name:'Collaborative Story',kind:'chain',competitive:false,maxPoints:0,rules:['Teammates add one sentence each in turn order. Start with the seeded opening, connect to the previous sentence, and incorporate your surprise prompt.','Use 10–240 characters. Prior turns show only the previous sentence; the full story with contributor names is revealed at the end. No rankings.','Choose 8/12/20 sentences and optional round/turn timers. An expired turn records a skip and advances; the host can also skip. Rematch creates a new opening and prompts.']},
 'sprint-bingo':{name:'Sprint Bingo',kind:'bingo',competitive:false,maxPoints:0,rules:['Use a fresh 5 × 5 sprint card with a free center. Mark a prompt only when it happened for you during this sprint. You can unmark a mistaken selection.','A full row, column, or diagonal is Bingo. Celebrate your completed lines; these are self-reported experiences, not verified achievements.','Everyone in a room has the same seeded card. The session ends when everyone has a line, the host ends it, or ten minutes pass. No individual rankings.']},
};
export function isExtra(game:string):game is ExtraSlug{return (extraSlugs as readonly string[]).includes(game);}
export function isCompetitive(game:string){return !isExtra(game)||specs[game].competitive;}
const drawings:Record<string,string[]>={
 Heart:['........','.##..##.','########','########','.######.','..####..','...##...','........'],
 Star:['...##...','...##...','########','.######.','..####..','.######.','.##..##.','........'],
 Tree:['...##...','..####..','.######.','########','..####..','.######.','...##...','...##...'],
 House:['...##...','..####..','.######.','########','.######.','.##..##.','.##..##.','.######.'],
 Cup:['........','.#####..','.#####..','.#######','.#####.#','.#######','..###...','........'],
 Fish:['........','..###...','.#####.#','####.###','########','.#####.#','..###...','........'],
 Boat:['...#....','...##...','...###..','...####.','...#....','########','.######.','..####..'],
 Flag:['..#####.','..#####.','..####..','..#####.','..#.....','..#.....','..#.....','.###....'],
 Key:['.###....','##.##...','##.##...','.#######','....#.#.','....#...','........','........'],
 Mushroom:['..####..','.######.','##.##.##','########','...##...','...##...','..####..','........'],
 Butterfly:['##....##','###..###','.######.','..####..','.######.','###..###','##....##','........'],
 Rocket:['...##...','..####..','..#..#..','..####..','.######.','##.##.##','...##...','..#..#..'],
 Cat:['##....##','###..###','########','##.##.##','########','.##..##.','..####..','........'],
 Diamond:['...##...','..####..','.######.','########','.######.','..####..','...##...','........'],
 Flower:['..####..','..####..','########','###..###','########','...#....','...###..','...#....'],
 Cactus:['...##...','.#.##...','.#.##.#.','.#.##.#.','.######.','...##...','...##...','..####..'],
};
export const shapes=['leaf','sun','flower','kite','cloud','house'] as const;
export type Tile={shape:typeof shapes[number];color:string;rotation:number};
export type Puzzle={game:ExtraSlug;prompt:string;options?:string[];solution:string;explanation:string;pixels?:string[];order?:number[];color?:string;clues?:string[];before?:Tile[];after?:Tile[];cells?:number[];facts?:Fact[]};
const palette=['#7b52ce','#c1484d','#286d69','#c38a25','#2d68af'];
const people=['Ava','Ben','Cleo','Dev','Emi','Finn','Gia','Hugo','Iris','Jules','Kai','Lena'];
const itemSets=[['compass','lantern','map','flask'],['red badge','blue badge','green badge','gold badge'],['apple','orange','pear','plum'],['sketchbook','camera','pen case','notebook'],['kite','ball','puzzle','book'],['drum','flute','guitar','keyboard']];
export function puzzleQuestions(game:ExtraSlug,seed:number,count:QuestionCount):Puzzle[]{
 if(!questionCounts.includes(count)||specs[game].kind!=='puzzle')throw new Error('Invalid puzzle settings.');const random=rng(seed);const names=Object.keys(drawings);
 return Array.from({length:count},()=>{
  if(game==='pixel-reveal'){
   const answer=names[Math.floor(random()*names.length)];let pixels=[...drawings[answer]];if(random()<.5)pixels=pixels.map(row=>[...row].reverse().join(''));
   return {game,prompt:'What is hiding in these pixels?',solution:answer,explanation:`The drawing is a ${answer.toLowerCase()}.`,pixels,order:shuffle(Array.from({length:64},(_,i)=>i),random),color:palette[Math.floor(random()*palette.length)],options:shuffle([answer,...shuffle(names.filter(n=>n!==answer),random).slice(0,3)],random)};
  }
  if(game==='team-detective'){
   return {game,...makeCase(random)};
  }
  if(game==='spot-the-difference'){
   const before=Array.from({length:25},()=>({shape:shapes[Math.floor(random()*shapes.length)],color:palette[Math.floor(random()*palette.length)],rotation:Math.floor(random()*4)*90}));const cells=shuffle(Array.from({length:25},(_,i)=>i),random).slice(0,3).sort((a,b)=>a-b);
   const after=before.map((tile,i)=>cells.includes(i)?{...tile,shape:shapes[(shapes.indexOf(tile.shape)+1+Math.floor(random()*5))%shapes.length]}:{...tile});
   return {game,prompt:'Find the three changed cells.',before,after,cells,solution:cells.join(','),explanation:`The changed cells are ${cells.map(i=>i+1).join(', ')}.`};
  }
  const cells=shuffle(Array.from({length:16},(_,i)=>i),random).slice(0,4).sort((a,b)=>a-b);return {game,prompt:'Remember the four highlighted cells.',cells,solution:cells.join(','),explanation:`The highlighted cells were ${cells.map(i=>i+1).join(', ')}.`};
 });
}
export function cellChoice(choice:string,size:number,count:number):number[]|null{
 if(typeof choice!=='string'||!/^\d+(,\d+)*$/.test(choice))return null;const cells=choice.split(',').map(Number);return cells.length===count&&new Set(cells).size===count&&cells.every(i=>Number.isInteger(i)&&i>=0&&i<size)?cells.sort((a,b)=>a-b):null;
}
export function puzzlePoints(puzzle:Puzzle,choice:string):{correct:boolean;points:number}{
 if(puzzle.game==='pixel-reveal'){const match=choice.match(/^([123]):(.+)$/);if(!match||!puzzle.options?.includes(match[2]))throw new Error('Invalid pixel guess.');const correct=match[2]===puzzle.solution;return {correct,points:correct?(4-Number(match[1]))*100:0};}
 if(puzzle.game==='team-detective'){if(!puzzle.options?.includes(choice))throw new Error('Choose a listed suspect.');const correct=choice===puzzle.solution;return {correct,points:correct?100:0};}
 const cells=cellChoice(choice,puzzle.game==='memory-grid'?16:25,puzzle.game==='memory-grid'?4:3);if(!cells)throw new Error('Select the required number of cells.');const right=cells.filter(i=>puzzle.cells?.includes(i)).length;const correct=right===cells.length;return {correct,points:Math.max(0,(right-(cells.length-right))*(puzzle.game==='memory-grid'?25:100))};
}
const officePairs=[['How should we kick off a meeting?','A quick check-in','Straight to the agenda'],['Your ideal team lunch?','Try a new place','Return to a favorite'],['A weekly team ritual?','Share wins','Share lessons'],['Working through an idea?','Talk it through','Sketch it out'],['A project update?','A short video','A written summary'],['Team break activity?','A puzzle','A conversation'],['A team outing?','Outdoors','Indoors'],['Workspace energy?','Quiet focus','Friendly background buzz'],['A workshop format?','Hands-on tasks','Open discussion'],['A celebration?','Small and frequent','One big occasion'],['Learning with teammates?','Pair up','Small groups'],['Meeting notes?','Bullets','A visual map'],['Project planning?','A board','A checklist'],['A team treat?','Sweet snacks','Savory snacks'],['Brainstorming?','Ideas on sticky notes','Ideas in a shared document'],['A team photo?','Candid','Posed'],['A lunch break?','Walk outside','Stay and chat'],['A new teammate welcome?','Buddy introduction','Group introduction'],['Feedback format?','A conversation','A thoughtful note'],['A team playlist?','Upbeat','Calm'],['A work milestone?','Share the story','Show the finished result'],['A desk accessory?','A plant','A fun figurine'],['A creative warm-up?','Doodle','Word association'],['An afternoon recharge?','Stretch','Grab a drink']];
export type Prompt={question:string;A?:string;B?:string};
const spotlightPrompts=['What small win deserves a big cheer?','Who helped you move forward, and how?','What surprised you in a good way?','What did you learn by trying something new?','What is one thing you are proud of?','What made collaboration easier?','What would you like to thank the team for?','What challenge taught you something useful?','What is a moment worth remembering?','What habit helped you focus?','What did someone explain especially well?','What is one kindness you noticed?','What step made a difficult task easier?','What experiment was worth trying?','What feedback helped you grow?','What teamwork moment made you smile?','What did you finish that once felt difficult?','What would you like to carry into next sprint?','What is a useful question someone asked?','What made your day a little brighter?','What problem did the team simplify?','What did you discover about your strengths?','What was a quiet contribution worth recognizing?','What helped you recover from a setback?','What skill did you practice?','What was a good decision the team made?','What did you enjoy creating?','What made you feel supported?','What is one lesson you would share?','What is a tiny improvement that mattered?','What was an unexpected team strength?','What could we celebrate more often?'];
export function activityQuestions(game:ExtraSlug,seed:number,count:QuestionCount):Prompt[]{if(!questionCounts.includes(count))throw new Error('Invalid count.');const random=rng(seed);return shuffle(game==='sprint-spotlight'?spotlightPrompts.map(question=>({question})):officePairs.map(([question,A,B])=>({question,A,B})),random).slice(0,count);}
const bingoPrompts=['Helped a teammate','Asked a clarifying question','Shared a useful link','Reviewed someone’s work','Learned a new shortcut','Celebrated a small win','Updated documentation','Tried a new approach','Fixed a confusing detail','Received helpful feedback','Gave thoughtful feedback','Took a proper break','Finished a planned task','Made someone smile','Paired on a challenge','Simplified a process','Wrote down a lesson','Recognized a teammate','Tested an assumption','Explained an idea clearly','Unblocked a task','Noticed a useful pattern','Improved an existing draft','Shared progress early','Asked for help','Offered help','Prepared for a meeting','Followed up on an action','Made time to reflect','Checked an edge case','Organized a shared resource','Welcomed another perspective','Reduced unnecessary work','Turned feedback into action','Set a realistic goal','Kept a promise','Clarified a handoff','Captured a good idea','Made a plan easier to follow','Appreciated the team'];
export function bingoCard(seed:number){const prompts=shuffle(bingoPrompts,rng(seed)).slice(0,24);return Array.from({length:25},(_,i)=>i===12?'FREE SPACE':prompts[i<12?i:i-1]);}
export function bingoLines(marked:readonly number[]){const cells=new Set([...marked,12]);const lines=[...Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r*5+c)),...Array.from({length:5},(_,c)=>Array.from({length:5},(_,r)=>r*5+c)),[0,6,12,18,24],[4,8,12,16,20]];return lines.filter(line=>line.every(i=>cells.has(i))).length;}
export function startingLetter(seed:number){const alphabet='abcdefghilmnoprst';return alphabet[Math.floor(rng(seed)()*alphabet.length)];}
export function normalizeWord(word:string){return typeof word==='string'?word.trim().toLowerCase():'';}
export function validWord(word:string,letter:string,used:readonly string[]){const clean=normalizeWord(word);return /^[a-z]{2,24}$/.test(clean)&&clean.startsWith(letter)&&!used.includes(clean);}
