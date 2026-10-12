import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { DOWNLOAD_URL } from '@/lib/site';

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#setup', label: 'How to setup' },
  { href: '#controls', label: 'Controls' },
  { href: '#privacy', label: 'Privacy' },
];

export function SiteHeader() {
  return (
    <header className="bg-ink">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Image
          src="/logo-intentube-dark.svg"
          alt="Intentube"
          width={920}
          height={240}
          loading="eager"
          fetchPriority="high"
          unoptimized
          className="block h-9 w-auto shrink-0"
        />

        <nav className="flex flex-wrap items-center gap-6">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded text-[15px] text-[#c9ddd3] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              {item.label}
            </a>
          ))}
          <Button
            href={DOWNLOAD_URL || '#install'}
            variant="light"
            size="sm"
            {...(DOWNLOAD_URL
              ? { target: '_blank', rel: 'noreferrer' }
              : {})}
          >
            Download Extension
          </Button>
        </nav>
      </div>
    </header>
  );
}
