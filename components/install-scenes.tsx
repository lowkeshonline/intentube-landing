/**
 * The six install scenes, drawn entirely with HTML/CSS/inline SVG — no images.
 *
 * These are presentational only. Nothing here knows about scroll position or
 * timelines; `how-it-works.tsx` mounts them and drives them. Each scene is a
 * `mount` target that GSAP queries by `data-*` attribute, so the markup is
 * kept flat and stable rather than generated.
 */

import { useId } from 'react';

/* Inline iconography. All `aria-hidden`: the parent stage carries role="img"
   and a real label, so anything decorative in here must stay silent. */

function LockIcon() {
  return (
    <svg width="9" height="10" viewBox="0 0 10 10" fill="none" stroke="#3d4d46" strokeWidth="1.2" aria-hidden="true">
      <rect x="2" y="4.5" width="6" height="4.5" rx="1" />
      <path d="M3.4 4.5V3.2a1.6 1.6 0 0 1 3.2 0v1.3" />
    </svg>
  );
}

function KebabIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3.5" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="12.5" cy="8" r="1.4" />
    </svg>
  );
}

function PuzzleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#3d4d46" strokeWidth="1.3" aria-hidden="true">
      <rect x="1.5" y="2.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="2.5" width="5" height="5" rx="1.5" />
      <rect x="1.5" y="8.5" width="5" height="5" rx="1.5" />
      <rect x="9.5" y="8.5" width="5" height="5" rx="1.5" />
    </svg>
  );
}

