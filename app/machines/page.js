import Link from "next/link";
import SectionHeading from "../components/SectionHeading";
import MachineCard from "../components/MachineCard";
import { getMachines } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const machines = await getMachines({ verified: true });

  return (
    <main className="section-padding">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow="Verified Machines"
            title="Browse verified machine listings"
            description="Explore machines with verified specs and supplier checks for faster procurement."
          />
          <Link href="/industries" className="text-sm font-semibold text-copper-600">
            Browse by industry →
          </Link>
        </div>

        {machines.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {machines.map((machine) => (
              <MachineCard key={machine._id} machine={machine} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-700">No verified machines are live yet.</p>
        )}
      </div>
    </main>
  );
}

