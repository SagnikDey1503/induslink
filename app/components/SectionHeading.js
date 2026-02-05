export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-10">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-3xl text-ink-950 md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-base text-ink-700">{description}</p>
      ) : null}
    </div>
  );
}
