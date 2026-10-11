# Review Team Playroom by Metriva · Version 1.0001

Open the local preview at http://127.0.0.1:4174/ while it is running. The revised games, facilitator controls, optional timers, and Metriva branding are included. Ads remain disabled. Your GitHub clone and live site are unchanged.

To run the downloaded project, extract the ZIP into a separate folder and open PowerShell in its inner team-playroom folder:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
pnpm.cmd dev
```

If pnpm is missing, run `npm.cmd install -g pnpm@11` first. Open the address printed by Vite. Solo and shared-device play need no backend.

For local online rooms, run `pnpm.cmd rooms:dev` in a second terminal. Put `VITE_ROOM_API_URL=http://127.0.0.1:8787` in `.env.local` beside package.json and restart the frontend. Native Cloudflare local runtime verification remains necessary outside the authoring sandbox.

Check Pixel Reveal's complete answer picture, Detective's multi-step cases, custom 2–3-option polls, Planning Poker's private estimates/re-votes, Collaborative Story's sentence turns/final reveal, and Bingo's facilitator achievements/first-line celebration. Optional round timers default to Off. Story also has an optional turn timer.

Planning Poker accepts up to 12 custom stories per batch. Load another batch in the same room after finishing; there is no fixed overall story quota. Rooms expire after two hours. Online rounds retain a ten-minute safety limit even when the optional challenge clock is Off. Latest 24 vote reveals per batch are retained to bound storage.

After review, copy the inner project contents into your clone, preserving .git and local configuration. Check/test/build, finish older online rooms, then redeploy the existing Worker before pushing the frontend. Keep your existing Pages Production Text variable VITE_ROOM_API_URL and the Free plans. The ZIP's prebuilt production dist has online configuration empty; rebuild with your configured variable before deployment.
