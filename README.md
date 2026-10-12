# Intentube — landing page

Marketing page for [Intentube](https://github.com/lowkeshonline/Intentube), a Chrome
extension that asks why you opened YouTube and then dims or hides the videos that have
nothing to do with it.

Live page: _not deployed yet_.

## Stack

- **Next.js 16** (App Router, Turbopack) with React 19 and TypeScript
- **Tailwind CSS v4** — design tokens live in `app/globals.css` under `@theme`
- **Motion** (`motion/react`) for interactive state changes
- shadcn-style primitives in `components/ui` (`cva` + `tailwind-merge` + `clsx`),
  written by hand rather than pulled from the registry

## Running it

```sh
pnpm install
pnpm dev     # http://localhost:3000
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint
```

## Where things live

```text
app/layout.tsx          fonts (Bricolage Grotesque + Instrument Sans) and metadata
app/globals.css         colour/type tokens, base styles, the hero entrance keyframes
app/page.tsx            section order
components/             one file per section, plus feed-card and feed-demo
components/ui/          button and card primitives
lib/feed.ts             the single 8-video feed used in the hero, demo and copy
lib/site.ts             links and the download URL
lib/motion.ts           shared easing for interactive states
public/screenshots/     product screenshots, cropped from the extension repo
```

## Turning on the download link

Everything that downloads the extension reads one constant:

```ts
// lib/site.ts
export const DOWNLOAD_URL =
  'https://drive.google.com/uc?export=download&id=12vPe_2rpSlC4vc7upSKFs6nCbQYtA01q';
```

It points at `chrome-mv3.zip` on Google Drive via Drive's direct-download endpoint, so a CTA click
saves the build instead of opening a Drive preview page. All three CTAs (`hero.tsx`,
`site-header.tsx`, `install-cta.tsx`) read it and get `target="_blank" rel="noreferrer"`
automatically; setting it to empty makes them fall back to the install section.

There is no Chrome Web Store listing. The extension is distributed as an unpacked MV3 build —
unzip it, then load it via `chrome://extensions` → Developer mode → *Load unpacked*.

## Motion

The page has one load sequence and one interactive moment, deliberately, rather than an
entrance animation on every section:

- **Hero** — a stagger built from CSS keyframes (`rise` in `app/globals.css`), so it
  paints with the first frame and the headline survives a failed script load.
- **How it works** — the feed filters itself once when scrolled into view, and the intent
  toggle, the dim/hide switch and hover-to-restore are all real controls.
- **How to setup** — the six install steps are one scroll-scrubbed GSAP timeline, pinned
  on desktop and stacked per-step on mobile. All motion is transform/opacity only.
- `prefers-reduced-motion` is respected: the hero animation is disabled in CSS, the demo
  skips its transitions, and the setup section shows every step's final state statically
  without pinning.

## Assets

The screenshots in `public/screenshots/` come from the extension repository's
`docs/screenshots/`, and the video thumbnails in `public/thumbs/` are either the real
YouTube thumbnails used in the feed demo or small generated SVG stand-ins. Replacing a
screenshot means updating the `width`/`height` props on its `next/image` so the layout
does not shift.

## Deploying

The page is fully static. Import the repo into Vercel and accept the defaults, or run
`pnpm build` and serve the output anywhere that hosts a Next.js app.
