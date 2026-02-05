import SectionHeading from "../../components/SectionHeading";
import MsmeRegistrationForm from "../../components/MsmeRegistrationForm";

export default function SupplierRegistrationPage() {
  return (
    <main className="section-padding">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="SUPPLIER REGISTRATION"
            title="List your machines and reach MSMEs"
            description="Register as a supplier and showcase your equipment with verified specs to qualified MSME buyers across India."
          />
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <MsmeRegistrationForm />
          </div>
        </div>
        <div className="rounded-3xl bg-ink-950 p-8 text-white">
          <h3 className="font-heading text-2xl">Benefits for Suppliers</h3>
          <ul className="mt-4 space-y-3 text-sm text-steel-200">
            <li>Structured machine profiles for higher conversion</li>
            <li>Verified badges for trusted suppliers</li>
            <li>Direct visibility to MSME buyers</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
