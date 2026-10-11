export const colors = [
  { name: 'Red', hex: '#bd303d', key: '1' },
  { name: 'Blue', hex: '#235cc1', key: '2' },
  { name: 'Green', hex: '#257447', key: '3' },
  { name: 'Purple', hex: '#7946b4', key: '4' },
] as const;
export type ColorName = typeof colors[number]['name'];
export type Question = { word: ColorName; ink: ColorName };
export type Answer = { choice: ColorName; correct: boolean };
export const QUESTIONS_PER_TURN = 12;
export function makeQuestions(random: () => number = Math.random): Question[] {
  // Every ink appears equally often. The written word always conflicts with it.
  const inks: ColorName[] = Array.from({ length: QUESTIONS_PER_TURN }, (_, i) => colors[i % colors.length].name);
  for (let i = inks.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [inks[i], inks[j]] = [inks[j], inks[i]];
  }
  return inks.map(ink => {
    const other = colors.filter(c => c.name !== ink);
    return { ink, word: other[Math.floor(random() * other.length)].name };
  });
}
export function score(answers: Answer[]): number {
  return answers.filter(a => a.correct).length * 100;
}
export function winner(scores: number[]): string {
  if (scores.length === 1) return 'Your round is complete!';
  if (scores[0] === scores[1]) return "It's a tie!";
  return scores[0] > scores[1] ? 'Team A takes this round!' : 'Team B takes this round!';
}
