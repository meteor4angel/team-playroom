import { describe, expect, it } from 'vitest';
import { games } from './games';
describe('game catalog routes', () => {
 it('contains exactly the ten agreed games with unique valid routes', () => {
  expect(games).toHaveLength(10);
  expect(new Set(games.map(g=>g.slug)).size).toBe(10);
  for (const game of games) { expect(game.slug).toMatch(/^[a-z]+(?:-[a-z]+)*$/); expect(game.description.length).toBeGreaterThan(20); }
  expect(games.map(g=>g.name)).toEqual(['Color Clash','Guess the Majority','Pixel Reveal','Team Detective','Spot the Difference','This or That: Office Edition','Sprint Spotlight','Memory Grid','Collaborative Word Chain','Sprint Bingo']);
 });
});
