import { Card } from '@/components/ui/card';

const CONTROLS = [
  {
    title: 'Certainty slider',
    body: 'Decide how sure the AI must be before a video fades. Loose for exploring, strict for deadlines.',
  },
  {
    title: 'Dim amount',
    body: 'Fade distractions to a whisper, or only a nudge. You set how loud the background gets.',
  },
  {
    title: 'Hide all Shorts',
    body: 'One switch removes the endless swipe from your feed entirely.',
  },
  {
    title: 'Reset to original feed',
    body: 'One click clears your intent and brings every video back. No lock-in.',
  },
];

export function Controls() {
  return (
    <section id="controls" className="scroll-mt-6 bg-paper py-24">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-10 px-6">
        <div className="flex flex-col gap-3.5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
            You stay in control
          </p>
          <h2 className="max-w-[720px] text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.08]">
            Strict when you need to be. Gentle when you don&rsquo;t.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTROLS.map((control) => (
            <Card key={control.title}>
              <h3 className="text-[21px] font-bold">{control.title}</h3>
              <p className="leading-[1.55] text-body">{control.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
