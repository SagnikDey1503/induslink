import Link from "next/link";

export default function IndustryCard({ industry }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group rounded-2xl border border-white bg-white/80 p-6 shadow-soft transition hover:-translate-y-1 hover:border-copper-400"
    >
      <div className="mb-4 h-10 w-10 rounded-xl bg-ink-900 text-white grid place-items-center font-heading text-sm">
        {industry.name
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </div>
      <h3 className="font-heading text-lg text-ink-950">{industry.name}</h3>
      <p className="mt-2 text-sm text-ink-700">{industry.description}</p>
      <p className="mt-4 text-xs font-semibold text-copper-600">
        {industry.subIndustries?.length || 0} segments
      </p>
    </Link>
  );
}
