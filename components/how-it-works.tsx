'use client';

/**
 * "How it works" — the six-step install walkthrough.
 *
 * Layout is decided entirely in CSS: both the desktop and the mobile tree are
 * rendered, and a media query shows one and hides the other. That keeps the
 * server render deterministic (no media query during render, so no hydration
 * flash) and `display: none` already removes the hidden tree from the
 * accessibility tree and the tab order.
 *
 * GSAP then builds timelines for whichever tree CSS is showing, using
 * `gsap.matchMedia` on the same 1024px breakpoint, so the two never disagree.
 *
 * The effect deliberately has no dependencies. It calls `setActive` from the
 * scrub callback, and `setActive` is stable, so scrolling rebuilds nothing.
 */

import { forwardRef, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SCENES, KEEP } from './install-scenes';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    title: 'Click download',
    body: 'Get intentube.zip from the link on this page.',
  },
  {
    title: 'Extract the zip file',
    body: 'Unzip it on your Desktop. The folder it leaves behind is the extension.',
  },
  {
    title: 'Open Chrome settings',
    body: 'Click the three dots at the top right of Chrome, then Extensions.',
  },
  {
    title: 'Enable developer mode',
    body: 'Flip the switch in the top right of the extensions page.',
  },
  {
    title: 'Click load unpacked',
    body: 'Choose the intentube folder. Its card appears on the page.',
  },
  {
    title: 'Open YouTube and use the extension',
    body: 'Say why you are here. Everything else fades back.',
  },
];

type SceneOpts = { wrap?: boolean; first?: boolean; last?: boolean };

const q = <T extends Element>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

/* ---------------------------------------------------------------
   TIMELINE HELPERS
   --------------------------------------------------------------- */

/**
 * Typewriter that survives scrub. GSAP will not interpolate a string, and a
 * text plugin would not rewind on scroll-up, so this tweens a counter and
 * slices — seeking the timeline backwards rewinds the string correctly.
 */
function typeOut(tl: gsap.core.Timeline, node: HTMLElement, str: string, at: number) {
  const state = { i: 0 };
  tl.to(
    state,
    {
      i: str.length,
      duration: str.length * 0.04,
      ease: 'none',
      onUpdate() {
        node.textContent = str.slice(0, Math.round(state.i));
      },
    },
    at,
  );
}

/**
 * Curved cursor travel with no MotionPath plugin: x and y are two tweens
 * sharing a duration but running different eases.
 *
 * The aim point is the control's CENTRE plus a nudge, so the cursor's tip (its
 * top-left) lands on the button and the body overhangs to the right, the way a
 * real screenshot of a hand on a mouse reads. Positions are measured once at
 * build time, so this must run after layout — and after fonts, since font
 * metrics move things.
 */
function makeAim(scene: HTMLElement, cur: HTMLElement) {
  gsap.set(cur, { x: 0, y: 0 });
  const s = scene.getBoundingClientRect();
  const c = cur.getBoundingClientRect();
  const ox = c.left - s.left;
  const oy = c.top - s.top;
  return (target: HTMLElement, dx = 0, dy = 0) => {
    const t = target.getBoundingClientRect();
    return {
      x: t.left - s.left + t.width / 2 + dx - ox,
      y: t.top - s.top + t.height / 2 + dy - oy,
    };
  };
}

function glide(
  tl: gsap.core.Timeline,
  cur: HTMLElement,
  aim: ReturnType<typeof makeAim>,
  target: HTMLElement,
  at: number,
  dur: number,
  dx = 0,
  dy = 0,
) {
  const p = aim(target, dx, dy);
  tl.to(cur, { x: p.x, duration: dur, ease: 'power2.inOut' }, at).to(
    cur,
    { y: p.y, duration: dur, ease: 'power3.inOut' },
    at,
  );
}

