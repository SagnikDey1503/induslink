"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function BuyerRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const payload = await apiFetch("/api/msme/requests");
        setRequests(payload.data || []);
      } catch (err) {
        if (err?.status === 401) {
          router.push("/login/buyer");
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

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

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Machine Requests</h1>
          <Link
            href="/portal/buyer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No machine requests yet.</p>
            <Link
              href="/portal/buyer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Browse Machines
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{request.machineId?.name}</h3>
                    <p className="text-gray-600 mb-2">
                      <strong>Seller:</strong> {request.sellerId?.companyName}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Contact:</strong> {request.sellerId?.email} | {request.sellerId?.phone}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                {request.buyerMessage && (
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Your Message:</strong> {request.buyerMessage}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Requested on: {new Date(request.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Link
                      href={`/machines/${request.machineId?._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Machine
                    </Link>
                    {request.status === "approved" && (
                      <Link
                        href={`/portal/buyer/messages?userId=${request.sellerId?._id}`}
                        className="text-green-600 hover:text-green-800"
                      >
                        Send Message
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
