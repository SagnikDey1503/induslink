import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-steel-200 border-t border-white/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src="/induslink-mark.svg"
                alt="IndusLink"
                className="h-10 w-10"
                width={40}
                height={40}
                loading="lazy"
              />
              <div>
                <p className="font-heading text-lg text-white leading-tight">IndusLink</p>
                <p className="text-xs text-steel-400">MSME Manufacturing Intelligence</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-steel-300 leading-relaxed">
              Structured discovery for manufacturing MSMEs across India. Compare verified machines, connect with
              suppliers, and move from sourcing to shortlist faster.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
              Quick links
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <Link href="/industries" className="hover:text-white transition">
                Industries
              </Link>
              <Link href="/" className="hover:text-white transition">
                How it Works
              </Link>
              <Link href="/portal/admin/verify-machines" className="hover:text-white transition">
                Admin Verify
              </Link>
              <Link href="/register/buyer" className="hover:text-white transition">
                MSME Registration
              </Link>
              <Link href="/register/supplier" className="hover:text-white transition">
                Supplier Registration
              </Link>
            </div>
          </div>

          <div className="md:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
              Contact
            </p>
            <div className="mt-4 space-y-2 text-sm text-steel-300">
              <p>Built for MSMEs, OEMs, and plant decision makers.</p>
              <p className="break-words">
                Email:{" "}
                <a className="text-white hover:text-copper-400 transition" href="mailto:hello@induslink.in">
                  hello@induslink.in
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-steel-400">
          <p>© {year} IndusLink. All rights reserved.</p>
          <p>Verified discovery • Secure conversations • Faster procurement</p>
        </div>
      </div>
    </footer>
  );
}
