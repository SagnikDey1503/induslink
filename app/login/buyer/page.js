import SectionHeading from "../../components/SectionHeading";
import LoginForm from "../../components/LoginForm";

export default function BuyerLoginPage() {
  return (
    <main className="section-padding">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Buyer Login"
            title="Welcome back, procurement teams"
            description="Access your machine shortlists, quotes, and verified suppliers."
          />
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <LoginForm role="msme" />
          </div>
        </div>
        <div className="rounded-3xl bg-ink-950 p-8 text-white">
          <h3 className="font-heading text-2xl">Buyer access includes</h3>
          <ul className="mt-4 space-y-3 text-sm text-steel-200">
            <li>Industry-specific machine recommendations</li>
            <li>Saved comparisons and notes</li>
            <li>Verified supplier outreach</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
