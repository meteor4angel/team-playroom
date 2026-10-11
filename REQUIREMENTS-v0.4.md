# v0.4 · Guess the Majority

- Each player privately submits a preference and a separate prediction of the majority preference.
- Correct prediction: 100 points; incorrect: zero. Either prediction earns 100 on ties. All submitted preferences count, including the predictor's own. Missing ballots earn zero.
- Clear pre-game scoring explanation, example, tie rule, and reveal feedback.
- Shared seeded prompt order, 8/12/20 questions, default 12; fresh seed on rematch.
- Solo practice explicitly labels five simulated voters. Local pass-and-play supports 2–12 players, Individual or Team A/B scoring.
- Online rooms reuse the existing invitation, identity, lobby, synchronized start, reconnect, storage, expiry, and leaderboard infrastructure. A collective game adapter adds private ballots and shared reveals; Color Clash behavior remains intact.
- Ballots cannot be changed after submission. A question advances after all active participants submit. Early host finish/ten-minute deadline resolves the current submitted ballots. Leaving retains previously submitted votes and unblocks remaining players.
- Cloudflare Free only; no new paid services, backend providers, bindings, or migrations.
- Display v0.4, mark two games playable, preserve remaining eight previews and existing site routes.
