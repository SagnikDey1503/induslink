import SectionHeading from "../../components/SectionHeading";
import BuyerRegistrationForm from "../../components/BuyerRegistrationForm";

export default function BuyerRegistrationPage() {
  return (
    <main className="section-padding">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Buyer Registration"
            title="Source machines with confidence"
            description="Create your buyer profile and get matched with verified suppliers and relevant machine categories."
          />
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <BuyerRegistrationForm />
          </div>
        </div>
        <div className="rounded-3xl bg-ink-950 p-8 text-white">
          <h3 className="font-heading text-2xl">What you unlock</h3>
          <ul className="mt-4 space-y-3 text-sm text-steel-200">
            <li>Industry-specific machine recommendations</li>
            <li>Verified supplier outreach within 48 hours</li>
            <li>Decision-ready specs and ROI notes</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
