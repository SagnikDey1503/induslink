import Link from "next/link";
import SectionHeading from "./components/SectionHeading";
import IndustryCard from "./components/IndustryCard";
import MachineCard from "./components/MachineCard";
import Hero from "./components/Hero";
import WhoWeAre from "./components/WhoWeAre";
import { getIndustries, getMachines } from "../lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [industries, machines] = await Promise.all([
    getIndustries(),
    getMachines({ verified: true })
  ]);

  return (
    <main>
      <Hero />
      <WhoWeAre />

      <section className="section-padding bg-steel-100">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading
            eyebrow="Why IndusLink"
            title="Decision-ready machine intelligence"
            description="We remove guesswork by combining verified equipment data, use cases, and supplier credibility in one place."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Structured specs",
                copy: "Compare throughput, utilities, and compliance requirements side by side."
              },
              {
                title: "Industry context",
                copy: "Every machine is tagged to processes, materials, and MSME-ready use cases."
              },
              {
                title: "Verified suppliers",
                copy: "Supplier checks and verified machine tags reduce procurement risk."
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white bg-white p-6 shadow-soft"
              >
                <h3 className="font-heading text-lg text-ink-950">{item.title}</h3>
                <p className="mt-3 text-sm text-ink-700">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading
            eyebrow="Industries"
            title="Start with your manufacturing domain"
            description="Explore curated industry pathways and sub-industries tailored for Indian MSMEs."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {industries.slice(0, 6).map((industry) => (
              <IndustryCard key={industry.slug} industry={industry} />
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/industries"
              className="text-sm font-semibold text-copper-600"
            >
              View all industries →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-steel-100">
        <div className="mx-auto w-full max-w-6xl px-6">
          <SectionHeading
            eyebrow="Verified Machines"
            title="High-confidence equipment picks"
            description="Machines with verified specs and supplier checks for faster procurement."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {machines.slice(0, 3).map((machine) => (
              <MachineCard key={machine._id} machine={machine} />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/machines" className="text-sm font-semibold text-copper-600">
              View all machines →
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-ink-950 text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="A clear pathway from need to machine"
              description="Define your process requirements, compare verified machines, and connect with trusted suppliers."
            />
          </div>
          <div className="grid gap-4">
            {[
              {
                step: "01",
                title: "Tell us your process",
                copy: "Select your industry and sub-industry to see relevant equipment."
              },
              {
                step: "02",
                title: "Compare machine intelligence",
                copy: "Evaluate specs, utilities, and output to shortlist quickly."
              },
              {
                step: "03",
                title: "Connect to verified partners",
                copy: "Reach vetted suppliers with a single request."
              }
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-ink-900/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-500">
                  {item.step}
                </p>
                <h3 className="mt-2 font-heading text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-steel-300">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
