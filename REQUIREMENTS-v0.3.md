# Team Playroom v0.3 requirements

Approved scope:

- Keep the existing Cloudflare Pages site, routes, visual design, and nine coming-soon games working.
- Color Clash rounds are generated deterministically from a shared seed. Same seed and settings produce identical questions and order on every client. Each new match/rematch uses a new seed.
- Choose 8, 12 (default), or 20 questions.
- Three modes: Solo, Local Teams on one device, Online Room across devices.
- Shared multiplayer foundation: create/join, shareable code and URL, nickname, lobby, readiness, host controls, synchronized start, results, rematch, reconnect, and explicit leave.
- Online host selects Individual or Team competition. Individual leaderboard ranks players. Team mode uses Team A/Team B, totals, and individual contributions. Equal scores share a rank.
- Cloudflare Pages + a separate Cloudflare Worker with SQLite-backed Durable Objects and hibernating WebSockets. No Supabase, D1, external authentication service, or paid service.
- Must operate on Workers Free and Pages Free. Never enable or require paid plans. Free quotas are finite; exhausted quotas may temporarily interrupt online play. Local modes remain usable.
- Cap rooms at 12 active players and cap connections/messages. Expire rooms after two hours and delete stored state automatically. End unfinished rounds after ten minutes. No permanent accounts or historical leaderboard.
- The room protocol and lifecycle are independent of game rules; a game adapter supplies questions and scores. Color Clash is the first adapter.
- Display v0.3 and provide source, Cloudflare setup instructions, and build/test verification. Do not claim live deployment or multi-device production verification without evidence.

Deployment remains unchanged until a room Worker URL is configured. Solo and Local Teams work without that URL; Online Room explains the configuration requirement instead of pretending it is connected.
