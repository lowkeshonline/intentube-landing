import Image from 'next/image';

import { links } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="bg-ink-deep py-7">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6">
        <Image
          src="/logo-intentube-dark.svg"
          alt="Intentube"
          width={920}
          height={240}
          unoptimized
          className="block h-7 w-auto shrink-0"
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="text-sm text-[#8fa89c]">Tell YouTube why you&rsquo;re here.</p>
          <a
            href={links.github}
            className="rounded text-sm text-[#8fa89c] underline decoration-[#3d5a4e] underline-offset-4 transition-colors hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            Source on GitHub
          </a>
        </div>

        <p className="w-full text-sm text-[#5f7a6d]">
          Intentube is not affiliated with, endorsed by, or sponsored by YouTube or
          Google.
        </p>
      </div>
    </footer>
  );
}
