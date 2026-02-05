import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import MachineCard from "../../components/MachineCard";
import { getIndustries, getMachines } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function IndustryDetailPage({ params }) {
  const industries = await getIndustries();
  const industry = industries.find((item) => item.slug === params.slug);
  const machines = await getMachines({ industry: params.slug });

  if (!industry) {
    return (
      <main className="section-padding">
        <div className="mx-auto w-full max-w-4xl px-6">
          <p className="text-sm text-ink-700">Industry not found.</p>
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
        <SectionHeading
          eyebrow="Industry"
          title={industry.name}
          description={industry.description}
        />

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {industry.subIndustries?.map((segment) => (
            <div
              key={segment.slug}
              className="rounded-2xl border border-white bg-white p-5 shadow-soft"
            >
              <h3 className="font-heading text-base text-ink-950">{segment.name}</h3>
              <p className="mt-2 text-sm text-ink-700">{segment.description}</p>
              <p className="mt-3 text-xs font-semibold text-copper-600">{segment.slug}</p>
            </div>
          ))}
        </div>

        <SectionHeading
          eyebrow="Machines"
          title="Machines in this industry"
          description="Verified and high-fit machines mapped to MSME production needs."
        />
        {machines.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {machines.map((machine) => (
              <MachineCard key={machine._id} machine={machine} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-700">No machines added yet for this industry.</p>
        )}
      </div>
    </main>
  );
}
