"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PortalShell from "../../components/PortalShell";
import { apiFetch } from "../../../lib/api";

export default function SupplierPortalPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalMachines: 0,
    verifiedMachines: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
    unreadAdminQuestions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load supplier stats
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const newStats = {
          totalRequests: 0,
          pendingRequests: 0,
          totalMachines: 0,
          verifiedMachines: 0,
          unreadNotifications: 0,
          unreadMessages: 0,
          unreadAdminQuestions: 0
        };

        const [requestsResult, machinesResult, notificationsResult] = await Promise.allSettled([
          apiFetch("/api/supplier/requests"),
          apiFetch("/api/supplier/machines"),
          apiFetch("/api/notifications")
        ]);

        if (requestsResult.status === "fulfilled") {
          const requests = requestsResult.value.data || [];
          newStats.totalRequests = requests.length;
          newStats.pendingRequests = requests.filter((r) => r.status === "pending").length;
        }

        if (machinesResult.status === "fulfilled") {
          const machines = machinesResult.value.data || [];
          newStats.totalMachines = machines.length;
          newStats.verifiedMachines = machines.filter((m) => m.verified).length;
        }

        if (notificationsResult.status === "fulfilled") {
          const notifications = notificationsResult.value.data || [];
          newStats.unreadNotifications = notifications.filter((n) => !n.read).length;
          newStats.unreadMessages = notifications.filter((n) => !n.read && n.type === "new_message").length;
          newStats.unreadAdminQuestions = notifications.filter((n) => !n.read && n.type === "admin_question").length;
        }

        setStats(newStats);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <PortalShell
      role="supplier"
      title="Your Smart Supplier Hub"
      subtitle="Manage listings, respond to buyer requests, and grow your business."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.verifiedMachines}</p>
              <p className="text-sm text-gray-600">Verified Machines</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.unreadNotifications}</p>
              <p className="text-sm text-gray-600">Notifications</p>
            </div>
            <div className="text-3xl">🔔</div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Link
          href="/portal/supplier/requests"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg relative"
        >
          <p className="text-3xl mb-2">📋</p>
          <p className="font-bold">Machine Requests</p>
          <p className="text-sm opacity-90">View & manage buyer inquiries</p>
          {stats.pendingRequests > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.pendingRequests}
            </span>
          )}
        </Link>

        <Link
          href="/portal/supplier/verify-machine"
          className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg"
        >
          <p className="text-3xl mb-2">✓</p>
          <p className="font-bold">Add Machines</p>
          <p className="text-sm opacity-90">Submit for verification</p>
        </Link>

        <Link
          href="/portal/supplier/messages?tab=admin"
          className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg relative"
        >
          <p className="text-3xl mb-2">🛡️</p>
          <p className="font-bold">Admin Questions</p>
          <p className="text-sm opacity-90">Reply before verification</p>
          {stats.unreadAdminQuestions > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.unreadAdminQuestions}
            </span>
          )}
        </Link>

        <Link
          href="/portal/supplier/messages"
          className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-lg shadow-md transition hover:shadow-lg relative"
        >
          <p className="text-3xl mb-2">💬</p>
          <p className="font-bold">Messages</p>
          <p className="text-sm opacity-90">Chat with buyers</p>
          {stats.unreadMessages > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.unreadMessages}
            </span>
          )}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-3">📈 Business Growth</h3>
          <p className="text-gray-700 mb-4">
            You have {stats.totalMachines} machines listed with {stats.verifiedMachines} verified.
          </p>
          <Link
            href="/portal/supplier/verify-machine"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Add More Machines
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold mb-3">🎯 Active Requests</h3>
          <p className="text-gray-700 mb-4">
            {stats.pendingRequests > 0 
              ? `You have ${stats.pendingRequests} pending buyer requests waiting for response.`
              : "No pending requests. Great job staying on top of inquiries!"
            }
          </p>
          <Link
            href="/portal/supplier/requests"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            {stats.pendingRequests > 0 ? "Review Requests" : "View All Requests"}
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}
