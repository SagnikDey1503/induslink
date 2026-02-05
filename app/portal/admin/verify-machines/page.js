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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Machine Verification Admin</h1>
            <p className="text-sm text-gray-600">
              Approve or reject supplier submissions and publish verified machines.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Back to site
          </Link>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-semibold text-gray-700">
              Admin Key
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Set ADMIN_KEY in api env and paste it here"
                className="mt-2 w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberKey}
                    onChange={(e) => setRememberKey(e.target.checked)}
                  />
                  Remember key
                </label>
                <button
                  type="button"
                  onClick={clearSavedKey}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Clear saved key
                </button>
              </div>
            </label>

            <label className="text-sm font-semibold text-gray-700">
              Filter
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-2 w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All</option>
              </select>
            </label>

            <div className="flex items-end gap-3">
              <button
                type="button"
                onClick={loadQueue}
                disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Load Queue"}
              </button>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">No verification submissions found for this filter.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div key={item._id} className="rounded-lg bg-white p-6 shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        Industry: <span className="font-semibold">{item.industrySlug}</span>
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        Sub: <span className="font-semibold">{item.subIndustrySlug}</span>
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                        Submitted: <span className="font-semibold">{formatDateTime(item.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {awaitingSellerResponse(item.messages) ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            lastMessage(item.messages)?.priority
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lastMessage(item.messages)?.priority ? "Priority: awaiting seller" : "Awaiting seller"}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 min-w-[160px]">
                      {item.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            disabled={updatingStatusId === item._id}
                            onClick={() => updateStatus(item._id, "approved")}
                            className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {updatingStatusId === item._id ? "Working..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={updatingStatusId === item._id}
                            onClick={() => updateStatus(item._id, "rejected")}
                            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {updatingStatusId === item._id ? "Working..." : "Reject"}
                          </button>
                        </>
                      ) : (
                        <div className="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 text-center">
                          {item.status === "approved" ? "Approved" : "Rejected"}
                          {item.status === "approved" && item.machineId ? (
                            <div className="mt-2">
                              <Link
                                href={`/machines/${item.machineId}`}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                              >
                                View live machine
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold mb-2">Photos</p>
                    {item.photos?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {item.photos.slice(0, 6).map((src, index) => (
                          <a
                            key={`${item._id}-photo-${index}`}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                            title="Open full image"
                          >
                            <img
                              src={src}
                              alt={`Photo ${index + 1}`}
                              className="h-28 w-full rounded border object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded border bg-gray-50 p-4 text-sm text-gray-600">
                        No photos uploaded.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Seller</span>
                      <span className="text-gray-700">{sellerLabel(item.sellerId)}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Email</span>
                      <span className="text-gray-700">{item.sellerId?.email || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Phone</span>
                      <span className="text-gray-700">{item.sellerId?.phone || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Location</span>
                      <span className="text-gray-700">{item.sellerId?.location || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">GSTIN</span>
                      <span className="text-gray-700">{item.sellerId?.gstin || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Manufacturer</span>
                      <span className="text-gray-700">{item.manufacturer || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Min Order</span>
                      <span className="text-gray-700">{item.minOrderQty || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Lead Time</span>
                      <span className="text-gray-700">{item.leadTimeDays || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Condition</span>
                      <span className="text-gray-700">{item.condition || "new"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Price Range</span>
                      <span className="text-gray-700">{item.priceRange || "—"}</span>
                    </div>
                    <div className="rounded border bg-gray-50 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">Warranty</span>
                      <span className="text-gray-700">
                        {Number.isFinite(item.warrantyMonths) ? `${item.warrantyMonths} months` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {item.features?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-semibold mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature, index) => (
                        <span
                          key={`${item._id}-feature-${index}`}
                          className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.specs?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-semibold mb-2">Specifications</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {item.specs.map((spec, index) => (
                        <div
                          key={`${item._id}-spec-${index}`}
                          className="flex items-center justify-between rounded border bg-white px-3 py-2 text-sm"
                        >
                          <span className="font-semibold text-gray-800">{spec.key}</span>
                          <span className="text-gray-600">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {item.rejectionReason ? (
                  <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
                    <strong>Rejection reason:</strong> {item.rejectionReason}
                  </div>
                ) : null}

                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold">Priority Messages (Admin ↔ Seller)</h3>
                    <span className="text-xs text-gray-500">
                      Ask for more info before approving. Seller replies will show here.
                    </span>
                  </div>

                  {Array.isArray(item.messages) && item.messages.length > 0 ? (
                    <div className="mt-3 max-h-72 overflow-y-auto space-y-3">
                      {item.messages.map((msg, index) => (
                        <div
                          key={`${item._id}-msg-${index}`}
                          className={`flex ${msg.sender === "seller" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                              msg.sender === "seller"
                                ? "bg-gray-100 text-gray-900"
                                : msg.priority
                                  ? "bg-red-50 border border-red-200 text-red-900"
                                  : "bg-blue-600 text-white"
                            }`}
                          >
                            <p className="text-xs font-semibold opacity-80 mb-1">
                              {msg.sender === "seller" ? "Seller" : msg.priority ? "Admin • Priority" : "Admin"}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-[11px] opacity-70 mt-1">{formatDateTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">No admin/seller messages yet.</p>
                  )}

                  {item.status === "pending" ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendQuestion(item._id);
                      }}
                      className="mt-3"
                    >
                      <textarea
                        value={questionDrafts[item._id] || ""}
                        onChange={(e) =>
                          setQuestionDrafts((prev) => ({ ...prev, [item._id]: e.target.value }))
                        }
                        rows={3}
                        placeholder="Ask the seller for more specs, compliance docs, additional photos, service coverage, etc."
                        className="w-full border rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={priorityDrafts[item._id] ?? true}
                            onChange={(e) =>
                              setPriorityDrafts((prev) => ({ ...prev, [item._id]: e.target.checked }))
                            }
                          />
                          Send as priority
                        </label>
                        <button
                          type="submit"
                          disabled={
                            sendingQuestionId === item._id || !String(questionDrafts[item._id] || "").trim()
                          }
                          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {sendingQuestionId === item._id ? "Sending..." : "Send Message"}
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
