"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { clearAuthUser, getAuthUser } from "../../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "induslink_user") {
        setUser(getAuthUser());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const portal = useMemo(() => {
    if (!user) return null;
    const isSupplier = user.role === "supplier";
    return {
      href: isSupplier ? "/portal/supplier" : "/portal/buyer",
      label: isSupplier ? "Supplier Portal" : "MSME Portal"
    };
  }, [user]);

  const showSupplierCta = !user || user.role !== "supplier";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // Ignore network errors: local logout should still succeed.
    }
    clearAuthUser();
    setUser(null);
    closeMenu();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink-950 text-white">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4 gap-6">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-10 rounded-xl bg-copper-500 text-ink-950 grid place-items-center font-heading text-lg font-semibold">
            IL
          </div>
          <div className="hidden sm:block">
            <p className="font-heading text-lg leading-tight">IndusLink</p>
            <p className="text-xs text-steel-300">MSME Manufacturing Intelligence</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-xs lg:text-sm md:flex flex-1 justify-center">
          <Link href="/industries" className="text-steel-200 hover:text-amber-300 transition-colors whitespace-nowrap">Industries</Link>
          <Link href="/" className="text-steel-200 hover:text-amber-300 transition-colors whitespace-nowrap">How it Works</Link>
          {!portal ? (
            <>
              <Link href="/register/buyer" className="text-steel-200 hover:text-amber-300 transition-colors whitespace-nowrap">MSME Reg</Link>
              <Link href="/register/supplier" className="text-steel-200 hover:text-amber-300 transition-colors whitespace-nowrap">Supplier Reg</Link>
            </>
          ) : null}
          <Link
            href="/portal/admin/verify-machines"
            className="text-steel-300 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            Admin Verify
          </Link>
        </nav>

        {/* Desktop Right Actions (login / portal / logout) */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {portal ? (
            <>
              <Link
                href={portal.href}
                className="whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-white/10 hover:border-white/30"
              >
                {portal.label}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-white/15 hover:border-white/30"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login/buyer"
                className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-white/15 hover:border-white/30"
              >
                MSME Login
              </Link>
              <Link
                href="/login/supplier"
                className="whitespace-nowrap rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-white/10 hover:border-white/35"
              >
                Supplier Login
              </Link>
            </>
          )}

          {showSupplierCta ? (
            <div className="hidden lg:block">
              <Link
                href="/register/supplier"
                className="rounded-full bg-white px-3 py-2 text-xs lg:text-sm font-semibold text-ink-950 shadow-soft hover:bg-steel-100 hover:scale-105 transition-all duration-300 whitespace-nowrap inline-block"
              >
                Become a Supplier
              </Link>
            </div>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col gap-1.5 justify-center items-center w-10 h-10 ml-auto"
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-ink-900 border-t border-steel-700">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4">
            <Link 
              href="/industries" 
              onClick={closeMenu}
              className="text-steel-200 hover:text-white transition-colors py-2"
            >
              Industries
            </Link>
            <Link 
              href="/" 
              onClick={closeMenu}
              className="text-steel-200 hover:text-white transition-colors py-2"
            >
              How it Works
            </Link>
            {portal ? (
              <>
                <Link
                  href={portal.href}
                  onClick={closeMenu}
                  className="text-steel-200 hover:text-white transition-colors py-2"
                >
                  {portal.label}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-left py-2"
                >
                  <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-white/15 hover:border-white/30">
                    Log out
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/register/buyer" 
                  onClick={closeMenu}
                  className="text-steel-200 hover:text-white transition-colors py-2"
                >
                  MSME Registration
                </Link>
                <Link 
                  href="/register/supplier" 
                  onClick={closeMenu}
                  className="text-steel-200 hover:text-white transition-colors py-2"
                >
                  Supplier Registration
                </Link>
                <Link 
                  href="/login/buyer" 
                  onClick={closeMenu}
                  className="text-steel-200 hover:text-white transition-colors py-2"
                >
                  MSME Login
                </Link>
                <Link 
                  href="/login/supplier" 
                  onClick={closeMenu}
                  className="text-steel-200 hover:text-white transition-colors py-2"
                >
                  Supplier Login
                </Link>
              </>
            )}
            <Link
              href="/portal/admin/verify-machines"
              onClick={closeMenu}
              className="text-steel-200 hover:text-white transition-colors py-2"
            >
              Admin Verify
            </Link>
            <div className="pt-2 border-t border-steel-700">
              {showSupplierCta ? (
                <Link
                  href="/register/supplier"
                  onClick={closeMenu}
                  className="block rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 shadow-soft hover:bg-steel-100 transition-colors text-center"
                >
                  Become a Supplier
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
