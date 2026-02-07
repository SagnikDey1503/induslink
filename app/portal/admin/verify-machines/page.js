"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

const ADMIN_KEY_STORAGE = "induslink_admin_key";

function sellerLabel(seller) {
  if (!seller) return "Unknown seller";
  return seller.companyName || seller.name || seller.email || "Unknown seller";
}

export default function AdminVerifyMachinesPage() {
  const [adminKey, setAdminKey] = useState("");
  const [rememberKey, setRememberKey] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionDrafts, setQuestionDrafts] = useState({});
  const [priorityDrafts, setPriorityDrafts] = useState({});
  const [sendingQuestionId, setSendingQuestionId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "—";
    }
  };

  const lastMessage = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  const awaitingSellerResponse = (messages) => lastMessage(messages)?.sender === "admin";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    if (stored) {
      setAdminKey(stored);
      setRememberKey(true);
    }
  }, []);

  const headers = useMemo(() => {
    return adminKey ? { "X-Admin-Key": adminKey } : {};
  }, [adminKey]);

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      if (typeof window !== "undefined") {
        if (rememberKey && adminKey) {
          window.localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
        } else {
          window.localStorage.removeItem(ADMIN_KEY_STORAGE);
        }
      }
      const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const payload = await apiFetch(`/api/admin/verify-machines${query}`, { headers });
      setQueue(payload.data || []);
    } catch (err) {
      setError(err.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (verificationId, status) => {
    if (!adminKey) {
      alert("Enter your ADMIN_KEY first.");
      return;
    }

    let rejectionReason = "";
    if (status === "rejected") {
      rejectionReason = window.prompt("Rejection reason (optional):", "") || "";
    }

    try {
      setUpdatingStatusId(verificationId);
      const payload = await apiFetch(`/api/admin/verify-machines/${verificationId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, rejectionReason })
      });

      const updated = payload?.data?.verification || payload?.data;
      const machineId = payload?.data?.machine?._id || updated?.machineId;

      setQueue((prev) => {
        const next = prev.map((item) => {
          if (item._id !== verificationId) return item;
          return {
            ...item,
            status: updated?.status ?? item.status,
            rejectionReason: updated?.rejectionReason ?? item.rejectionReason,
            machineId: machineId ?? item.machineId,
            messages: updated?.messages ?? item.messages,
            updatedAt: updated?.updatedAt ?? item.updatedAt
          };
        });

        const updatedStatus = updated?.status;
        const shouldKeep = !statusFilter || statusFilter === updatedStatus;
        return shouldKeep ? next : next.filter((item) => item._id !== verificationId);
      });
    } catch (err) {
      alert(err.message || "Failed to update verification");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const sendQuestion = async (verificationId) => {
    if (!adminKey) {
      alert("Enter your ADMIN_KEY first.");
      return;
    }

    const content = String(questionDrafts[verificationId] || "").trim();
    if (!content) return;

    const priority = priorityDrafts[verificationId] ?? true;

    setSendingQuestionId(verificationId);
    try {
      const payload = await apiFetch(`/api/admin/verify-machines/${verificationId}/message`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content, priority })
      });

      setQueue((prev) =>
        prev.map((item) =>
          item._id === verificationId
            ? { ...item, messages: payload?.data?.messages ?? item.messages, updatedAt: payload?.data?.updatedAt ?? item.updatedAt }
            : item
        )
      );
      setQuestionDrafts((prev) => ({ ...prev, [verificationId]: "" }));
    } catch (err) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingQuestionId(null);
    }
  };

  const clearSavedKey = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ADMIN_KEY_STORAGE);
    }
    setAdminKey("");
    setRememberKey(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-steel-100 via-white to-steel-50">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-ink-950 to-ink-900 p-6 text-white shadow-lg">
          <div>
            <h1 className="text-3xl font-heading font-bold">Machine Verification Admin</h1>
            <p className="mt-1 text-sm text-steel-300">
              Approve or reject supplier submissions and publish verified machines.
            </p>
          </div>
          <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20 transition">
            ← Back to site
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft border border-steel-200">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-ink-900">
              Admin Key
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter ADMIN_KEY"
                className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-2.5 outline-none focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20 transition"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-ink-700">
                  <input
                    type="checkbox"
                    checked={rememberKey}
                    onChange={(e) => setRememberKey(e.target.checked)}
                    className="rounded border-steel-300 text-copper-600 focus:ring-copper-500"
                  />
                  Remember key
                </label>
                <button
                  type="button"
                  onClick={clearSavedKey}
                  className="text-xs font-semibold text-ink-600 hover:text-ink-900 transition"
                >
                  Clear saved
                </button>
              </div>
            </label>

            <label className="text-sm font-semibold text-ink-900">
              Filter Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-2 w-full rounded-xl border border-steel-300 px-4 py-2.5 outline-none focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20 transition"
              >
                <option value="pending">⏳ Pending</option>
                <option value="approved">✓ Approved</option>
                <option value="rejected">✗ Rejected</option>
                <option value="">All Submissions</option>
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={loadQueue}
                disabled={loading}
                className="w-full rounded-xl bg-copper-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-copper-700 disabled:bg-steel-400 transition shadow-soft"
              >
                {loading ? "Loading..." : "🔄 Load Queue"}
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-soft border border-steel-200">
              <div className="mx-auto w-16 h-16 rounded-full bg-steel-100 flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-ink-700 font-medium">No verification submissions found for this filter.</p>
              <p className="text-sm text-ink-600 mt-1">Try changing the filter or loading the queue.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white p-6 shadow-soft border border-steel-200 hover:shadow-lg transition">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h2 className="text-2xl font-heading font-bold text-ink-950">{item.name}</h2>
                        <p className="mt-2 text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-blue-700 font-medium">
                        🏭 {item.industrySlug}
                      </span>
                      <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 text-purple-700 font-medium">
                        📦 {item.subIndustrySlug}
                      </span>
                      <span className="rounded-full bg-steel-100 border border-steel-300 px-3 py-1.5 text-ink-700 font-medium">
                        📅 {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      {awaitingSellerResponse(item.messages) ? (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                            lastMessage(item.messages)?.priority
                              ? "bg-red-100 border border-red-300 text-red-800"
                              : "bg-amber-100 border border-amber-300 text-amber-800"
                          }`}
                        >
                          {lastMessage(item.messages)?.priority ? "⚠️ Priority: awaiting seller" : "⏳ Awaiting seller"}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                          item.status === "approved"
                            ? "bg-green-100 border border-green-300 text-green-800"
                            : item.status === "rejected"
                              ? "bg-red-100 border border-red-300 text-red-800"
                              : "bg-amber-100 border border-amber-300 text-amber-800"
                        }`}
                      >
                        {item.status === "approved" ? "✓ Approved" : item.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 min-w-[180px]">
                      {item.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            disabled={updatingStatusId === item._id}
                            onClick={() => updateStatus(item._id, "approved")}
                            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-steel-400 transition shadow-soft"
                          >
                            {updatingStatusId === item._id ? "Working..." : "✓ Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={updatingStatusId === item._id}
                            onClick={() => updateStatus(item._id, "rejected")}
                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-steel-400 transition shadow-soft"
                          >
                            {updatingStatusId === item._id ? "Working..." : "✗ Reject"}
                          </button>
                        </>
                      ) : (
                        <div className="rounded-xl border-2 border-steel-200 bg-steel-50 px-4 py-3 text-sm font-semibold text-ink-800 text-center">
                          {item.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                          {item.status === "approved" && item.machineId ? (
                            <div className="mt-2">
                              <Link
                                href={`/machines/${item.machineId}`}
                                className="text-xs font-semibold text-copper-600 hover:text-copper-800 transition"
                              >
                                🔗 View live machine →
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-ink-900 mb-3 flex items-center gap-2">
                      <span>📸</span> Photos
                    </p>
                    {item.photos?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.photos.slice(0, 6).map((src, index) => (
                          <a
                            key={`${item._id}-photo-${index}`}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="block group relative overflow-hidden rounded-xl"
                            title="Open full image"
                          >
                            <img
                              src={src}
                              alt={`Photo ${index + 1}`}
                              className="h-32 w-full rounded-xl border-2 border-steel-200 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-ink-950/0 group-hover:bg-ink-950/10 transition-colors rounded-xl" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-steel-300 bg-steel-50 p-6 text-center">
                        <span className="text-2xl opacity-50">🖼️</span>
                        <p className="text-sm text-ink-600 mt-2">No photos uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <p className="text-sm font-semibold text-ink-900 mb-1 flex items-center gap-2">
                      <span>💼</span> Seller Information
                    </p>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Seller</span>
                      <span className="text-ink-700">{sellerLabel(item.sellerId)}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Email</span>
                      <span className="text-ink-700">{item.sellerId?.email || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Phone</span>
                      <span className="text-ink-700">{item.sellerId?.phone || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Location</span>
                      <span className="text-ink-700">{item.sellerId?.location || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">GSTIN</span>
                      <span className="text-ink-700 font-mono text-xs">{item.sellerId?.gstin || "—"}</span>
                    </div>
                    
                    <p className="text-sm font-semibold text-ink-900 mt-3 mb-1 flex items-center gap-2">
                      <span>⚙️</span> Machine Details
                    </p>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Manufacturer</span>
                      <span className="text-ink-700">{item.manufacturer || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Condition</span>
                      <span className="text-ink-700 capitalize">{item.condition || "new"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Price Range</span>
                      <span className="text-ink-700">{item.priceRange || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Min Order</span>
                      <span className="text-ink-700">{item.minOrderQty || "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Lead Time</span>
                      <span className="text-ink-700">{item.leadTimeDays ? `${item.leadTimeDays} days` : "—"}</span>
                    </div>
                    <div className="rounded-xl border border-steel-200 bg-steel-50 px-4 py-2.5 flex justify-between">
                      <span className="font-semibold text-ink-800">Warranty</span>
                      <span className="text-ink-700">
                        {Number.isFinite(item.warrantyMonths) ? `${item.warrantyMonths} months` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {item.features?.length ? (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-ink-900 mb-3 flex items-center gap-2">
                      <span>✨</span> Features
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature, index) => (
                        <span
                          key={`${item._id}-feature-${index}`}
                          className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs text-blue-800 font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.specs?.length ? (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-ink-900 mb-3 flex items-center gap-2">
                      <span>📊</span> Specifications
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {item.specs.map((spec, index) => (
                        <div
                          key={`${item._id}-spec-${index}`}
                          className="flex items-center justify-between rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm shadow-sm"
                        >
                          <span className="font-semibold text-ink-800">{spec.key}</span>
                          <span className="text-ink-600">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.rejectionReason ? (
                  <div className="mt-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-sm text-red-800">
                    <p className="font-semibold flex items-center gap-2">
                      <span>⚠️</span> Rejection reason:
                    </p>
                    <p className="mt-1">{item.rejectionReason}</p>
                  </div>
                ) : null}

                <div className="mt-8 border-t-2 border-steel-200 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="font-heading font-bold text-lg text-ink-950 flex items-center gap-2">
                      <span>💬</span> Admin ↔ Seller Messages
                    </h3>
                    <span className="text-xs text-ink-600 bg-steel-100 px-3 py-1.5 rounded-full">
                      Ask for more info before approving
                    </span>
                  </div>

                  {Array.isArray(item.messages) && item.messages.length > 0 ? (
                    <div className="mt-4 max-h-80 overflow-y-auto space-y-3 bg-steel-50 rounded-xl p-4 border border-steel-200">
                      {item.messages.map((msg, index) => (
                        <div
                          key={`${item._id}-msg-${index}`}
                          className={`flex ${msg.sender === "seller" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                              msg.sender === "seller"
                                ? "bg-white border border-steel-300 text-ink-900"
                                : msg.priority
                                  ? "bg-red-50 border-2 border-red-300 text-red-900"
                                  : "bg-copper-600 text-white"
                            }`}
                          >
                            <p className="text-xs font-semibold opacity-80 mb-1.5">
                              {msg.sender === "seller" ? "👤 Seller" : msg.priority ? "🔴 Admin • Priority" : "🛡️ Admin"}
                            </p>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <p className="text-[11px] opacity-70 mt-2">{formatDateTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border-2 border-dashed border-steel-300 bg-steel-50 p-8 text-center">
                      <span className="text-3xl opacity-50">💭</span>
                      <p className="text-sm text-ink-600 mt-2">No messages yet. Start a conversation with the seller.</p>
                    </div>
                  )}

                  {item.status === "pending" ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendQuestion(item._id);
                      }}
                      className="mt-4"
                    >
                      <textarea
                        value={questionDrafts[item._id] || ""}
                        onChange={(e) =>
                          setQuestionDrafts((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                        rows={3}
                        placeholder="Ask the seller for more specs, compliance docs, additional photos, service coverage, etc."
                        className="w-full border-2 border-steel-300 rounded-xl px-4 py-3 outline-none focus:border-copper-500 focus:ring-2 focus:ring-copper-500/20 resize-none transition"
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                          <input
                            type="checkbox"
                            checked={priorityDrafts[item._id] ?? true}
                            onChange={(e) =>
                              setPriorityDrafts((prev) => ({ ...prev, [item._id]: e.target.checked }))
                            }
                            className="rounded border-steel-300 text-red-600 focus:ring-red-500"
                          />
                          ⚠️ Send as priority
                        </label>
                        <button
                          type="submit"
                          disabled={
                            sendingQuestionId === item._id || !String(questionDrafts[item._id] || "").trim()
                          }
                          className="rounded-xl bg-copper-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-copper-700 disabled:bg-steel-400 transition shadow-soft"
                        >
                          {sendingQuestionId === item._id ? "Sending..." : "📤 Send Message"}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