function press(tl: gsap.core.Timeline, cur: HTMLElement, btn: HTMLElement, at: number) {
  tl.to(cur, { scale: 0.82, duration: 0.07, ease: 'power2.out' }, at)
    .to(cur, { scale: 1, duration: 0.22, ease: 'power3.out' }, at + 0.07)
    .to(btn, { scale: 0.95, duration: 0.1, ease: 'power2.out' }, at)
    .to(btn, { scale: 1, duration: 0.26, ease: 'power2.out' }, at + 0.1);
}

/**
 * Scene wrapper crossfade, desktop chain only. Called after the scene's
 * content is built so the fade-out is anchored to that scene's real duration
 * rather than a guessed constant — a fixed offset makes longer scenes fade
 * out mid-action.
 *
 * `wrap: false` (mobile stacked, reduced motion) means nothing crossfades, so
 * the wrapper must simply be painted visible; its CSS default is hidden.
 * `first` makes the opening scene already visible, so the stage is never an
 * empty black box at rest, before the user has scrolled at all. `last` skips
 * the exit fade for the same reason at the other end: without it the section
 * settles on an empty dark stage once the pin is fully scrubbed.
 */
function finish(el: HTMLElement, tl: gsap.core.Timeline, o?: SceneOpts) {
  if (o?.wrap === false) {
    gsap.set(el, { autoAlpha: 1 });
    return tl;
  }
  const dur = tl.duration();
  if (o?.first) {
    tl.set(el, { autoAlpha: 1 }, 0);
  } else {
    tl.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      0,
    );
  }
  if (!o?.last) {
    tl.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, Math.max(dur, 0.6));
  }
  return tl;
}

/* ---------------------------------------------------------------
   THE SIX SCENES
   Each returns a timeline of 2.3–2.9s with every initial hidden
   state set before any tween is added.
   --------------------------------------------------------------- */

function timeline1(el: HTMLElement, o?: SceneOpts) {
  const cur = q<HTMLElement>(el, '.cur');
  const btn = q<HTMLElement>(el, '[data-dl]');
  const chip = q<HTMLElement>(el, '[data-zip]');
  const tray = q<HTMLElement>(el, '.tray');
  const ring = q<HTMLElement>(el, '[data-ring]');
  if (!cur || !btn || !chip || !tray || !ring) return gsap.timeline();

  gsap.set(tray, { autoAlpha: 0, y: -16 });
  gsap.set(chip, { autoAlpha: 0, y: -26 });
  // xPercent/yPercent centre the pulse on the button; GSAP keeps them
  // while scale animates.
  gsap.set(ring, { autoAlpha: 0, scale: 1, xPercent: -50, yPercent: -50 });
  gsap.set(cur, { autoAlpha: 0 });

  const aim = makeAim(el, cur);
  const tl = gsap.timeline();
  tl.to(cur, { autoAlpha: 1, duration: 0.25 }, 0.05);

  glide(tl, cur, aim, btn, 0.3, 0.78);
  press(tl, cur, btn, 1.08);

  tl.fromTo(
    ring,
    { autoAlpha: 0.85, scale: 1 },
    { autoAlpha: 0, scale: 1.7, duration: 0.55, ease: 'power2.out' },
    1.18,
  )
    // tray and chip land together so the bubble is never seen empty
    .to(tray, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.3)
    .to(chip, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 1.52);

  return finish(el, tl, o);
}

