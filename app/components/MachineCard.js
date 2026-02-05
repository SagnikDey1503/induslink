"use client";

import Link from "next/link";
import Badge from "./Badge";
import { apiFetch } from "../../lib/api";

export default function MachineCard({ machine, showWishlist = false }) {
  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/buyer/saved", {
        method: "POST",
        body: JSON.stringify({ machineId: machine._id })
      });
      alert("Added to wishlist!");
    } catch (err) {
      if (err?.status === 400) {
        alert(err.message || "Machine already in wishlist!");
        return;
      }
      alert("Please log in as a buyer to add to wishlist");
    }
  };

  return (
    <div className="group rounded-2xl border border-white bg-white shadow-soft transition hover:shadow-lg">
      <Link href={`/machines/${machine.slug || machine._id}`} className="block">
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-t-2xl bg-steel-200">
          {machine.photos?.[0] ? (
            <img
              src={machine.photos[0]}
              alt={machine.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : null}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base text-ink-950">{machine.name}</h3>
          {machine.verified ? <Badge tone="accent">Verified</Badge> : null}
        </div>
        <p className="mt-2 text-sm text-ink-700">{machine.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-700 mb-4">
          {machine.features?.slice(0, 2).map((feature) => (
            <span key={feature} className="rounded-full bg-steel-100 px-3 py-1">
              {feature}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/machines/${machine.slug || machine._id}`}
            className={`bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded text-sm transition font-semibold ${
              showWishlist ? "flex-1" : "w-full"
            }`}
          >
            View Details
          </Link>
          {showWishlist ? (
            <button
              onClick={handleWishlist}
              className="flex-0 bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded text-sm transition"
              title="Add to wishlist"
            >
              ❤️
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
