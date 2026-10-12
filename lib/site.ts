/**
 * Single source of truth for everything the page links to.
 * DOWNLOAD_URL is the only thing that needs changing once the extension is
 * published; while it is empty the CTAs fall back to the install steps.
 *
 * This is a direct-download endpoint for `chrome-mv3.zip` on Google Drive, not a
 * browser page — clicking a CTA saves the build rather than opening Drive.
 * Drive's `/file/d/<id>/view` form was the source URL; `/uc?export=download&id=<id>`
 * is the same file with the preview interstitial removed. Either works.
 */
export const DOWNLOAD_URL =
  'https://drive.google.com/uc?export=download&id=150KvIHdBrAaE5Bb9c5PRXaKQnLRGz6a4';

export const links = {
  github: 'https://github.com/lowkeshonline/Intentube',
  readme: 'https://github.com/lowkeshonline/Intentube#readme',
  issues: 'https://github.com/lowkeshonline/Intentube/issues',
} as const;

export const intent = {
  label: 'React, properly',
  goal: 'React hooks and state, not React drama',
  niches: ['Software & Programming', 'Education & Study'],
} as const;
