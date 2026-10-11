import { describe, expect, it } from 'vitest';
import { colors, makeQuestions, newSeed, questionCounts, score, winner } from './engine';
describe('Color Clash rules', () => {
 it('balances ink colors and never uses the ink color as the written word', () => {
  for(let seed=1;seed<=20;seed++) {
   const questions=makeQuestions(seed);
   expect(questions).toHaveLength(12);
   for(const color of colors) expect(questions.filter(q=>q.ink===color.name)).toHaveLength(3);
   for(const q of questions) {expect(q.word).not.toBe(q.ink);expect(colors.some(c=>c.name===q.word)).toBe(true);}
  }
 });
 it('reproduces identical seeded rounds at each allowed length',()=>{
  for(const count of questionCounts){expect(makeQuestions(849251,count)).toEqual(makeQuestions(849251,count));expect(makeQuestions(849251,count)).toHaveLength(count);for(const color of colors)expect(makeQuestions(849251,count).filter(q=>q.ink===color.name)).toHaveLength(count/4);}
  expect(makeQuestions(849251)).not.toEqual(makeQuestions(849252));
  expect(makeQuestions(1,8).slice(0,3)).toMatchInlineSnapshot(`
    [
      {
        "ink": "Blue",
        "word": "Purple",
      },
      {
        "ink": "Purple",
        "word": "Green",
      },
      {
        "ink": "Green",
        "word": "Purple",
      },
    ]
  `);
 });
 it('rematch chooses a different valid seed and rejects invalid settings',()=>{
  for(let i=0;i<20;i++)expect(newSeed(42)).not.toBe(42);
  expect(()=>makeQuestions(0)).toThrow();expect(()=>makeQuestions(1,10 as 12)).toThrow();
 });
 it('awards 100 points only for correct answers',()=>{
  expect(score([{choice:'Red',correct:true},{choice:'Blue',correct:false}])).toBe(100);
  expect(score([])).toBe(0);
 });
 it('handles either team winning, ties, and solo results',()=>{
  expect(winner([1200,100])).toContain('Team A');expect(winner([0,100])).toContain('Team B');expect(winner([500,500])).toContain('tie');expect(winner([500])).toContain('complete');
 });
});
