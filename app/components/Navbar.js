"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { clearAuthUser, getAuthUser } from "../../lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const startMenuRef = useRef(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  useEffect(() => {
    // Close menus on navigation.
    setIsMenuOpen(false);
    setIsStartOpen(false);
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

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (!startMenuRef.current) return;
      if (startMenuRef.current.contains(event.target)) return;
      setIsStartOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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

  const navItemClass = (href) => {
    const isHome = href === "/";
    const active = isHome ? pathname === "/" : pathname?.startsWith(href);
    return `whitespace-nowrap rounded-full px-4 py-2 text-xs lg:text-sm font-semibold transition ${
      active
        ? "bg-copper-500 text-ink-950 shadow-soft"
        : "text-steel-200 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-xl border-b border-white/10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(90deg, rgba(243,140,58,0.18), rgba(13,15,20,0) 28%, rgba(53,179,127,0.12) 72%, rgba(95,120,152,0.14))"
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" aria-label="IndusLink home">
          <img
            src="/induslink-mark.svg"
            alt="IndusLink"
            className="h-10 w-10"
            width={40}
            height={40}
            loading="eager"
          />
          <div className="hidden sm:block">
            <p className="font-heading text-lg leading-tight">IndusLink</p>
            <p className="text-xs text-steel-300">MSME Manufacturing Intelligence</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-1 rounded-full border border-white/12 bg-gradient-to-r from-white/10 via-white/5 to-white/10 p-1 shadow-soft">
            <Link href="/industries" className={navItemClass("/industries")}>
              Industries
            </Link>
            <Link href="/" className={navItemClass("/")}>
              How it Works
            </Link>
            <Link href="/portal/admin/verify-machines" className={navItemClass("/portal/admin/verify-machines")}>
              Admin Verify
            </Link>
          </div>
        </nav>

        {/* Desktop Right Actions (login / portal / logout) */}
        <div className="hidden md:flex items-center gap-3">
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
            <div ref={startMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsStartOpen((prev) => !prev)}
                className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-white/15 hover:border-white/30"
                aria-haspopup="menu"
                aria-expanded={isStartOpen}
              >
                Get Started
              </button>
              {isStartOpen ? (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-ink-950/95 p-2 shadow-glow backdrop-blur-xl">
                  <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
                    Register
                  </p>
                  <Link
                    href="/register/buyer"
                    onClick={() => setIsStartOpen(false)}
                    className="mt-1 block rounded-xl px-3 py-2 text-sm text-steel-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Register as MSME
                  </Link>
                  <Link
                    href="/register/supplier"
                    onClick={() => setIsStartOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-steel-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Register as Supplier
                  </Link>
                  <div className="my-2 h-px bg-white/10" />
                  <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
                    Login
                  </p>
                  <Link
                    href="/login/buyer"
                    onClick={() => setIsStartOpen(false)}
                    className="mt-1 block rounded-xl px-3 py-2 text-sm text-steel-200 transition hover:bg-white/10 hover:text-white"
                  >
                    MSME Login
                  </Link>
                  <Link
                    href="/login/supplier"
                    onClick={() => setIsStartOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm text-steel-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Supplier Login
                  </Link>
                </div>
              ) : null}
            </div>
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
          className="md:hidden ml-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-steel-200 shadow-soft transition hover:bg-white/10 hover:text-white"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="mr-2">{isMenuOpen ? "Close" : "Menu"}</span>
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-white transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-[6px]" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[6px] h-0.5 w-5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[12px] h-0.5 w-5 bg-white transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-ink-950/55 backdrop-blur-sm"
          />
          <div className="fixed right-0 top-0 z-50 h-dvh w-[min(420px,88vw)] border-l border-white/10 bg-ink-950/95 shadow-glow backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-500">
                Navigation
              </p>
              <button
                type="button"
                onClick={closeMenu}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-steel-200 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6 space-y-6 overflow-y-auto h-[calc(100dvh-88px)]">
              <div className="space-y-2">
                <Link
                  href="/industries"
                  onClick={closeMenu}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Industries
                </Link>
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  How it Works
                </Link>
                <Link
                  href="/portal/admin/verify-machines"
                  onClick={closeMenu}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Admin Verify
                </Link>
              </div>

              {portal ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
                    Your account
                  </p>
                  <Link
                    href={portal.href}
                    onClick={closeMenu}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    {portal.label}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-left text-base font-semibold text-white transition hover:bg-white/15"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-steel-400">
                    Get started
                  </p>
                  <div className="grid gap-2">
                    <Link
                      href="/register/buyer"
                      onClick={closeMenu}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      Register as MSME
                    </Link>
                    <Link
                      href="/register/supplier"
                      onClick={closeMenu}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      Register as Supplier
                    </Link>
                    <Link
                      href="/login/buyer"
                      onClick={closeMenu}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      MSME Login
                    </Link>
                    <Link
                      href="/login/supplier"
                      onClick={closeMenu}
                      className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    >
                      Supplier Login
                    </Link>
                  </div>
                </div>
              )}

              {showSupplierCta ? (
                <Link
                  href="/register/supplier"
                  onClick={closeMenu}
                  className="block rounded-2xl bg-white px-4 py-4 text-center text-base font-semibold text-ink-950 shadow-soft transition hover:bg-steel-100"
                >
                  Become a Supplier
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
