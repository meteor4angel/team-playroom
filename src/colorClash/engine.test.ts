import { describe, expect, it } from 'vitest';
import { colors, makeQuestions, score, winner } from './engine';
describe('Color Clash rules', () => {
 it('balances ink colors and never uses the ink color as the written word', () => {
  for(let seed=1;seed<=20;seed++) {
   let state=seed;
   const questions=makeQuestions(()=>{state=(state*16807)%2147483647;return(state-1)/2147483646;});
   expect(questions).toHaveLength(12);
   for(const color of colors) expect(questions.filter(q=>q.ink===color.name)).toHaveLength(3);
   for(const q of questions) {expect(q.word).not.toBe(q.ink);expect(colors.some(c=>c.name===q.word)).toBe(true);}
  }
 });
 it('awards 100 points only for correct answers',()=>{
  expect(score([{choice:'Red',correct:true},{choice:'Blue',correct:false}])).toBe(100);
  expect(score([])).toBe(0);
 });
 it('handles either team winning, ties, and solo results',()=>{
  expect(winner([1200,100])).toContain('Team A');expect(winner([0,100])).toContain('Team B');expect(winner([500,500])).toContain('tie');expect(winner([500])).toContain('complete');
 });
});
