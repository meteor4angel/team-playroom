export type Game = { slug: string; name: string; category: 'Icebreakers' | 'Team challenges' | 'Sprint rituals'; description: string; symbol: string; color: string };
export const games: Game[] = [
 {slug:'color-clash',name:'Color Clash',category:'Team challenges',description:'A colorful challenge where quick thinking meets team spirit.',symbol:'◒',color:'coral'},
 {slug:'guess-the-majority',name:'Guess the Majority',category:'Icebreakers',description:'Read the room. Can you predict what most of your teammates will choose?',symbol:'◉',color:'purple'},
 {slug:'pixel-reveal',name:'Pixel Reveal',category:'Team challenges',description:'Piece together the bigger picture, one pixel at a time.',symbol:'▦',color:'blue'},
 {slug:'team-detective',name:'Team Detective',category:'Team challenges',description:'Connect the clues and put your collective curiosity to work.',symbol:'⌕',color:'yellow'},
 {slug:'spot-the-difference',name:'Spot the Difference',category:'Team challenges',description:'Fresh eyes, tiny details, and a shared moment of discovery.',symbol:'◐',color:'green'},
 {slug:'this-or-that-office-edition',name:'This or That: Office Edition',category:'Icebreakers',description:'Small choices. Fun conversations. Get to know the people behind the work.',symbol:'⇄',color:'coral'},
 {slug:'sprint-spotlight',name:'Sprint Spotlight',category:'Sprint rituals',description:'Make space for the moments and people that made your sprint.',symbol:'✦',color:'yellow'},
 {slug:'memory-grid',name:'Memory Grid',category:'Team challenges',description:'Put your heads together and see what sticks.',symbol:'▤',color:'purple'},
 {slug:'collaborative-word-chain',name:'Collaborative Word Chain',category:'Icebreakers',description:'One word leads to another. See where your team takes the story.',symbol:'↝',color:'green'},
 {slug:'sprint-bingo',name:'Sprint Bingo',category:'Sprint rituals',description:'Find the familiar moments in your sprint and celebrate them together.',symbol:'⊞',color:'blue'},
];
