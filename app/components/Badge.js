export default function Badge({ children, tone = "dark" }) {
  const toneStyles =
    tone === "accent"
      ? "bg-copper-500 text-ink-950"
      : "bg-ink-900 text-steel-200";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneStyles}`}>
      {children}
    </span>
  );
}
