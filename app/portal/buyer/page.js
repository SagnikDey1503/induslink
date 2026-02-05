"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortalShell from "../../components/PortalShell";
import { apiFetch } from "../../../lib/api";

export default function BuyerPortalPage() {
  const router = useRouter();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [savedMap, setSavedMap] = useState({});
  const [filters, setFilters] = useState({
    industry: "",
    subIndustry: "",
    verified: true,
    search: ""
  });

  useEffect(() => {
    // Load machines
    apiFetch("/api/machines?summary=true")
      .then((payload) => {
        setMachines(payload.data || []);
        setFilteredMachines(payload.data || []);
      })
      .catch(() => setMachines([]));

    // Load industries
    apiFetch("/api/industries")
      .then((payload) => setIndustries(payload.data || []))
      .catch(() => {});

    // Load unread notifications count
    apiFetch("/api/notifications")
      .then((payload) => {
        const unread = (payload.data || []).filter((n) => !n.read).length;
        setUnreadNotifications(unread);
      })
      .catch(() => {});

    // Load saved machines (wishlist) so we can show a filled heart in the portal.
    apiFetch("/api/buyer/saved")
      .then((payload) => {
        const map = {};
        (payload.data || []).forEach((machine) => {
          if (machine?._id) map[machine._id] = true;
        });
        setSavedMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = machines;

    if (filters.verified) {
      filtered = filtered.filter(m => m.verified);
    }

    if (filters.industry) {
      filtered = filtered.filter(m => m.industrySlug === filters.industry);
    }

    if (filters.subIndustry) {
      filtered = filtered.filter(m => m.subIndustrySlug === filters.subIndustry);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.manufacturer?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredMachines(filtered);
  }, [machines, filters]);

  const selectedIndustry = industries.find(ind => ind.slug === filters.industry);
  const subIndustries = selectedIndustry?.subIndustries || [];

  const requestMachine = async (machineId, sellerId) => {
    try {
      await apiFetch("/api/msme/request-machine", {
        method: "POST",
        body: JSON.stringify({ machineId })
      });
      alert("Seller has been contacted and will reach you soon!");
      if (sellerId) {
        router.push(`/portal/buyer/messages?userId=${sellerId}`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSaved = async (machineId) => {
    const alreadySaved = Boolean(savedMap[machineId]);
    try {
      if (alreadySaved) {
        await apiFetch(`/api/buyer/saved/${machineId}`, { method: "DELETE" });
        setSavedMap((prev) => {
          const next = { ...prev };
          delete next[machineId];
          return next;
        });
        return;
      }

      await apiFetch("/api/buyer/saved", {
        method: "POST",
        body: JSON.stringify({ machineId })
      });
      setSavedMap((prev) => ({ ...prev, [machineId]: true }));
    } catch (err) {
      alert(err.message || "Failed to update wishlist");
    }
  };

  return (
    <PortalShell
      role="msme"
      title="Your Smart Buyer Workspace"
      subtitle="Discover, filter, and connect with verified machine suppliers."
    >
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          href="/portal/buyer/wishlist"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg"
        >
          <p className="text-3xl mb-2">❤️</p>
          <p className="font-bold">Wishlist</p>
          <p className="text-sm opacity-90">Saved machines</p>
        </Link>

        <Link
          href="/portal/buyer/notifications"
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg relative"
        >
          <p className="text-3xl mb-2">🔔</p>
          <p className="font-bold">Notifications</p>
          <p className="text-sm opacity-90">Updates & alerts</p>
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadNotifications}
            </span>
          )}
        </Link>

        <Link
          href="/portal/buyer/messages"
          className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg"
        >
          <p className="text-3xl mb-2">💬</p>
          <p className="font-bold">Messages</p>
          <p className="text-sm opacity-90">Chat with sellers</p>
        </Link>

        <Link
          href="/portal/buyer/requests"
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg"
        >
          <p className="text-3xl mb-2">📋</p>
          <p className="font-bold">My Requests</p>
          <p className="text-sm opacity-90">Track inquiries</p>
        </Link>
      </div>

      {/* Smart Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-bold mb-4">Smart Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search machines..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="border rounded px-3 py-2 outline-none focus:border-blue-500"
          />
          
          <select
            value={filters.industry}
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value, subIndustry: "" }))}
            className="border rounded px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">All Industries</option>
            {industries.map(ind => (
              <option key={ind.slug} value={ind.slug}>{ind.name}</option>
            ))}
          </select>

          <select
            value={filters.subIndustry}
            onChange={(e) => setFilters(prev => ({ ...prev, subIndustry: e.target.value }))}
            className="border rounded px-3 py-2 outline-none focus:border-blue-500"
            disabled={!filters.industry}
          >
            <option value="">All Sub-Industries</option>
            {subIndustries.map(sub => (
              <option key={sub.slug} value={sub.slug}>{sub.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
              className="rounded"
            />
            <span>Verified Only</span>
          </label>
        </div>
      </div>

      {/* Machines Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Available Machines ({filteredMachines.length})</h2>
          <button
            onClick={() => setFilters({ industry: "", subIndustry: "", verified: true, search: "" })}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear Filters
          </button>
        </div>
        
        {filteredMachines.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No machines found matching your criteria.</p>
            <button
              onClick={() => setFilters({ industry: "", subIndustry: "", verified: false, search: "" })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Show All Machines
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredMachines.map((machine) => (
              <div key={machine._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {machine.photos?.[0] && (
                  <img src={machine.photos[0]} alt={machine.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{machine.name}</h3>
                    {machine.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{machine.description}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Manufacturer:</strong> {machine.manufacturer}
                  </p>
                  {machine.leadTimeDays && (
                    <p className="text-sm text-gray-500 mb-4">
                      <strong>Lead Time:</strong> {machine.leadTimeDays} days
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestMachine(machine._id, machine.ownerUserId)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition"
                    >
                      Contact Seller
                    </button>
                    <Link
                      href={`/machines/${machine.slug || machine._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition text-center"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSaved(machine._id)}
                      className={`w-10 rounded text-sm transition ${
                        savedMap[machine._id]
                          ? "bg-red-100 hover:bg-red-200 text-red-600"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      title={savedMap[machine._id] ? "Remove from wishlist" : "Add to wishlist"}
                      aria-label={savedMap[machine._id] ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {savedMap[machine._id] ? "❤️" : "♡"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
