# Team Playroom · Version 0.2

A responsive React + TypeScript + Vite frontend. Color Clash is playable locally. The other nine games remain coming-soon previews. There is no backend, accounts, online rooms, Supabase, or persistent leaderboard.

## Start locally

Use Node.js 22 LTS or later and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite.

```sh
pnpm test
pnpm build
pnpm preview
```

The build runs strict TypeScript checking and generates `dist/`. The source archive includes a ready-built `dist/` for static deployment. `node_modules` is intentionally excluded.

## Cloudflare Pages

Connect the GitHub repository, set build command `pnpm build` and output directory `dist`. Use Node.js 22. Alternatively upload the contents of `dist/` as a direct-upload Pages deployment. `public/_redirects` is copied to `dist/_redirects` and sends all deep links to `index.html`, including `/games/color-clash`. The client renders unknown paths as a 404 page; SPA fallback responses use HTTP 200.

## Structure

- `src/games.ts`: the ten game concepts, slugs, and category metadata.
- `src/main.tsx`: routing, shared navigation, reusable game cards, catalog filters/search, and informational pages.
- `src/styles.css`: responsive layout, focus indicators, reduced motion, and visual design.
- `public/`: favicon and Cloudflare SPA redirects.
- `src/games.test.ts`: catalog integrity checks.

Routes: `/`, `/games`, `/games/:slug`, `/about`, `/privacy`, and an unknown-route fallback. Navigation updates the title and description, resets scroll, and focuses the main landmark. No third-party fonts, images, trackers, storage, or network services are used by the frontend. Search and filter state is temporary.

Before production branding/SEO expansion, add a canonical URL and social preview image using your actual deployment domain. Privacy copy covers this frontend; revisit it when hosting configuration or data collection changes.

## GitHub initial upload

In this directory, initialize a new repository if needed, commit the source, add `https://github.com/meteor4angel/team-playroom.git` as `origin`, and push an initial branch only after checking the remote state. Do not overwrite existing remote history. Keep `dist/` and dependencies out of Git; Cloudflare builds from source.


## Color Clash

Open /games/color-clash. Select solo or two teams on one device, optionally enable a text color cue, and start. Choose the ink color rather than the written word, using buttons or keys 1–4. Each turn has 12 questions, equally balanced across four ink colors. Correct answers earn 100 points; incorrect answers earn zero. Both teams receive the same questions. There is no timer. Results, replay, and early exit are available; all state is temporary.

### Windows PowerShell

Use npm.cmd install -g pnpm@11, then pnpm.cmd install --frozen-lockfile and pnpm.cmd dev. The .cmd suffix avoids PowerShell script execution-policy errors.

