import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Flat panel with a hairline border — the page uses borders, not shadows, so
 * depth stays reserved for the feed dimming.
 */
export function Card({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-2xl border border-[#dbe5e0] bg-white p-7',
        className,
      )}
      {...props}
    />
  );
}
