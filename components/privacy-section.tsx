export function PrivacySection() {
  return (
    <section id="privacy" className="scroll-mt-6 bg-brand py-24 text-white">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#bfe0d1]">
          Privacy
        </p>
        <h2 className="max-w-[820px] text-[clamp(34px,5vw,60px)] font-extrabold leading-[1.06]">
          No backend. No tracking. Nothing to sign up for.
        </h2>
        <p className="max-w-[700px] text-[19px] leading-[1.6] text-[#d6eadf]">
          Everything runs inside the extension. Your key never leaves the browser
          except to query the AI service you chose. The extension asks for
          permission to store your settings and to reach api.typesafe.ai &mdash;
          nothing else.
        </p>
      </div>
    </section>
  );
}
