# Update your existing Cloudflare site to v0.4

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

The Worker name, Durable Object binding, and SQLite migration are unchanged. Do not add a second room service or activate a paid plan. Updating the existing Worker retains Color Clash support and adds Guess the Majority.

4. Commit and push the frontend/source:

```powershell
git add .
git commit -m "Add v0.4 Guess the Majority"
git push origin main
```

5. Keep the existing Pages Production Text variable `VITE_ROOM_API_URL=https://team-playroom-rooms.meteor4angel.workers.dev`. Wait for a successful deployment of the **new commit**, then refresh the permanent website URL. The header should show v0.4.
6. Open `/games/guess-the-majority`, read the scoring explanation, and try an Online Room with a friend. Each player chooses a preference and a prediction. Verify hidden votes, shared reveals, results, reconnect, and rematch. Color Clash should remain available.

Solo and Local Teams run without the Worker. The ZIP's prebuilt `dist` has online configuration empty; your Pages build uses the saved production variable. Do not upload that unconfigured prebuilt build as a replacement for your configured production build.
