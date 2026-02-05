"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function BuyerWishlist() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const payload = await apiFetch("/api/buyer/saved");
        setWishlist(payload.data || []);
      } catch (err) {
        if (err?.status === 401) {
          router.push("/login/buyer");
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [router]);

  const removeFromWishlist = async (machineId) => {
    try {
      await apiFetch(`/api/buyer/saved/${machineId}`, { method: "DELETE" });
      setWishlist((prev) => prev.filter((item) => item._id !== machineId));
    } catch (err) {
      alert("Failed to remove from wishlist");
    }
  };

  const requestMachine = async (machineId) => {
    try {
      await apiFetch("/api/buyer/lead", {
        method: "POST",
        body: JSON.stringify({ machineId, message: "I am interested in this machine." })
      });
      alert("Seller has been contacted and will reach you soon!");
      router.push("/portal/buyer");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No machines in your wishlist yet.</p>
            <button
              onClick={() => router.push("/portal/buyer")}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Browse Machines
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                {item.photos?.[0] && (
                  <img src={item.photos[0]} alt={item.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Manufacturer:</strong> {item.manufacturer}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong>Lead Time:</strong> {item.leadTimeDays} days
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => requestMachine(item._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition"
                    >
                      Request
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition"
                    >
                      Remove
                    </button>
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
