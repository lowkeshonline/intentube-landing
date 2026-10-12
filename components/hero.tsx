import { FeedCard } from '@/components/feed-card';
import { Button } from '@/components/ui/button';
import { FEED } from '@/lib/feed';
import { DOWNLOAD_URL } from '@/lib/site';

/**
 * No client JavaScript here: the hero paints from HTML and CSS alone, so the
 * headline can never be missing while a bundle loads.
 */
export function Hero() {
  return (
    <section className="bg-ink pb-24 pt-16 text-white" aria-labelledby="hero-heading">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-7 px-6">
        <p className="rise text-[13px] font-semibold uppercase tracking-[0.14em] text-coral">
          The problem
        </p>

        <h1
          id="hero-heading"
          style={{ animationDelay: '70ms' }}
          className="rise max-w-[900px] text-[clamp(42px,7vw,88px)] font-extrabold leading-[1.02]"
        >
          You opened YouTube to learn one thing.
        </h1>

        <p
          style={{ animationDelay: '140ms' }}
          className="rise max-w-[680px] text-[clamp(18px,2.2vw,24px)] leading-[1.5] text-[#b7c9c0]"
        >
          One tutorial. Twelve minutes, tops. Then the feed said hello, and forty
          minutes later you are watching a stranger rank airport sandwiches.
        </p>

        <div
          style={{ animationDelay: '210ms' }}
          className="rise flex flex-wrap items-center gap-4"
        >
          <Button
            href={DOWNLOAD_URL || '#install'}
            variant="coral"
            {...(DOWNLOAD_URL ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            Download Extension
          </Button>
          <Button href="#setup" variant="outline">
            See how to set it up
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {FEED.map((video, index) => (
            <FeedCard
              key={video.id}
              video={video}
              state="plain"
              entranceDelayMs={280 + index * 45}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
