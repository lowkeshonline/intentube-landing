'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';

import { FeedCard } from '@/components/feed-card';
import { Button } from '@/components/ui/button';
import { distractionCount, FEED, relevantCount } from '@/lib/feed';
import { dimTransition } from '@/lib/motion';
import { intent } from '@/lib/site';
import { cn } from '@/lib/utils';

type DisplayMode = 'dim' | 'hide';

export function FeedDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();

  const [intentSet, setIntentSet] = useState(false);
  const [mode, setMode] = useState<DisplayMode>('dim');

  // The page's one deliberate scroll-triggered moment: the feed filters itself
  // once, so a reader who never touches a control still sees the change happen.
  useEffect(() => {
    if (!inView) return;
    // Settled asynchronously either way: reduced motion just skips the beat.
    const timer = window.setTimeout(() => setIntentSet(true), reduced ? 0 : 450);
    return () => window.clearTimeout(timer);
  }, [inView, reduced]);

  const hiding = intentSet && mode === 'hide';
  const visible = hiding ? FEED.filter((video) => video.relevant) : FEED;

  const status = !intentSet
    ? `${FEED.length} videos, every one of them asking for you.`
    : hiding
      ? `${relevantCount} match what you came for. ${distractionCount} leave the grid.`
      : `${relevantCount} match what you came for. ${distractionCount} fade back, still there to watch.`;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-hairline bg-white px-5 py-4">
        <p className="text-[15px] text-body">
          <span className="font-semibold text-ink">Intent: </span>
          {intentSet ? (
            <>
              {intent.label}
              <span className="text-body/70"> &mdash; &ldquo;{intent.goal}&rdquo;</span>
            </>
          ) : (
            <span className="text-body/70">nothing set, so nothing is filtered</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <AnimatePresence initial={false}>
            {intentSet && (
              <motion.div
                key="mode"
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
                transition={dimTransition}
                role="group"
                aria-label="When a video is a distraction"
                className="flex rounded-full border border-hairline p-1"
              >
                {(['dim', 'hide'] as const).map((option) => {
                  const active = mode === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMode(option)}
                      className={cn(
                        'relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral',
                        active ? 'text-white' : 'text-body hover:text-ink',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="mode-pill"
                          className="absolute inset-0 rounded-full bg-brand"
                          transition={dimTransition}
                        />
                      )}
                      <span className="relative">
                        {option === 'dim' ? 'Dim it' : 'Hide it'}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant={intentSet ? 'light' : 'solid'}
            size="sm"
            onClick={() => setIntentSet((current) => !current)}
            aria-pressed={intentSet}
            className={intentSet ? 'border border-hairline' : undefined}
          >
            {intentSet ? 'Clear intent' : 'Set intent'}
          </Button>
        </div>
      </div>

      <p aria-live="polite" className="text-[15px] text-body">
        {status}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((video) => (
            <motion.div
              key={video.id}
              layout
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={dimTransition}
            >
              <FeedCard
                video={video}
                state={!intentSet ? 'plain' : video.relevant ? 'kept' : 'dimmed'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-[15px] text-body">
        A faded video is never removed. Click it and it plays like any other.
      </p>
    </div>
  );
}
