# Team Playroom · Version 1.0

All ten games are playable in a React + TypeScript + Vite frontend, with reusable Cloudflare online rooms. No Supabase, accounts, paid service, or permanent leaderboard.

## Run locally

Use Node.js 22+ and pnpm 11. In PowerShell, use the .cmd suffix:

```powershell
npm.cmd install -g pnpm@11
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Open the address Vite prints. Solo and local play need no backend.

```powershell
pnpm.cmd test
pnpm.cmd build
pnpm.cmd preview
```

## Games and criteria

| Game | Rules and scoring |
| --- | --- |
| Color Clash | Pick the ink color, ignoring the word. Correct: 100 points. Optional text cue. |
| Guess the Majority | Choose a preference and separately predict the most popular preference. Correct prediction: 100; wrong: 0; either prediction earns 100 on a tie. Your preference counts. Solo uses seeded fictional voters. |
| Pixel Reveal | Identify an original pixel drawing. Correct at reveal stage 1/2/3: 300/200/100; wrong: 0. |
| Team Detective | Deduce the unique owner of an item from three clues. Correct: 100; wrong: 0. |
| Spot the Difference | Find exactly three changed cells in two illustrated scenes. Each correct cell: +100; each wrong cell: -100; minimum 0 per scene. |
| This or That: Office Edition | Private preferences, shared vote totals, no points. |
| Sprint Spotlight | Private reflections or appreciations, revealed after everyone contributes. No points. Use Pass if preferred. |
| Memory Grid | Remember four highlighted cells. Each correct cell: +25; wrong: -25; minimum 0. Five-second study, or optional extended study. |
| Collaborative Word Chain | Build one shared turn-based chain. New word starts with the previous word's last letter; no repeats; 2–24 English letters. Group judges legitimacy; no dictionary service or scores. |
| Sprint Bingo | Self-report sprint experiences on a shared seeded 5×5 card with a free center. Full row/column/diagonal is Bingo. No rankings. |

The scoring games support Solo and shared-device Individual/Team A/B competition. The social activities support local group play and online participation, with clearly labeled solo previews or personal reflection where appropriate. Every game explains its criteria before play.

Choose 8, 12 (default), or 20 questions/prompts/words. Bingo always uses 24 prompts plus a free center. Each new match/rematch creates a fresh seed. Room participants get identical generated questions, order, or cards. Seeds vary drawings, layouts, clue assignments, masks, or prompt order; finite content pools may revisit individual prompts or drawings. Fresh rounds do not imply an unlimited supply of never-repeated content.

## Online rooms

Create/join, nickname, invitation code/link, ready lobby, synchronized countdown, reconnect, results, and rematch are shared infrastructure. Competitive games support individual rankings and Team A/B totals with individual contributions; equal scores share ranks. Votes and reflections remain private until reveal. Word Chain uses a shared turn order; Bingo tracks each participant's own marks.

Rooms allow up to 12 active players, expire after two hours, and rounds end after ten minutes or a host finish. There are no permanent accounts or historical scores. Keep confidential information out of shared contributions.

## Cloudflare deployment

Keep Pages Free and Workers Free. Deploy the existing SQLite-backed Durable Object Worker, then push the frontend. No extra bindings or migrations are required for this release. Free quotas are finite and can interrupt online play; offline local play remains available. No paid plans are enabled by the project.

See UPDATE-v1.0.md and CLOUDFLARE-SETUP.md. Keep the public Pages Text variable VITE_ROOM_API_URL pointing to your existing room Worker. The archive's prebuilt dist has online configuration empty; rebuild with your configured variable for deployment.

## Structure

- src/shared/: seeded engines, common room protocol, and game criteria.
- src/collection/: reusable puzzle and activity interfaces.
- src/rooms/: transport, reconnect, and reusable room UI.
- worker/roomEngine.ts: membership, permissions, collective reveals, turns, and lifecycle.
- worker/gameAdapters.ts: validation and scoring per game.
- worker/index.ts: routing, storage, hibernating WebSockets, and expiry alarms.
- public/_redirects: Cloudflare Pages SPA routes, including invitation links.

Preserve your clone's .git and local configuration. Dependencies, local credentials, generated builds, and Visual Studio .vs files are ignored. See VERIFICATION-v1.0.md for the tested scope and deployment checks still required.
