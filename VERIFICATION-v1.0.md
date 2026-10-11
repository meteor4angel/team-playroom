# Version 1.0 verification

## Passed

- Frontend and Worker TypeScript checks.
- Production Vite frontend build and standalone Worker bundle.
- 44 automated tests across seven files: original Color Clash/Guess the Majority, room permissions/protocol/lifecycle, deterministic puzzles, unique detective solutions over 1,000 seeds, scoring and validation, private polls/contributions, turns, bingo, expiry, and fresh rematches.
- Browser: full eight-question solo rounds for Pixel Reveal, Team Detective, Spot the Difference, and Memory Grid. Perfect-score solutions checked for the last three; reveal-stage scoring checked for Pixel Reveal.
- Browser: local group office votes; full personal Spotlight session with retained recap; full solo Word Chain; solo Bingo completion and fresh card rematch.
- Two-browser room checks for all eight new games: identical puzzles/cards, scored submissions, individual/team results as applicable; private votes and contributions until reveal; Spotlight and Bingo reconnect after refresh; complete shared Word Chain; Bingo correction and completion; extended Memory Grid study and retained answer feedback.
- Catalog: ten playable entries with displayed v1.0. Existing route structure, About/Privacy, SPA fallback, and deterministic first-two-game tests retained.
- No deployment, paid plan, Supabase, or external content service enabled by this work.

## Limits of these checks

The browser room checks exercised the real compiled Worker and Durable Object handlers through a temporary Node platform shim. This verifies UI/protocol behavior, not Cloudflare's native SQLite, alarm, or WebSocket hibernation runtime. Native workerd/Miniflare cannot start in this authoring environment; native integration and live deployment must be checked after applying the release. The shim and its test configuration are excluded from the ZIP.

A mobile viewport override was attempted but the in-app browser kept its desktop width. Responsive CSS is implemented (stacked scenes, smaller bingo tiles, fluid grids), but an actual narrow-device visual check remains necessary.

## After deployment

Deploy the existing room Worker before pushing the frontend. Keep VITE_ROOM_API_URL configured for Pages. Confirm the new commit deploys successfully and the site header shows v1.0.

Use two actual devices to test creating/joining each game, readiness, synchronized start, submissions, results, reconnect, and a fresh rematch. For private polls/reflections, ensure peers cannot see submissions before reveal. For Word Chain, verify turn order; for Bingo, mark only real experiences and verify each participant's independent marks. Verify Color Clash and Guess the Majority remain functional.

Check a phone-sized browser, particularly Spot the Difference and Sprint Bingo. Check Workers Free/Pages Free status and usage. Free quotas remain finite; online service can stop at a free limit. No paid plan is required or automatically enabled.
