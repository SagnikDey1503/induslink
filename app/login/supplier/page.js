import SectionHeading from "../../components/SectionHeading";
import LoginForm from "../../components/LoginForm";

export default function SupplierLoginPage() {
  return (
    <main className="section-padding">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="SUPPLIER LOGIN"
            title="Manage your listings and leads"
            description="Track verified status, manage machines, and respond to MSME buyers."
          />
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <LoginForm role="supplier" />
          </div>
        </div>
        <div className="rounded-3xl bg-ink-950 p-8 text-white">
          <h3 className="font-heading text-2xl">Supplier Tools</h3>
          <ul className="mt-4 space-y-3 text-sm text-steel-200">
            <li>Verified supplier badge tracking</li>
            <li>Buyer inquiry inbox</li>
            <li>Insights on machine demand</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
