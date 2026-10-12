<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Intentube landing

One static marketing page for a Chrome extension. No backend, no API routes, no tests.
`README.md` carries the design intent; the rest of this file is the working rules.

## Commands

```sh
pnpm install             # pnpm 10.15.1 is pinned via packageManager — use pnpm, not npm/yarn
pnpm dev                 # Turbopack, http://localhost:3000
pnpm lint                # eslint (next/core-web-vitals + next/typescript)
pnpm exec tsc --noEmit   # there is no `typecheck` script
pnpm build               # runs TypeScript itself, so this is the real type gate
pnpm start               # serve the production build
```

No test runner, formatter, or pre-commit config exists — don't add one silently. Before calling UI
work done: `pnpm lint && pnpm exec tsc --noEmit`, then `pnpm build`, then look at the page.

## Layout

- `app/page.tsx` — the only route, and only a section order. Adding a section means one file in
  `components/` plus an import here; don't nest sections inside each other.
- `app/globals.css` — the whole design system: colour/type tokens in `@theme`, plus the `rise`
  keyframe behind the hero load sequence. There is no `tailwind.config.js`; tokens go here.
- `lib/site.ts` — `DOWNLOAD_URL`, external links, and the demo's `intent`. Every download CTA
  branches off `DOWNLOAD_URL`, which is deliberately `''` (no release exists yet), so CTAs fall
  back to `#install` and the page states that the store listing is not live. Never hardcode a
  download URL elsewhere.
- `lib/feed.ts` — the single canonical 8-video feed, reused three times (hero, live demo,
  screenshot below it). `relevantCount`/`distractionCount` are derived; keep them derived.
- `assets/` is source imagery from the extension repo; `public/` is what the site serves. Updating
  a screenshot means copying into `public/screenshots/` *and* fixing the `width`/`height` props on
  the `next/image` that uses it, or the layout shifts. `app/icon.svg` is the favicon.
- **Section ids are the nav contract.** `#how` is the demo section ("How it works"), `#setup` is the
  six-step install walkthrough ("How to setup"), `#controls`, `#privacy`, `#install`. Renaming a
  section's heading means re-pointing `NAV` in `components/site-header.tsx` and any hero CTA that
  targets it.
- `components/how-it-works.tsx` and `components/install-scenes.tsx` are the one GSAP section. It is
  `'use client'`; its effect must stay dependency-free, because it calls `setActive` from the scrub
  callback and re-running the effect would rebuild the whole timeline mid-scroll. Layout is decided
  in CSS (both trees render, a media query shows one), not by a media query in JS.

## Conventions that differ from the defaults

- **Server components by default.** `components/feed-demo.tsx` is the only `'use client'` file.
  Add a client boundary only where state or effects are genuinely needed — `FeedCard` is
  presentational on purpose so dimming and hover-restore survive a failed script load.
- **CSS owns the load sequence; `motion/react` owns user actions.** The hero stagger is
  `className="rise"` plus `animationDelay`, never Motion. Motion is reserved for state the user
  changes (intent toggle, dim/hide switch); shared easing and transitions live in `lib/motion.ts`,
  so reuse them instead of inlining new easings.
- **Reduced motion is required in both layers:** the `prefers-reduced-motion` blocks in
  `globals.css` and `useReducedMotion()` in the demo. Honour it in anything you add.
- **`Button` renders an `<a>` when given `href`, a `<button>` otherwise.** Passing `href` for a
  state change breaks keyboard/screen-reader behaviour. Primitives in `components/ui/` are
  hand-written cva + `twMerge` — there is no shadcn CLI, so edit them in place.
- Copy is longhand, specific, and uses `&rsquo;`/`&mdash;` entities. Match that register; no
  placeholder or lorem text.

## Gotchas

- Use `localhost` or `127.0.0.1` for the dev server, nothing else. `allowedDevOrigins` in
  `next.config.ts` whitelists `127.0.0.1` for exactly this reason; any other origin (LAN IP,
  tunnel hostname) serves HTML without its JS and leaves a blank animated hero.
- Tailwind v4 is wired through the Turbopack loader in `next.config.ts` — there is no PostCSS
  config to add or edit.
- `cacheComponents` and `partialPrefetching` are on. There is no request-time data, so keep it
  that way; anything that needs a dynamic API requires a Suspense boundary (see
  `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`).
- `next/font/google` (Bricolage Grotesque, Instrument Sans) is fetched during the build, so builds
  need network access.
- `pnpm exec tsc --noEmit` on a fresh clone fails until `next dev` or `next build` has generated
  `.next/dev/types` — expected, not a code error.
- The git repo has no commits and no remote yet.
