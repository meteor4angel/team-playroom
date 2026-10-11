# v0.4 verification

Passed: frontend and Worker TypeScript checks, all 21 automated tests, production frontend build, and Worker bundle generation. Existing Color Clash and room tests remain passing.

New tests cover deterministic non-repeating prompt selection, preference-versus-prediction scoring, ties, private ballots, synchronized question advancement, idempotent submissions, complete rounds, new-seed rematches, stale-round rejection, departures, and partial results on host finish/deadline.

Browser QA passed complete eight-question Solo and Local Teams rounds, private device handoffs, tied team totals, online create/join/readiness/shared countdown, hidden votes before reveal, correct versus incorrect predictions, complete online results (800/700), reload/reconnect, team rematch with new questions, and tied votes/contributions. The final reveal screen was corrected after QA exposed a reset. The scoring explanation, example, and tie rule are present before local and online games.

Online browser QA used real compiled Worker/Durable Object handlers with a Node platform shim. Native Cloudflare SQLite, WebSocket hibernation, alarms, and v0.4 deployment have not been verified here; native workerd was unavailable in this authoring environment. The existing production v0.3 site and Worker were not modified. Follow UPDATE-v0.4.md to redeploy the existing Worker first and then publish the new Pages commit, and verify two-device play against production.

No new service, database provider, paid plan, binding, or migration is required. Existing free-tier caps remain unchanged. The ZIP excludes private environment files, Git metadata, dependencies, local Durable Object data, and QA harnesses.