function timeline2(el: HTMLElement, o?: SceneOpts) {
  const hl = q<SVGGElement>(el, '[data-half-l]');
  const hr = q<SVGGElement>(el, '[data-half-r]');
  const zipper = q<SVGGElement>(el, '[data-zipper]');
  const zLabel = q<HTMLElement>(el, '[data-ziplabel]');
  const folder = q<HTMLElement>(el, '[data-folderstack]');
  const fLabel = q<HTMLElement>(el, '[data-folderlabel]');
  const files = q<HTMLElement>(el, '[data-files]');
  if (!hl || !hr || !zipper || !zLabel || !folder || !fLabel || !files) {
    return gsap.timeline();
  }
  const chips = Array.from(files.children) as HTMLElement[];

  gsap.set(folder, { autoAlpha: 0, scale: 0.55 });
  gsap.set(fLabel, { autoAlpha: 0 });
  chips.forEach((c) => gsap.set(c, { autoAlpha: 0, y: 16, scale: 0.8 }));

  const tl = gsap.timeline();
  // zipper travels down the seam, then the folder splits along it
  tl.to(zipper, { y: 14, duration: 0.45, ease: 'power2.in' }, 0.2)
    .to(zipper, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, 0.62)
    .to(hl, { x: -30, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.82)
    .to(hr, { x: 30, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0.82)
    .to(zLabel, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, 0.88)
    // plain folder bounces in, then three files fly out and settle beneath
    .to(folder, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)' }, 1.2)
    .to(fLabel, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 1.5)
    .to(
      chips,
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.07 },
      1.78,
    );

  return finish(el, tl, o);
}

function timeline3(el: HTMLElement, o?: SceneOpts) {
  const cur = q<HTMLElement>(el, '.cur');
  const menuBtn = q<HTMLElement>(el, '[data-menu-btn]');
  const menu = q<HTMLElement>(el, '[data-menu]');
  const ext = q<HTMLElement>(el, '[data-ext]');
  const urlBar = q<HTMLElement>(el, '.win__url');
  if (!cur || !menuBtn || !menu || !ext || !urlBar) return gsap.timeline();

  gsap.set(menu, { autoAlpha: 0, y: -10, scale: 0.97 });
  gsap.set(ext, { backgroundColor: 'rgba(0,0,0,0)' });
  gsap.set(cur, { autoAlpha: 0 });

  const aim = makeAim(el, cur);
  const tl = gsap.timeline();
  tl.to(cur, { autoAlpha: 1, duration: 0.2 }, 0.05);

  glide(tl, cur, aim, menuBtn, 0.2, 0.5, -8, -8);
  press(tl, cur, menuBtn, 0.7);

  tl.to(menu, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' }, 0.74);
  glide(tl, cur, aim, ext, 1.05, 0.37, -10, -6);
  // after choosing Extensions the hand moves to the address bar, so the
  // pointer is never left stranded over a menu that has just closed
  glide(tl, cur, aim, urlBar, 1.44, 0.3, -34, -2);
  tl.to(ext, { backgroundColor: '#e4efe9', duration: 0.22, ease: 'power2.out' }, 1.42)
    .to(menu, { autoAlpha: 0, y: -8, duration: 0.26, ease: 'power2.in' }, 1.6);
  typeOut(tl, urlBar, 'chrome://extensions', 1.78);

  return finish(el, tl, o);
}

function timeline4(el: HTMLElement, o?: SceneOpts) {
  const cur = q<HTMLElement>(el, '.cur');
  const toggle = q<HTMLElement>(el, '[data-toggle]');
  const knob = q<HTMLElement>(el, '[data-knob]');
  const bar = q<HTMLElement>(el, '[data-bar]');
  const empty = q<HTMLElement>(el, '[data-empty]');
  if (!cur || !toggle || !knob || !bar || !empty) return gsap.timeline();

  gsap.set(toggle, { backgroundColor: '#cddad4' });
  gsap.set(knob, { x: 0 });
  gsap.set(bar, { yPercent: -100, autoAlpha: 0 });
  gsap.set(empty, { autoAlpha: 1 });
  gsap.set(cur, { autoAlpha: 0 });

  const aim = makeAim(el, cur);
  const tl = gsap.timeline();
  tl.to(cur, { autoAlpha: 1, duration: 0.2 }, 0.05);

  glide(tl, cur, aim, toggle, 0.18, 0.48, -6, -6);
  press(tl, cur, toggle, 0.66);

  tl.to(knob, { x: 17, duration: 0.3, ease: 'power2.out' }, 0.7)
    .to(toggle, { backgroundColor: '#174b3a', duration: 0.3, ease: 'power2.out' }, 0.7)
    .to(empty, { autoAlpha: 0, duration: 0.28, ease: 'power1.out' }, 1.14)
    .to(bar, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' }, 1.32);

  return finish(el, tl, o);
}

function timeline5(el: HTMLElement, o?: SceneOpts) {
  const cur = q<HTMLElement>(el, '.cur');
  const unpacked = q<HTMLElement>(el, '[data-unpacked]');
  const backdrop = q<HTMLElement>(el, '[data-bkd]');
  const picker = q<HTMLElement>(el, '[data-picker]');
  const folderRow = q<HTMLElement>(el, '[data-hit]');
  const selectBtn = q<HTMLElement>(el, '[data-select]');
  const card = q<HTMLElement>(el, '[data-card]');
  if (!cur || !unpacked || !backdrop || !picker || !folderRow || !selectBtn || !card) {
    return gsap.timeline();
  }

  gsap.set(backdrop, { autoAlpha: 0 });
  gsap.set(picker, { autoAlpha: 0, scale: 0.9, y: 8 });
  gsap.set(folderRow, { backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)' });
  gsap.set(card, { autoAlpha: 0, y: 14 });
  gsap.set(cur, { autoAlpha: 0 });

  const aim = makeAim(el, cur);
  const tl = gsap.timeline();
  tl.to(cur, { autoAlpha: 1, duration: 0.2 }, 0.02);

  glide(tl, cur, aim, unpacked, 0, 0.45);
  press(tl, cur, unpacked, 0.45);

  tl.to(backdrop, { autoAlpha: 1, duration: 0.26, ease: 'power2.out' }, 0.58)
    .to(picker, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.62)
    .to(
      folderRow,
      { backgroundColor: '#e8826d', borderColor: '#e8826d', duration: 0.26, ease: 'power2.out' },
      1.05,
    );

  glide(tl, cur, aim, selectBtn, 1.32, 0.4);
  press(tl, cur, selectBtn, 1.72);

  tl.to(picker, { autoAlpha: 0, scale: 0.96, y: 6, duration: 0.28, ease: 'power2.in' }, 1.92)
    .to(backdrop, { autoAlpha: 0, duration: 0.28, ease: 'power2.in' }, 1.92)
    // the hand leaves the frame rather than parking over the vanished modal
    .to(cur, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 2.1)
    .to(card, { autoAlpha: 1, y: 0, duration: 0.46, ease: 'power2.out' }, 1.98);

  return finish(el, tl, o);
}

function timeline6(el: HTMLElement, o?: SceneOpts) {
  const cur = q<HTMLElement>(el, '.cur');
  const extBtn = q<HTMLElement>(el, '[data-extbtn]');
  const popup = q<HTMLElement>(el, '[data-popup]');
  const key = q<HTMLElement>(el, '[data-key]');
  const keyCaret = q<HTMLElement>(el, '[data-keycaret]');
  const check = q<HTMLElement>(el, '[data-check]');
  const goal = q<HTMLElement>(el, '[data-goal]');
  const saved = q<HTMLElement>(el, '[data-saved]');
  const done = q<HTMLElement>(el, '[data-done]');
  if (!cur || !extBtn || !popup || !key || !keyCaret || !check || !goal || !saved || !done) {
    return gsap.timeline();
  }

  const dim = Array.from(el.querySelectorAll<HTMLElement>('.vcard')).filter(
    (c) => !KEEP.includes(Number(c.dataset.card)),
  );
  const rings = KEEP.map((i) => q<HTMLElement>(el, `[data-ring="${i}"]`)).filter(
    (r): r is HTMLElement => Boolean(r),
  );

  gsap.set(popup, { autoAlpha: 0, y: -10, scale: 0.96 });
  gsap.set(done, { autoAlpha: 0, scale: 0.8 });
  gsap.set(check, { autoAlpha: 0, scale: 0.4 });
  gsap.set(saved, { autoAlpha: 0, y: 4 });
  gsap.set(cur, { autoAlpha: 0 });
  dim.forEach((c) => gsap.set(c, { opacity: 1 }));
  rings.forEach((r) => gsap.set(r, { autoAlpha: 0, scale: 1.12 }));

  const aim = makeAim(el, cur);
  const tl = gsap.timeline();
  tl.to(cur, { autoAlpha: 1, duration: 0.2 }, 0.02);

  glide(tl, cur, aim, extBtn, 0, 0.42, -4, -4);
  tl.to(extBtn, { scale: 0.86, duration: 0.07, ease: 'power2.out' }, 0.44)
    .to(extBtn, { scale: 1, duration: 0.22, ease: 'power3.out' }, 0.51)
    .to(popup, { autoAlpha: 1, y: 0, scale: 1, duration: 0.36, ease: 'power2.out' }, 0.58);

  // The key pastes first, since it gates the rest of the popup. It is shown
  // partially masked — the shape of a real secret, without putting one on the
  // page — and the check plus the "saved" line confirm it took.
  typeOut(tl, key, 'jev_live_7f3c••••••••••a1', 0.96);
  tl.to(keyCaret, { autoAlpha: 0, duration: 0.16, ease: 'power1.out' }, 1.68)
    .to(check, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, 1.72)
    .to(saved, { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power2.out' }, 1.84);

  // then the intent, which is what actually decides what stays on screen
  typeOut(tl, goal, 'learn React hooks', 2.14);
  tl.to(popup, { autoAlpha: 0, y: -8, scale: 0.97, duration: 0.26, ease: 'power2.in' }, 2.82);

  // Dim the six that do not match. Opacity is tweened; the grayscale is a
  // discrete class swap, never a tweened filter, to keep motion on
  // transform/opacity only.
  tl.to(dim, { opacity: 0.16, duration: 0.42, ease: 'power2.out', stagger: 0.03 }, 2.88)
    .add(
      () => dim.forEach((c) => c.classList.add('is-dim')),
      2.88,
    )
    .to(
      rings,
      { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out', stagger: 0.08 },
      3.24,
    )
    .to(done, { autoAlpha: 1, scale: 1, duration: 0.48, ease: 'back.out(1.7)' }, 3.32);

  return finish(el, tl, o);
}

const BUILDERS = [timeline1, timeline2, timeline3, timeline4, timeline5, timeline6];

/* ---------------------------------------------------------------
   PIN RANGE GUARD
   A pinned ScrollTrigger can only be scrubbed as far as the document
   actually scrolls. If this section were the last thing on the page the
   max scroll could land short of `end`, and the tail of the timeline
   would silently stop updating. Pad by exactly the shortfall — so a page
   with real content below it gets no extra space at all.
   --------------------------------------------------------------- */
/**
 * Pin the rail to the first and last number-circle centres.
 *
 * A fixed `top`/`bottom` cannot do this. Every step is `13px 0` padding around a
 * 32px circle, but the description below each one wraps to one or two lines, so
 * the centre of the last circle sits at a different distance from the bottom of
 * the list on every viewport width. Measuring is the only way to land exactly on
 * it. The rail sits behind the circles (z-index 0) and each circle is opaque, so
 * the line is interrupted by all six.
 */
function fitRail(wrap: HTMLElement, rail: HTMLElement) {
  const circles = wrap.querySelectorAll<HTMLElement>('.istep__num');
  if (circles.length < 2) return;
  const wrapBox = wrap.getBoundingClientRect();
  const first = circles[0].getBoundingClientRect();
  const last = circles[circles.length - 1].getBoundingClientRect();

  // Height is computed here rather than set via `bottom`. When the rail's
  // position is absolute, `bottom` resolves against the containing block's
  // padding box, not its border box — and React's pre-commitment pass sets
  // `.pin-spacer { padding-top }` on the grid, not the wrap. Mixing a measured
  // `top` with a resolved `bottom` gave a 1744px offset and collapsed the rail
  // to zero height. Deriving the height directly is unambiguous.
  const top = first.top - wrapBox.top + first.height / 2;
  const bottom = last.top - wrapBox.top + last.height / 2;
  rail.style.top = `${top}px`;
  rail.style.height = `${Math.max(0, bottom - top)}px`;
  rail.style.removeProperty('bottom');
}

function fitPinRange(section: HTMLElement) {
  const pinned = ScrollTrigger.getAll().find((t) => t.pin);
  if (!pinned) return;
  section.style.paddingBottom = '';
  ScrollTrigger.refresh();
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const shortfall = Math.ceil(pinned.end - maxScroll);
  if (shortfall > 0) {
    section.style.paddingBottom = `${shortfall + 48}px`;
    ScrollTrigger.refresh();
  }
}

/* ---------------------------------------------------------------
   TREES
   Defined at module level so they do not re-render when the active
   step changes during scroll.
   --------------------------------------------------------------- */

/**
 * The desktop stage: all six scenes stacked in one box, crossfaded by the
 * master timeline. Defined at module level so it does not re-render on every
 * scrubbed step change.
 */
const DesktopStage = forwardRef<HTMLDivElement>(function DesktopStage(_props, ref) {
  return (
    <div
      className="istage"
      role="img"
      aria-label={`${STEPS[0].title}. ${STEPS[0].body}`}
      ref={ref}
    >
      {/* The mock UI is decorative: role="img" above describes it in one
          label, and `inert` keeps its buttons out of the tab order. */}
      <div className="istage__inner" inert>
        {SCENES.map((Scene, i) => (
          <Scene key={i} />
        ))}
      </div>
    </div>
  );
});

export function HowItWorks() {
  const [active, setActive] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const stepsWrapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const desktopStageRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;
    let cancelled = false;

    function build() {
      if (cancelled) return;
      mm = gsap.matchMedia();

      /* Four explicit matching contexts. gsap.matchMedia does NOT invoke a
         conditions-object callback when every condition is false, so the
         conditions form would silently skip mobile entirely. */
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const grid = gridRef.current;
        const stage = desktopStageRef.current;
        if (!grid || !stage) return;
        const scenes = Array.from(stage.querySelectorAll<HTMLElement>('.scene'));

        const master = gsap.timeline({
          scrollTrigger: {
            /* Pinned on the grid, not the section: the section header is
               taller than a short laptop viewport, so pinning the whole
               section would clip the stage off the bottom. */
            trigger: grid,
            start: 'top 88px',
            end: '+=3000',
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            onUpdate: (self) => setActive(Math.min(5, Math.floor(self.progress * 6))),
          },
        });

        // .add() with no position appends at the end, so the six scenes play
        // one after another rather than all at once.
        scenes.forEach((el, i) => {
          const opts: SceneOpts = {};
          if (i === 0) opts.first = true;
          if (i === scenes.length - 1) opts.last = true;
          master.add(BUILDERS[i](el, opts));
        });

        if (fillRef.current) {
          // The rail fill rides the whole chain, transform-only.
          master.fromTo(
            fillRef.current,
            { scaleY: 0 },
            { scaleY: 1, duration: master.duration(), ease: 'none' },
            0,
          );
        }

        if (sectionRef.current) fitPinRange(sectionRef.current);
        if (stepsWrapRef.current && railRef.current) {
          fitRail(stepsWrapRef.current, railRef.current);
        }
        // Step heights change with wrapping and fonts, so keep the rail glued to
        // the circle centres on every resize. GSAP's refresh would not do this:
        // the rail's box is not part of the pinned trigger's height.
        ScrollTrigger.addEventListener('refreshInit', () => {
          if (stepsWrapRef.current && railRef.current) {
            fitRail(stepsWrapRef.current, railRef.current);
          }
        });
        // A scrubbed timeline stays paused until the first scroll, so force
        // one render or the opening scene keeps the hidden state its fromTo
        // applied at build time and the stage shows as a black box at rest.
        master.progress(0);
        ScrollTrigger.refresh();
      });

      mm.add('(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)', () => {
        const list = mobileListRef.current;
        if (!list) return;
        list.querySelectorAll<HTMLElement>('.istage').forEach((m, i) => {
          const el = m.querySelector<HTMLElement>('.scene');
          if (!el) return;
          const tl = BUILDERS[i](el, { wrap: false });
          tl.pause();
          ScrollTrigger.create({
            trigger: m,
            start: 'top 80%',
            once: true,
            onEnter: () => tl.play(0),
          });
        });
        ScrollTrigger.refresh();
      });

      // Reduced motion: no pin, no scrub. Every scene is built, seeked to its
      // end and paused, so all six end states are on screen at once.
      mm.add('(prefers-reduced-motion: reduce)', () => {
        /* All six scenes are rendered but only one tree is displayed, so only
           the visible one is built. Static layout comes from CSS; this just
           seeks each scene to the state the scroll would have reached. */
        const visible =
          window.matchMedia('(min-width: 1024px)').matches
            ? desktopStageRef.current?.querySelectorAll<HTMLElement>('.scene')
            : mobileListRef.current?.querySelectorAll<HTMLElement>('.istage .scene');
        if (!visible) return;
        Array.from(visible).forEach((el, i) => {
          if (!BUILDERS[i]) return;
          BUILDERS[i](el, { wrap: false }).progress(1).pause();
        });
        ScrollTrigger.refresh();
      });
    }

    /* Fonts change text metrics and the scenes measure element positions to
       aim the cursor, so wait for them before the first build. */
    if (document.fonts?.ready) {
      document.fonts.ready.then(build).catch(build);
    } else {
      build();
    }

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  return (
    <section id="setup" className="how-section scroll-mt-6" ref={sectionRef}>
      <div className="mx-auto max-w-[1120px] px-6">
        <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
          How to setup
        </p>
        {/* The rail spans exactly from the first circle's centre to the last
            one's. Those offsets are measured after layout, since step heights
            vary with how each description wraps. */}
        <h2 className="text-[clamp(34px,5.2vw,58px)] font-extrabold leading-[1.03] tracking-[-0.028em]">
          Set up in six steps. Under two minutes.
        </h2>

        {/* ---------- desktop: step list + one pinned stage ---------- */}
        <div className="guide--desktop">
          <div className="isteps-grid" ref={gridRef}>
            {/* The rail is a sibling of the <ol>, not a child: <ol> only
                permits <li>, and an empty <li> would be a phantom step. */}
            <div className="isteps-wrap" ref={stepsWrapRef}>
              <span className="isteps__rail" ref={railRef} aria-hidden="true">
                <span className="isteps__fill" ref={fillRef} />
              </span>
              <ol className="isteps">
                {STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    className={i === active ? 'istep is-on' : 'istep'}
                    aria-current={i === active ? 'step' : undefined}
                  >
                    <span className="istep__num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className="istep__text">
                      <h3 className="istep__title">{step.title}</h3>
                      <p className="istep__body">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <DesktopStage ref={desktopStageRef} />
          </div>
        </div>

        {/* ---------- mobile: each step carries its own scene ---------- */}
        <div className="guide--mobile">
          <ol className="imsteps" ref={mobileListRef}>
            {STEPS.map((step, i) => {
              const Scene = SCENES[i];
              return (
                <li key={step.title}>
                  <div className="imstep__head">
                    <span className="istep__num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="istep__title">{step.title}</h3>
                      <p className="istep__body">{step.body}</p>
                    </div>
                  </div>
                  <div
                    className="istage"
                    role="img"
                    aria-label={`${step.title}. ${step.body}`}
                  >
                    <div className="istage__inner" inert>
                      <Scene />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
