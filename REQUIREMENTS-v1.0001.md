# Team Playroom v1.0001 · facilitator and challenge upgrade

User feedback: v1.0 puzzle and social mechanics need more depth and facilitation. Keep the existing Cloudflare-only free-tier architecture and deployed site unchanged until a replacement release is ready.

## Confirmed requirements

- Pixel Reveal: show the complete drawing with the correct answer after a submitted guess; improve recognition during progressive reveal. Preserve stage-based scoring and seed consistency.
- Team Detective: replace the simple item-owner deduction with more demanding, multi-step workplace logic mysteries. Seed assignments and clues; validate unique solutions. Explain criteria and reasoning after answers.
- This or That: let the facilitator enter questions with two or three options. Retain starter content, private votes, shared totals, and no competitive ranking. Validate custom inputs and freeze the match content for all participants.
- Replace Sprint Spotlight with Planning Poker. Facilitator enters tasks; players privately choose effort estimates, reveal together, discuss differences, and re-vote. Estimates are not player performance scores. Keep the old route available as a redirect or compatible entry point.
- Sprint Bingo remains personal sprint achievements. Add facilitator-defined prompts and a first-completed-line celebration. Preserve correction of mistaken marks, explain self-reporting, and show participant progress. Seed boards consistently within a room.
- Every game needs an optional visible timer, default Off. A timer is a host/facilitator setting online and a local setup setting offline. Synchronize online deadlines through the existing room server; define timeout behavior per game. Retain the two-hour room expiry and free-tier resource guardrails separately from the optional game timer.

## Confirmed Collaborative Story replacement

Replace basic Word Chain with teammates adding one sentence each in turn order, seeded surprise prompts, and a complete story reveal with contributor names. Support local pass-and-play and online rooms, plus an optional turn timer. Retain the old URL as a compatible route or redirect.

## Version and advertising

User-visible version: 1.0001, part of Version 1. Package metadata uses the valid semantic version 1.0.1. The original v1.0 release ZIP remains unchanged. Advertising is being discussed only; do not insert trackers or activate ads without an implementation request and publisher configuration.

## Release checks

Preserve all ten routes and Color Clash/Guess the Majority rules. Check custom question validation, private poker votes, two/three-option totals, shared timers/expiry/reconnect, detective unique answers, correct picture reveals, and first-Bingo tie handling. Build frontend/Worker and test before packaging. No paid service, automatic cloud plan change, Supabase, or external dictionary/content API.

## Current implementation status

The full-picture Pixel Reveal feedback change has been implemented locally and passed TypeScript checking. The rest of this upgrade is not yet implemented or packaged. The previously delivered v1.0 ZIP remains unchanged.
