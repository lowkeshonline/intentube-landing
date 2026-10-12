import { Button } from '@/components/ui/button';
import { DOWNLOAD_URL } from '@/lib/site';

export function InstallCta() {
  return (
    <section id="install" className="scroll-mt-6 bg-ink py-28 text-center text-white">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-7 px-6">
        <h2 className="max-w-[820px] text-[clamp(36px,6vw,72px)] font-extrabold leading-[1.04]">
          Open YouTube. Say why. Stay on purpose.
        </h2>

        <Button
          href={DOWNLOAD_URL || '#install'}
          variant="light"
          size="lg"
          {...(DOWNLOAD_URL ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          Download Extension
        </Button>

        {DOWNLOAD_URL ? (
          <p className="text-sm text-[#8fa89c]">
            Chrome and other Chromium browsers, unpacked from the release bundle.
          </p>
        ) : (
          <p className="max-w-[520px] text-sm text-[#8fa89c]">
            The Chrome Web Store listing is not live yet. Until it is, unpack the
            build from{' '}
            <a
              href="https://github.com/lowkeshonline/Intentube#setup"
              className="rounded text-white underline decoration-[#5d8a76] underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              the repository
            </a>
            .
          </p>
        )}
      </div>
    </section>
  );
}
