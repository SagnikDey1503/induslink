"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const payload = await apiFetch("/api/notifications");
        setNotifications(payload.data || []);
        setUnreadCount((payload.data || []).filter((n) => !n.read).length);
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

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [router]);

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "request_approved":
        return "bg-green-100 text-green-600";
      case "request_rejected":
        return "bg-red-100 text-red-600";
      case "machine_verified":
        return "bg-green-100 text-green-600";
      case "machine_rejected":
        return "bg-red-100 text-red-600";
      case "new_message":
        return "bg-blue-100 text-blue-600";
      case "request_received":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) return <div className="p-6 text-center">Loading notifications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">{unreadCount} unread</span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition ${
                  !notif.read ? "border-l-4 border-blue-600" : ""
                }`}
                onClick={() => !notif.read && markAsRead(notif._id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getIconColor(notif.type)}`}>
                    <span className="text-xl">
                      {notif.type === "request_approved" && "✓"}
                      {notif.type === "request_rejected" && "✕"}
                      {notif.type === "new_message" && "💬"}
                      {notif.type === "request_received" && "📋"}
                      {notif.type === "machine_verified" && "✓"}
                      {notif.type === "machine_rejected" && "✕"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{notif.title}</h3>
                    <p className="text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notif.read && <span className="bg-blue-600 rounded-full w-3 h-3 mt-1"></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
