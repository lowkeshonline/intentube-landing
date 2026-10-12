import { FeedDemo } from '@/components/feed-demo';

export function TheShift() {
  return (
    <section id="how" className="scroll-mt-6 bg-paper py-24">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
          How it works
        </p>
        <h2 className="max-w-[900px] text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.05]">
          Tell YouTube why you&rsquo;re here.{' '}
          <span className="text-brand">Everything else fades away.</span>
        </h2>
        <p className="max-w-[640px] text-xl leading-[1.55] text-body">
          Same feed. Same videos. Intentube just asks the one question YouTube
          never does, then quietly mutes whatever has nothing to do with your
          answer.
        </p>

        <FeedDemo />
      </div>
    </section>
  );
}
