export default function Footer() {
  return (
    <footer className="bg-ink-950 text-steel-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-heading text-lg text-white">IndusLink</p>
          <p className="text-sm text-steel-300">
            Structured discovery for manufacturing MSMEs across India.
          </p>
        </div>
        <div className="text-sm text-steel-400">
          <p>Built for MSMEs, OEMs, and plant decision makers.</p>
          <p>Contact: hello@induslink.in</p>
        </div>
      </div>
    </footer>
  );
}
