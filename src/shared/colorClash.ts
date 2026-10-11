export const colors = [
  { name: 'Red', hex: '#bd303d', key: '1' },
  { name: 'Blue', hex: '#235cc1', key: '2' },
  { name: 'Green', hex: '#257447', key: '3' },
  { name: 'Purple', hex: '#7946b4', key: '4' },
] as const;
export type ColorName = typeof colors[number]['name'];
export type Question = { word: ColorName; ink: ColorName };
export type Answer = { choice: ColorName; correct: boolean };
export type QuestionCount = 8 | 12 | 20;
export const questionCounts: QuestionCount[] = [8, 12, 20];
export function newSeed(previous?: number): number {
  let seed: number;
  do { seed = crypto.getRandomValues(new Uint32Array(1))[0] % 2147483646 + 1; } while(seed === previous);
  return seed;
}
// Version 1: integer-only Park–Miller RNG, shared by browser and Worker.
export function makeQuestions(seed = newSeed(), count: QuestionCount = 12): Question[] {
  if (!Number.isInteger(seed) || seed < 1 || seed > 2147483646 || !questionCounts.includes(count)) throw new Error('Invalid round settings.');
  let state = seed;
  const random = () => { state = state * 16807 % 2147483647; return (state - 1) / 2147483646; };
  const inks: ColorName[] = Array.from({ length: count }, (_, i) => colors[i % 4].name);
  for (let i = inks.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [inks[i], inks[j]] = [inks[j], inks[i]];
  }
  return inks.map(ink => {
    const other = colors.filter(c => c.name !== ink);
    return { ink, word: other[Math.floor(random() * other.length)].name };
  });
}
export function score<T extends {correct: boolean}>(answers: readonly T[]): number { return answers.filter(a => a.correct).length * 100; }
export function winner(scores: number[]): string {
  if (scores.length === 1) return 'Your round is complete!';
  if (scores[0] === scores[1]) return "It's a tie!";
  return scores[0] > scores[1] ? 'Team A takes this round!' : 'Team B takes this round!';
}
