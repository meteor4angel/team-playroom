# Team Playroom · Version 0.3

React + TypeScript + Vite website with ten game routes. Color Clash supports Solo, Local Teams, and optional Online Room play. The other nine games remain coming soon.

## Run locally

Use Node.js 22 or newer and pnpm 11. In Windows PowerShell:

```powershell
npm.cmd install -g pnpm@11
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

Open the address printed by Vite. The .cmd suffix avoids PowerShell script-policy errors. Solo and Local Teams need no backend configuration.

```powershell
pnpm.cmd test
pnpm.cmd build
pnpm.cmd preview
```

The build checks frontend and Worker TypeScript and produces dist/ for Pages and worker-dist/index.mjs for the room Worker. Dependencies are excluded from the archive.

## Color Clash

Choose the ink color while ignoring the written word. Select 8, 12 (default), or 20 questions; correct answers earn 100 points. Each match receives a fresh seed, and multiplayer participants receive identical questions in the same order. Local Teams take turns on one device. Optional text cues support players who need color labels.

Online Room adds invitations, nicknames, a ready lobby, host settings, a shared countdown, reconnecting, results, and rematches. Individual competition ranks players. Team competition sums Team A/B scores and displays individual contributions. Rooms hold up to 12 active players and expire after two hours. There are no permanent accounts or historical leaderboards.

## Cloudflare Free deployment

Keep the existing Pages project and deploy the separate room Worker using SQLite-backed Durable Objects and hibernating WebSockets. No Supabase or paid service is required. Stay on Pages Free and Workers Free; finite quotas can interrupt online play. No plan changes are performed by this project.

Follow [CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md) for deployment, the public VITE_ROOM_API_URL variable, free-tier guardrails, and native local room testing. The archive's static build has online rooms unconfigured; connect the Worker URL and rebuild to enable them.

## Structure

- src/shared/: deterministic question engine and reusable room protocol/types.
- src/rooms/: session, HTTP/WebSocket transport, and room UI.
- worker/roomEngine.ts: game-independent membership, host permissions, and lifecycle.
- worker/gameAdapters.ts: game-specific validation and scoring.
- worker/index.ts: routing, storage, hibernating sockets, and expiration alarms.
- public/_redirects: Pages SPA fallback, including invitation deep links.
- REQUIREMENTS-v0.3.md: agreed scope; VERIFICATION-v0.3.md: checks and remaining deployment verification.

Preserve your existing Git history when applying this version. Keep .env.local, dependencies, generated builds, and local room storage out of Git.
