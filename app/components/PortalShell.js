"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthUser, getAuthUser } from "../../lib/auth";
import { apiFetch } from "../../lib/api";

const isBuyerRole = (value) => value === "buyer" || value === "msme";

const rolesMatch = (requiredRole, actualRole) => {
  if (!requiredRole || !actualRole) return false;
  if (requiredRole === actualRole) return true;
  return isBuyerRole(requiredRole) && isBuyerRole(actualRole);
};

export default function PortalShell({ role, title, subtitle, children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = getAuthUser();
    if (!stored) {
      router.replace(role === "supplier" ? "/login/supplier" : "/login/buyer");
      return;
    }

    if (!rolesMatch(role, stored.role)) {
      router.replace(stored.role === "supplier" ? "/portal/supplier" : "/portal/buyer");
      return;
    }

    setUser(stored);
    setReady(true);
  }, [role, router]);

  const onLogout = () => {
    apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearAuthUser();
    router.replace("/");
  };

  if (!ready) {
    return (
      <main className="section-padding">
        <div className="mx-auto w-full max-w-5xl px-6">
          <p className="text-sm text-ink-600">Checking your session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="section-padding bg-steel-100">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-600">
              {role === "supplier" ? "Supplier Portal" : "MSME Portal"}
            </p>
            <h1 className="mt-3 font-heading text-3xl text-ink-950 md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-ink-700">{subtitle}</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-soft">
            <p className="text-sm font-semibold text-ink-950">{user?.name}</p>
            <p className="text-xs text-ink-600">{user?.email}</p>
            <button
              onClick={onLogout}
              className="mt-3 text-xs font-semibold text-copper-600"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
