import SectionHeading from "../components/SectionHeading";
import IndustryCard from "../components/IndustryCard";
import { getIndustries } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <main className="section-padding">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading
          eyebrow="Industries"
          title="Explore MSME-ready manufacturing sectors"
          description="Each industry includes sub-industries and machines tailored to Indian MSME production lines."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard key={industry.slug} industry={industry} />
          ))}
        </div>
      </div>
    </main>
  );
}
