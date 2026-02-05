"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function SupplierRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const payload = await apiFetch("/api/supplier/requests");
        setRequests(payload.data || []);
      } catch (err) {
        if (err?.status === 401) {
          router.push("/login/supplier");
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const updateRequestStatus = async (requestId, status) => {
    try {
      const json = await apiFetch(`/api/supplier/requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? json.data : req))
      );

      alert(`Request ${status}!`);
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to update request");
    }
  };

  const sendMessage = async (e, requestId) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSendingMessage(true);
    try {
      const request = requests.find((r) => r._id === requestId);
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: request.buyerId._id,
          content: message,
          machineRequestId: requestId
        })
      });

      setMessage("");
      alert("Message sent to buyer!");
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading requests...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Machine Requests</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No requests yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Requests List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{req.machineId?.name || "Machine"}</h3>
                        <p className="text-gray-600">
                          <strong>Buyer:</strong>{" "}
                          {req.buyerId?.companyName || req.buyerId?.name || req.buyerId?.email}
                        </p>
                        <p className="text-sm text-gray-500">{req.buyerId?.email}</p>
                        <p className="text-sm text-gray-500">{req.buyerId?.phone}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    {req.buyerMessage && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 font-semibold">Buyer's Message:</p>
                        <p className="text-gray-700 text-sm">{req.buyerMessage}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-4">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Request Details */}
            {selectedRequest && (
              <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="font-bold text-lg mb-4">Request Details</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Buyer Company</p>
                    <p className="font-bold">
                      {selectedRequest.buyerId?.companyName ||
                        selectedRequest.buyerId?.name ||
                        selectedRequest.buyerId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Email</p>
                    <p>{selectedRequest.buyerId?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Phone</p>
                    <p>{selectedRequest.buyerId?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === "pending" && (
                  <div className="space-y-2 mb-6">
                    <button
                      onClick={() => updateRequestStatus(selectedRequest._id, "contacted")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition"
                    >
                      Mark as Contacted
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest._id, "approved")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest._id, "rejected")}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Send Message */}
                <form onSubmit={(e) => sendMessage(e, selectedRequest._id)} className="space-y-2">
                  <label className="text-xs text-gray-600 font-semibold">Send Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Request has been received. Phone: +91-XXXX..."
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                    rows="4"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !message.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded text-sm transition"
                  >
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
