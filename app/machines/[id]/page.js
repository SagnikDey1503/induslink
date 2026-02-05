import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import Badge from "../../components/Badge";
import { getMachine } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function MachineDetailPage({ params }) {
  const machine = await getMachine(params.id);

  if (!machine) {
    return (
      <main className="section-padding">
        <div className="mx-auto w-full max-w-4xl px-6">
          <p className="text-sm text-ink-700">Machine not found.</p>
          <Link href="/industries" className="mt-4 inline-block text-sm font-semibold text-copper-600">
            Back to industries
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-padding">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-600">Machine</p>
            <h1 className="mt-3 font-heading text-3xl text-ink-950">{machine.name}</h1>
            <p className="mt-2 text-sm text-ink-700">{machine.description}</p>
          </div>
          {machine.verified ? <Badge tone="accent">Verified</Badge> : null}
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            {machine.photos?.length ? (
              <div className="relative h-80 w-full overflow-hidden rounded-3xl bg-steel-200">
                <img src={machine.photos[0]} alt={machine.name} className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {machine.photos?.slice(1).map((photo) => (
                <div key={photo} className="relative h-48 w-full overflow-hidden rounded-2xl bg-steel-200">
                  <img src={photo} alt={machine.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white bg-white p-6 shadow-soft">
            <SectionHeading
              eyebrow="Highlights"
              title="Machine overview"
              description="Key specs and features in one view."
            />
            <div className="space-y-4 text-sm text-ink-700">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Manufacturer</p>
                <p className="mt-1 text-base text-ink-950">{machine.manufacturer || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Lead Time</p>
                <p className="mt-1 text-base text-ink-950">{machine.leadTimeDays || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Minimum Order</p>
                <p className="mt-1 text-base text-ink-950">{machine.minOrderQty || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Condition</p>
                <p className="mt-1 text-base text-ink-950">{machine.condition || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Warranty</p>
                <p className="mt-1 text-base text-ink-950">
                  {Number.isFinite(machine.warrantyMonths) ? `${machine.warrantyMonths} months` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Price Range</p>
                <p className="mt-1 text-base text-ink-950">{machine.priceRange || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Features"
              title="Why MSMEs pick it"
              description="Practical value drivers for production floors."
            />
            <ul className="space-y-3 text-sm text-ink-700">
              {machine.features?.map((feature) => (
                <li key={feature} className="rounded-xl border border-white bg-white p-4 shadow-soft">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading
              eyebrow="Specs"
              title="Technical highlights"
              description="Compare specs quickly for a confident shortlist."
            />
            <div className="space-y-3">
              {machine.specs?.map((spec) => (
                <div key={spec.key} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-soft">
                  <p className="text-sm font-semibold text-ink-950">{spec.key}</p>
                  <p className="text-sm text-ink-700">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-ink-950 p-8 text-white">
          <h2 className="font-heading text-2xl">Ready to request pricing?</h2>
          <p className="mt-2 text-sm text-steel-300">
            Share your volume and timeline, and our team will connect you with the right supplier.
          </p>
          <Link
            href="/register/buyer"
            className="mt-4 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-950"
          >
            Start a buyer request
          </Link>
        </div>
      </div>
    </main>
  );
}
