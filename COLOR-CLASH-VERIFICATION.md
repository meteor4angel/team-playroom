# Color Clash · Version 0.2

Production build and strict TypeScript checking passed. Four automated tests passed, covering catalog integrity, balanced color questions with conflicting words, scoring, and solo/team/tie results.

Browser verification on the built site:

- Solo: completed 12 correct answers and received 1,200 points. First answer entered with a keyboard shortcut.
- Two-team mode: both teams received the identical 12 questions. Team A scored 1,200; Team B scored 1,100 with one deliberately incorrect choice. Team A was correctly identified as the winner.
- Wrong answer: feedback explained the correct ink color without awarding points.
- Replay: returned to Team A with zero points and question 1.
- Early exit: returned to setup.
- Optional color cue: displayed the ink color in text.

Game state is held in React memory only. No new dependencies, backend, accounts, online rooms, or persistent scores were introduced. The existing extracted project at `outputs/team-playroom-v0.1/team-playroom` has also been updated so the user's local development server can pick up the game.
