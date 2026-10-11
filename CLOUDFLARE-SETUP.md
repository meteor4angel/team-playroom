# Team Playroom v0.3 · Cloudflare Free setup

Keep your existing **Cloudflare Pages** project. Add one **Worker** for online rooms; no Supabase or separate database service is needed. SQLite-backed Durable Objects are supported on Workers Free.

## 1. Check the plan

Use **Workers Free** and **Pages Free**. Do not upgrade or enable any paid service. This project does not need R2, D1, KV, a purchased domain, or an external account service. Free quotas are finite: Cloudflare's Free plan stops affected operations when a limit is reached. Local games still work independently.

Official references: [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), [WebSocket hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).

## 2. Install and check

Open PowerShell in the `team-playroom` folder. Use Node.js 22 or newer and pnpm 11:

```powershell
npm.cmd install -g pnpm@11
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
pnpm.cmd build
```

`pnpm.cmd build` checks frontend and Worker TypeScript, builds `dist/` for Pages, and builds `worker-dist/index.mjs` for the room Worker.

## 3. Publish the free room Worker

In `wrangler.jsonc`, keep `new_sqlite_classes`. This is the Free-compatible Durable Object backend. Set `ALLOWED_ORIGINS` to your actual Pages origin, for example `https://team-playroom.pages.dev`. The existing local origins can remain for development. Add a custom domain only if you already own one and want to use it.

```powershell
pnpm.cmd exec wrangler login
pnpm.cmd rooms:deploy
```

Wrangler will print a Worker URL, such as `https://team-playroom-rooms.<your-account>.workers.dev`. This URL is free; no purchased domain is needed. Check its `/health` path for `ok: true`. If Cloudflare requests a paid upgrade, stop rather than changing the plan; this configuration uses SQLite-backed Durable Objects, which are Free-compatible.

## 4. Connect the existing Pages site

In your **existing Pages project**, add a production build environment variable:

```text
VITE_ROOM_API_URL=https://team-playroom-rooms.<your-account>.workers.dev
```

Use the actual Worker URL, without a trailing slash. This variable is public; there are no secret service keys. Keep the Pages build command `pnpm build` and output directory `dist`. Set `NODE_VERSION` to `22` if it is not already configured. Push the v0.3 source to your existing repository and rebuild Pages after changing the variable.

Do not replace the existing Pages project with the Worker. Pages serves the website; the separate Worker serves only room endpoints and WebSockets. The tracked `public/_redirects` still supports SPA URLs such as `/room/ABCDEFGH`.

## 5. Try it with a friend

1. Open Color Clash → Online Room.
2. Enter a nickname, choose 8/12/20 questions and Individual/Team, and create a room.
3. Copy the invite link. Your friend opens it on their own device and enters a different nickname.
4. In Team mode, choose Team A or B. Everyone selects **I'm ready**.
5. The host starts the game. Both devices count down to the server's shared start time.
6. Finish the round and compare results. Everyone gets ready again; the host starts a rematch with a new shared seed.

Rooms cannot be joined after a round has started. Existing participants can reload and reconnect in the same tab. Settings are host-controlled. If the host explicitly leaves, another active member becomes host. If the host disappears without leaving, they can reconnect; a new room may be needed if they do not return.

## Local full-stack development

Copy `.env.example` to `.env.local` and set:

```text
VITE_ROOM_API_URL=http://127.0.0.1:8787
```

In one terminal:

```powershell
pnpm.cmd rooms:dev
```

In another:

```powershell
pnpm.cmd dev
```

Use `http://127.0.0.1:5173`. The local room runtime uses Miniflare/workerd with the same SQLite-backed Durable Object class. It does not need a Cloudflare login or a paid plan. `pnpm.cmd test:rooms` runs the native Worker integration test. Native workerd could not start inside the authoring sandbox, so this test still needs to pass in your unrestricted local environment or deployment verification.

Never deploy a frontend build whose API variable points at `127.0.0.1`; that address refers to each visitor's own device. Leaving the API variable empty keeps online rooms unavailable and preserves Solo and Local Teams.

## Free-tier guardrails

- At most 12 active players, 24 lifetime memberships, and 32 connections per room.
- Two-hour maximum room lifetime; automatic storage deletion by alarm. Empty rooms close and schedule deletion immediately.
- Ten-minute round deadline prevents abandoned rounds from waiting forever.
- Hibernating sockets; no per-second server polling or background heartbeat. Client countdown updates do not generate Worker requests.
- Answer retries are idempotent, so retrying the same answer cannot inflate scores.
- Input size and message/burst caps. The IP burst limiter is best-effort per Worker isolate, not global abuse protection. Large groups sharing one IP may encounter the limiter and need to slow down and retry. Free quotas remain the hard limit.
- Room codes are invitations, and per-player random tokens protect actions. Token values do not appear in invite links or leaderboard snapshots.

This is a casual game, not a tamper-proof competition: a technical user can derive answers from the public seed. The server validates selections and scores and prevents direct score edits, but the app is not designed to prevent all cheating.
