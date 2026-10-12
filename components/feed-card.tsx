import Image from 'next/image';

import type { FeedVideo } from '@/lib/feed';
import { cn } from '@/lib/utils';

export type FeedCardState = 'plain' | 'kept' | 'dimmed';

type Props = {
  video: FeedVideo;
  state: FeedCardState;
  /** Set on the hero's cards so the load sequence staggers in CSS. */
  entranceDelayMs?: number;
};

/**
 * Presentational on purpose: dimming, blur and the hover-restore are CSS
 * transitions, so the core promise of the product survives a failed script load.
 */
export function FeedCard({ video, state, entranceDelayMs }: Props) {
  const dimmed = state === 'dimmed';

  return (
    <article
      style={
        entranceDelayMs === undefined
          ? undefined
          : { animationDelay: `${entranceDelayMs}ms` }
      }
      className={cn(
        'flex flex-col gap-2.5 rounded-xl bg-white p-3 text-ink transition-[opacity,filter] duration-[350ms] ease-out',
        entranceDelayMs !== undefined && 'rise',
        dimmed
          ? 'opacity-[0.16] grayscale blur-[1px] hover:opacity-100 hover:grayscale-0 hover:blur-none'
          : 'opacity-100',
        state === 'kept' && 'ring-2 ring-brand',
      )}
    >
      <Image
        src={video.thumb}
        alt=""
        aria-hidden
        width={320}
        height={180}
        // next/image refuses SVG unless told not to optimise, so the generated
        // thumbs pass through. Raster thumbs go through the optimiser, so
        // visitors get a resized, modern-format file instead of the 640px original.
        unoptimized={video.thumb.endsWith('.svg')}
        className="h-28 w-full rounded-lg object-cover"
      />
      <p className="text-[15px] font-semibold leading-[1.3]">{video.title}</p>
      <span aria-hidden className="block h-2 w-[55%] rounded bg-dim" />
    </article>
  );
}
