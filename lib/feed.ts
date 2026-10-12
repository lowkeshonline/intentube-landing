export type FeedVideo = {
  id: string;
  title: string;
  /** Thumbnail art, generated in `public/thumbs`. */
  thumb: string;
  /** True when the video matches the intent in `lib/site.ts`. */
  relevant: boolean;
};

/**
 * One canonical feed, used three times on the page: undifferentiated in the
 * hero, filtered in the live demo, and as the real screenshot below it. Keeping
 * it identical is what makes the transformation legible.
 */
export const FEED: FeedVideo[] = [
  {
    id: 'hooks',
    title: 'React hooks explained in 12 minutes',
    thumb: '/thumbs/hooks.svg',
    relevant: true,
  },
  {
    id: 'solo-leveling',
    title: '8 Epic Solo Leveling Moments I Cannot Wait to See',
    thumb: '/thumbs/solo-leveling.jpg',
    relevant: false,
  },
  {
    id: 'sandwiches',
    title: 'I ate only airport sandwiches for 24 hours',
    thumb: '/thumbs/sandwiches.svg',
    relevant: false,
  },
  {
    id: 'useeffect',
    title: 'useEffect, finally explained clearly',
    thumb: '/thumbs/useeffect.svg',
    relevant: true,
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan: anime vs manga, which is better?',
    thumb: '/thumbs/attack-on-titan.jpg',
    relevant: false,
  },
  {
    id: 'survive-100-days',
    title: 'Survive 100 days in a circle',
    thumb: '/thumbs/survive-100-days.jpg',
    relevant: false,
  },
  {
    id: 'custom-hook',
    title: 'Build a custom hook from scratch',
    thumb: '/thumbs/custom-hook.svg',
    relevant: true,
  },
  {
    id: 'ishowspeed',
    title: 'IShowSpeed - Shake (Official Music Video)',
    thumb: '/thumbs/ishowspeed.jpg',
    relevant: false,
  },
];

export const relevantCount = FEED.filter((video) => video.relevant).length;
export const distractionCount = FEED.length - relevantCount;
