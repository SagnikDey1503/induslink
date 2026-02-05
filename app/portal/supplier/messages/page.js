"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function SupplierMessages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buyers");

  // Buyer conversations (Message model)
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Admin verification chat (MachineVerification.messages)
  const [verifications, setVerifications] = useState([]);
  const [selectedVerificationId, setSelectedVerificationId] = useState(null);
  const [adminReplyDrafts, setAdminReplyDrafts] = useState({});
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [sendingAdminReplyId, setSendingAdminReplyId] = useState(null);
  const adminBottomRef = useRef(null);

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  const formatTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleTimeString();
    } catch {
      return "—";
    }
  };

  const lastMessage = (messagesList) => {
    if (!Array.isArray(messagesList) || messagesList.length === 0) return null;
    return messagesList[messagesList.length - 1];
  };

  const needsSellerResponse = (messagesList) => lastMessage(messagesList)?.sender === "admin";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "admin") setActiveTab("admin");
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const payload = await apiFetch("/api/conversations");
        setConversations(payload.data || []);
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

    fetchConversations();
  }, [router]);

  const fetchVerifications = async () => {
    try {
      setLoadingAdmin(true);
      const payload = await apiFetch("/api/supplier/verify-machines");
      const next = payload.data || [];
      setVerifications(next);

      if (next.length && (!selectedVerificationId || !next.some((item) => item._id === selectedVerificationId))) {
        setSelectedVerificationId(next[0]._id);
      }
    } catch (err) {
      if (err?.status === 401) {
        router.push("/login/supplier");
        return;
      }
      console.error(err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "admin") return;
    fetchVerifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadMessages = async (userId) => {
    try {
      const payload = await apiFetch(`/api/messages/${userId}`);
      setMessages(payload.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab !== "buyers") return;
    if (!selectedConversation) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation, activeTab]);

  const selectedVerification = verifications.find((item) => item._id === selectedVerificationId) || null;

  useEffect(() => {
    if (activeTab !== "admin") return;
    if (!selectedVerification) return;
    adminBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab, selectedVerificationId, selectedVerification?.messages?.length]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: selectedConversation.otherUser._id,
          content: newMessage
        })
      });

      setNewMessage("");
      loadMessages(selectedConversation.otherUser._id);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const sendAdminReply = async (verificationId) => {
    const content = String(adminReplyDrafts[verificationId] || "").trim();
    if (!content) return;

    setSendingAdminReplyId(verificationId);
    try {
      const payload = await apiFetch(`/api/supplier/verify-machines/${verificationId}/message`, {
        method: "POST",
        body: JSON.stringify({ content })
      });

      setVerifications((prev) => prev.map((item) => (item._id === verificationId ? payload.data : item)));
      setAdminReplyDrafts((prev) => ({ ...prev, [verificationId]: "" }));
    } catch (err) {
      alert(err.message || "Failed to send reply");
    } finally {
      setSendingAdminReplyId(null);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Link
            href="/portal/supplier"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("buyers")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "buyers" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Buyer chats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "admin" ? "bg-amber-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Admin verification
          </button>
          {activeTab === "admin" ? (
            <button
              type="button"
              onClick={fetchVerifications}
              disabled={loadingAdmin}
              className="ml-auto rounded bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-100 disabled:opacity-60"
            >
              {loadingAdmin ? "Refreshing..." : "Refresh"}
            </button>
          ) : null}
        </div>

        {activeTab === "buyers" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            {/* Conversations List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">Conversations</h3>
              </div>
              <div className="overflow-y-auto h-80">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No conversations yet</div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        loadMessages(conv.otherUser._id);
                      }}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedConversation?._id === conv._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <p className="font-medium">
                        {conv.otherUser.companyName || conv.otherUser.name || conv.otherUser.email}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{conv.content}</p>
                      <p className="text-xs text-gray-400">{formatDate(conv.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold">
                      {selectedConversation.otherUser.companyName ||
                        selectedConversation.otherUser.name ||
                        selectedConversation.otherUser.email}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedConversation.otherUser.email}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.senderId._id === selectedConversation.otherUser._id ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderId._id === selectedConversation.otherUser._id
                              ? "bg-gray-200 text-gray-800"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-75 mt-1">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            {/* Verification submissions list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between gap-3">
                <h3 className="font-bold">Verification queue</h3>
                <Link href="/portal/supplier/verify-machine" className="text-xs font-semibold text-blue-600">
                  View submissions →
                </Link>
              </div>
              <div className="overflow-y-auto h-80">
                {loadingAdmin ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : verifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No submissions yet. Submit a machine for verification.
                  </div>
                ) : (
                  verifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedVerificationId(item._id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedVerificationId === item._id ? "bg-amber-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.status} • {formatDate(item.createdAt)}
                          </p>
                        </div>
                        {needsSellerResponse(item.messages) ? (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                              lastMessage(item.messages)?.priority
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {lastMessage(item.messages)?.priority ? "Priority" : "Admin"}
                          </span>
                        ) : null}
                      </div>
                      {lastMessage(item.messages)?.content ? (
                        <p className="mt-2 text-sm text-gray-600 truncate">{lastMessage(item.messages).content}</p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400 truncate">No messages yet</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin chat */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
              {selectedVerification ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold truncate">{selectedVerification.name}</h3>
                        <p className="text-sm text-gray-600">
                          Status:{" "}
                          <span className="font-semibold text-gray-800">{selectedVerification.status}</span>
                          {selectedVerification.manufacturer ? (
                            <>
                              {" "}
                              • Manufacturer:{" "}
                              <span className="font-semibold text-gray-800">
                                {selectedVerification.manufacturer}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <Link
                        href="/portal/supplier/verify-machine"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Open full details →
                      </Link>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Array.isArray(selectedVerification.messages) && selectedVerification.messages.length > 0 ? (
                      selectedVerification.messages.map((msg, idx) => (
                        <div
                          key={`${selectedVerification._id}-msg-${idx}`}
                          className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                              msg.sender === "seller"
                                ? "bg-blue-600 text-white"
                                : msg.priority
                                  ? "bg-red-50 border border-red-200 text-red-900"
                                  : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p className="text-xs font-semibold opacity-80 mb-1">
                              {msg.sender === "seller" ? "You" : msg.priority ? "Admin • Priority" : "Admin"}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatDate(msg.createdAt)} {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No admin questions yet
                      </div>
                    )}
                    <div ref={adminBottomRef} />
                  </div>

                  {selectedVerification.status !== "approved" ? (
                    <div className="p-4 border-t">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendAdminReply(selectedVerification._id);
                        }}
                        className="flex gap-2"
                      >
                        <textarea
                          value={adminReplyDrafts[selectedVerification._id] || ""}
                          onChange={(e) =>
                            setAdminReplyDrafts((prev) => ({ ...prev, [selectedVerification._id]: e.target.value }))
                          }
                          rows={2}
                          placeholder="Reply to admin (more specs, compliance docs, additional photos, etc.)"
                          className="flex-1 border rounded px-3 py-2 outline-none focus:border-blue-500 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={
                            sendingAdminReplyId === selectedVerification._id ||
                            !String(adminReplyDrafts[selectedVerification._id] || "").trim()
                          }
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition text-sm font-semibold"
                        >
                          {sendingAdminReplyId === selectedVerification._id ? "Sending..." : "Send"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 border-t text-sm text-gray-600">
                      This machine is approved and live. Admin chat is read-only.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a submission to view admin questions
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