/** The hand-drawn pointer. Shared by every scene that needs one. */
export function Cursor() {
  return (
    <svg className="cur" width="24" height="28" viewBox="0 0 24 28" aria-hidden="true">
      <path
        d="M3 2.2V22.4L8.4 17.1L12.1 25.4L16.2 23.6L12.5 15.5L19.8 15.2Z"
        fill="#0e1a16"
        stroke="#f5f8f6"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WindowDots() {
  return (
    <div className="dots">
      <i className="dot" />
      <i className="dot" />
      <i className="dot" />
    </div>
  );
}

function PageCopy() {
  return (
    <>
      <div className="ph ph--t" />
      <div className="ph ph--s" />
    </>
  );
}

/* ---------------------------------------------------------------
   1 · Click download
   --------------------------------------------------------------- */
export function Scene1() {
  return (
    <div className="scene">
      <div className="win">
        <div className="win__bar">
          <WindowDots />
          <div className="win__tab">Intentube</div>
          <div className="win__url">
            <LockIcon />
            <span>drive.google.com/file/d/intentube</span>
          </div>
        </div>
        <div className="win__body">
          <PageCopy />
          <button className="btn btn--coral" data-dl type="button" tabIndex={-1}>
            Download Extension
            <span className="ring" data-ring />
          </button>
          <div className="win__meta">Unpacked, works in Chrome 120 and newer</div>
        </div>
      </div>
      <div className="tray">
        <div className="chip" data-zip>
          <span className="chip__ic" />
          intentube.zip
        </div>
      </div>
      <Cursor />
    </div>
  );
}

/* ---------------------------------------------------------------
   2 · Extract the zip file
   --------------------------------------------------------------- */
const FOLDER_PATH =
  'M20 40a9 9 0 0 1 9-9h20l13 13h38a9 9 0 0 1 9 9v44a9 9 0 0 1-9 9H29a9 9 0 0 1-9-9Z';

export function Scene2() {
  /* useId is unique per instance (this scene mounts twice: desktop stage and
     mobile step). Strip the colons React puts in it, because the value is
     referenced as an SVG url(#id) and that must be valid CSS. */
  const raw = useId();
  const uid = `zc${raw.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="scene">
      <div className="zipscene">
        <div className="zipslot">
          <div className="stack" data-zipstack>
            <svg className="zi" width="112" height="112" viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <clipPath id={`${uid}L`}>
                  <rect x="0" y="0" width="60" height="120" />
                </clipPath>
                <clipPath id={`${uid}R`}>
                  <rect x="60" y="0" width="60" height="120" />
                </clipPath>
              </defs>
              {/* The clip sits on the OUTER group and the transform on the
                  INNER one, so each half slides against a stationary seam. */}
              <g clipPath={`url(#${uid}L)`}>
                <g data-half-l>
                  <path className="zip-h" d={FOLDER_PATH} />
                </g>
              </g>
              <g clipPath={`url(#${uid}R)`}>
                <g data-half-r>
                  <path className="zip-h" d={FOLDER_PATH} />
                </g>
              </g>
              <g data-zipper fill="#e8826d" stroke="none">
                <path d="M60 6V78" stroke="#e8826d" strokeWidth="3" strokeLinecap="round" />
                <rect x="54" y="16" width="12" height="5" rx="2" />
                <rect x="54" y="28" width="12" height="5" rx="2" />
                <rect x="54" y="40" width="12" height="5" rx="2" />
                <rect x="54" y="52" width="12" height="5" rx="2" />
                <rect x="52.5" y="72" width="15" height="17" rx="4.5" />
              </g>
            </svg>
            <div className="ziplabel" data-ziplabel>
              intentube.zip
            </div>
          </div>

          <div className="stack" data-folderstack>
            <svg className="zi" width="112" height="112" viewBox="0 0 120 120" aria-hidden="true">
              <path className="zip-h" d={FOLDER_PATH} />
              <rect x="44" y="66" width="32" height="6" rx="3" fill="#174b3a" opacity=".28" />
              <rect x="44" y="78" width="20" height="6" rx="3" fill="#174b3a" opacity=".18" />
            </svg>
            <div className="ziplabel" data-folderlabel>
              intentube
            </div>
          </div>
        </div>

        <div className="zips" data-files>
          <span className="chip">
            <i className="chip__ic chip__ic--doc" />
            manifest.json
          </span>
          <span className="chip">
            <i className="chip__ic chip__ic--doc" />
            popup.html
          </span>
          <span className="chip">
            <i className="chip__ic chip__ic--doc" />
            content.js
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   3 · Open Chrome settings
   --------------------------------------------------------------- */
export function Scene3() {
  return (
    <div className="scene">
      <div className="win">
        <div className="win__bar">
          <WindowDots />
          <div className="win__tab">New tab</div>
          <div className="win__url">
            <LockIcon />
            <span data-url />
            <i className="caret" />
          </div>
          <div className="win__menu" data-menu-btn>
            <KebabIcon />
          </div>
        </div>
        <div className="win__body">
          <PageCopy />
          <div className="ph" style={{ width: '42%' }} />
        </div>
        <div className="menu" data-menu>
          <div className="menu__item">New tab</div>
          <div className="menu__item" data-ext>
            Extensions
          </div>
          <div className="menu__item">Settings</div>
        </div>
      </div>
      <Cursor />
    </div>
  );
}

/* ---------------------------------------------------------------
   4 · Enable developer mode
   --------------------------------------------------------------- */
function DevModeToggle() {
  return (
    <div className="devrow">
      Developer mode
      <span className="toggle" data-toggle>
        <span className="toggle__knob" data-knob />
      </span>
    </div>
  );
}

function ExtBar() {
  return (
    <div className="extbar" data-bar>
      <button className="btn btn--ghost" data-unpacked type="button" tabIndex={-1}>
        Load unpacked
      </button>
      <button className="btn btn--ghost" type="button" tabIndex={-1}>
        Pack extension
      </button>
      <button className="btn btn--ghost" type="button" tabIndex={-1}>
        Update
      </button>
    </div>
  );
}

export function Scene4() {
  return (
    <div className="scene">
      <div className="extpage">
        <div className="extpage__top">
          <div className="extpage__name">
            <span className="extlogo" />
            Extensions
          </div>
          <DevModeToggle />
        </div>
        <div className="extpage__body">
          <ExtBar />
          <div className="extempty" data-empty>
            No extensions loaded yet
          </div>
        </div>
      </div>
      <Cursor />
    </div>
  );
}

/* ---------------------------------------------------------------
   5 · Click load unpacked
   --------------------------------------------------------------- */
export function Scene5() {
  return (
    <div className="scene">
      <div className="extpage">
        <div className="extpage__top">
          <div className="extpage__name">
            <span className="extlogo" />
            Extensions
          </div>
          {/* Developer mode is already on when this scene starts. */}
          <div className="devrow">
            Developer mode
            <span className="toggle is-on">
              <span className="toggle__knob" />
            </span>
          </div>
        </div>
        <div className="extpage__body">
          <ExtBar />
          <div className="extcard" data-card>
            <span className="extlogo" />
            <div>
              <div className="extcard__name">Intentube</div>
              <div className="extcard__id">Manifest V3, unpacked</div>
            </div>
            <span className="extcard__sp" />
            <span className="toggle is-on">
              <span className="toggle__knob" />
            </span>
          </div>
        </div>
      </div>

      <div className="bkd" data-bkd />
      <div className="pickerwrap">
        <div className="picker" data-picker>
          <div className="picker__title">Select the extension folder</div>
          <div className="picker__path">Desktop</div>
          <div className="picker__rows">
            <div className="picker__row" data-hit>
              <span className="picker__ic" />
              intentube
            </div>
            <div className="picker__row picker__row--dim">
              <span className="picker__ic" />
              chrome-mv3
            </div>
          </div>
          <div className="picker__actions">
            <button className="btn btn--coral" data-select type="button" tabIndex={-1}>
              Select folder
            </button>
          </div>
        </div>
      </div>
      <Cursor />
    </div>
  );
}

/* ---------------------------------------------------------------
   6 · Open YouTube and use the extension
   --------------------------------------------------------------- */

/* A tonal green ramp, not a rainbow. KEEP holds the two cards that match the
   intent; they are deliberately the lightest tones so the 2px green outline
   actually reads against them. */
const TONES = [
  '#44695a',
  '#6f8f81',
  '#b7cfc4',
  '#557a6b',
  '#9dbcae',
  '#c9ddd3',
  '#3d4d46',
  '#8fb3a5',
];
export const KEEP = [2, 5];

export function Scene6() {
  return (
    <div className="scene">
      <div className="yt">
        <div className="yt__bar">
          <div className="yt__search">Search</div>
          <span className="yt__sp" />
          <div className="yt__ext" data-extbtn>
            <PuzzleIcon />
          </div>
        </div>
        <div className="yt__grid">
          {TONES.map((tone, i) => (
            <div className="vcard" data-card={i} key={i}>
              <div className="vthumb" style={{ background: tone }}>
                <i className="vring" data-ring={i} />
              </div>
              <div className="vtitle" />
              <div className="vmeta" />
            </div>
          ))}
        </div>
      </div>

      <div className="popup" data-popup>
        <div className="popup__title">
          <span className="extlogo" />
          Intentube
        </div>
        <div className="popup__label">JEV API key</div>
        <div className="popup__field popup__field--key">
          <span data-key />
          <i className="caret" data-keycaret />
          <span className="popup__check" data-check aria-hidden="true">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.8 5.2 4 7.4 8.2 2.6" />
            </svg>
          </span>
        </div>
        <div className="popup__label">Why are you here?</div>
        <div className="popup__field">
          <span data-goal />
          <i className="caret" />
        </div>
        <div className="popup__hint" data-saved>
          Key saved in this browser
        </div>
      </div>

      <div className="donewrap">
        <div className="donepill" data-done>
          Done. You&rsquo;re set.
        </div>
      </div>
      <Cursor />
    </div>
  );
}

/** Renders the scene at `index`. Order is the install order, 0-based. */
export const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
