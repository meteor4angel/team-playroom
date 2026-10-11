# Update your existing Cloudflare site to v1.0

1. Extract the ZIP. Copy the contents of its inner `team-playroom` folder into your GitHub clone. Preserve `.git`, `.env.local`, and your existing Cloudflare configuration. The package includes the Visual Studio `.vs` watcher fix and ignore rule.
2. Run the checks in the clone:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
pnpm.cmd build
```

3. Update the **existing** room Worker first:

```powershell
pnpm.cmd rooms:deploy
```

The Worker name, Durable Object binding, and SQLite migration are unchanged. Do not add a second room service or activate a paid plan. Updating the existing Worker retains Color Clash support and adds the remaining eight games.

4. Commit and push the frontend/source:

```powershell
git add .
git commit -m "Complete all ten games for v1.0"
git push origin main
```

5. Keep the existing Pages Production Text variable `VITE_ROOM_API_URL=https://team-playroom-rooms.meteor4angel.workers.dev`. Wait for a successful deployment of the **new commit**, then refresh the permanent website URL. The header should show v1.0.
6. Confirm the header shows v1.0 and the catalog has ten playable games. Test an Online Room with two devices in each new game. Check private votes/contributions, shared questions, scoring, Word Chain turn order, Bingo marks, reconnect, and rematch. Keep Color Clash and Guess the Majority working.

Solo and local play run without the Worker. The ZIP's prebuilt `dist` has online configuration empty; your Pages build uses the saved production variable. Do not upload that unconfigured prebuilt build over your configured production build.

This update deploys to the existing services; do not enable a paid plan. Stay within free quotas. No Supabase or additional database service is required.
