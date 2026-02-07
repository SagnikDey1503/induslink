export default function SectionHeading({ eyebrow, title, description, theme = "light" }) {
  const descriptionColor = theme === "dark" ? "text-steel-200" : "text-ink-700";
  const titleColor = theme === "dark" ? "text-white" : "text-ink-950";
  const eyebrowColor = theme === "dark" ? "text-copper-400" : "text-copper-600";
  
  return (
    <div className="mb-10">
      {eyebrow ? (
        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`mt-3 font-heading text-3xl md:text-4xl ${titleColor}`}>{title}</h2>
      {description ? (
        <p className={`mt-3 max-w-2xl text-base ${descriptionColor}`}>{description}</p>
      ) : null}
    </div>
  );
}
