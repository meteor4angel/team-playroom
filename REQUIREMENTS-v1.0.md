# Approved scope · Version 1.0

Complete all ten games before the user's next commit. Preserve Color Clash and Guess the Majority rules and the current deployed site until the user deploys this release.

Implement the agreed rules for Pixel Reveal, Team Detective, Spot the Difference, This or That: Office Edition, Sprint Spotlight, Memory Grid, Collaborative Word Chain, and Sprint Bingo. Explain criteria before play. Use original code-rendered illustrations; no paid content service.

Every new match uses a fresh seed and all peers share the same questions/order or board. Rematches reset answers and results. Content pools are finite, so individual prompts can recur. Word Chain rematches change the starting letter and first participant when multiple players participate.

Reuse Solo/local/online room infrastructure, with host settings, 8/12/20 choices where applicable, create/join, nickname, lobby, invite links, ready countdown, private submissions, appropriate results, reconnect, and rematch. Competitive games offer individual and Team A/B totals; noncompetitive activities do not rank participants.

Use existing Cloudflare Pages Free plus Workers Free and SQLite-backed Durable Objects/WebSockets. No Supabase, paid plan, accounts, or historical leaderboard. Retain existing quotas, rate caps, 12 active player limit, room expiry after two hours, and ten-minute round limit.
