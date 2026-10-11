# v0.3 verification

## Passed

- Frontend and Worker TypeScript checks.
- Fifteen automated tests: catalog integrity, deterministic generation, room lifecycle, permissions, readiness, team eligibility, answer ordering/retries, stale-round rejection, ranking, fresh-seed rematches, token privacy, expiry, persistence reload, HTTP routing, and WebSocket snapshots.
- Production frontend build and standalone Worker bundle generation.
- Two browser tabs using the real compiled Worker and Durable Object handlers in a Node platform shim: create, invitation join, readiness, synchronized countdown, identical eight-question sequence, team totals (800/700), individual rankings, fresh questions on rematch, reload/reconnect, 20-question selection, and host ending a round.

## Remaining deployment verification

Native workerd/Miniflare could not start in the authoring sandbox. Wrangler dry-run also failed because its bundler could not access a parent directory. The Node browser harness and mocked platform tests do not verify Cloudflare native SQLite persistence, hibernation, alarm scheduling, or deployment.

Run pnpm.cmd test:rooms in an unrestricted environment, deploy on Workers Free following CLOUDFLARE-SETUP.md, and verify two-device play, reconnection, and expiry against the deployed Worker. No Cloudflare deployment, paid-plan activation, or live-site replacement was performed.

The shipped static dist/ has no room API URL configured. Solo and Local Teams remain available; Online Room explains that its service must be connected.
