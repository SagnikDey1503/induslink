"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function SupplierMessages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("buyers");
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  // Buyer conversations (Message model)
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingBuyerMessage, setSendingBuyerMessage] = useState(false);

  const messageListRef = useRef(null);
  const bottomRef = useRef(null);
  const buyerShouldAutoScrollRef = useRef(true);

  // Admin verification chat (MachineVerification.messages)
  const [verifications, setVerifications] = useState([]);
  const [selectedVerificationId, setSelectedVerificationId] = useState(null);
  const [adminReplyDrafts, setAdminReplyDrafts] = useState({});
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [sendingAdminReplyId, setSendingAdminReplyId] = useState(null);

  const adminMessageListRef = useRef(null);
  const adminBottomRef = useRef(null);
  const adminShouldAutoScrollRef = useRef(true);

  const selectedVerification = useMemo(
    () => verifications.find((item) => item._id === selectedVerificationId) || null,
    [verifications, selectedVerificationId]
  );

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
    // Keep mobile admin state sane when switching tabs.
    if (activeTab !== "admin") setMobileAdminOpen(false);
  }, [activeTab]);

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

      if (
        next.length &&
        (!selectedVerificationId || !next.some((item) => item._id === selectedVerificationId))
      ) {
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

    loadMessages(selectedConversation.otherUser._id);
    const interval = setInterval(() => loadMessages(selectedConversation.otherUser._id), 5000);
    return () => clearInterval(interval);
  }, [activeTab, selectedConversation?._id]);

  useEffect(() => {
    if (activeTab !== "buyers") return;
    const el = messageListRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      buyerShouldAutoScrollRef.current = distanceFromBottom < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeTab, selectedConversation?._id]);

  useEffect(() => {
    if (activeTab !== "admin") return;
    const el = adminMessageListRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      adminShouldAutoScrollRef.current = distanceFromBottom < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeTab, selectedVerificationId]);

  useEffect(() => {
    if (activeTab !== "buyers") return;
    if (!selectedConversation) return;
    if (!buyerShouldAutoScrollRef.current) return;
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }));
  }, [messages.length, activeTab, selectedConversation?._id]);

  useEffect(() => {
    if (activeTab !== "admin") return;
    if (!selectedVerification) return;
    if (!adminShouldAutoScrollRef.current) return;
    requestAnimationFrame(() => adminBottomRef.current?.scrollIntoView({ behavior: "auto" }));
  }, [activeTab, selectedVerificationId, selectedVerification?.messages?.length]);

  const sendMessage = async (event) => {
    event?.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingBuyerMessage(true);
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: selectedConversation.otherUser._id,
          content: newMessage
        })
      });

      setNewMessage("");
      buyerShouldAutoScrollRef.current = true;
      loadMessages(selectedConversation.otherUser._id);
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSendingBuyerMessage(false);
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

      adminShouldAutoScrollRef.current = true;
      setVerifications((prev) => prev.map((item) => (item._id === verificationId ? payload.data : item)));
      setAdminReplyDrafts((prev) => ({ ...prev, [verificationId]: "" }));
    } catch (err) {
      alert(err.message || "Failed to send reply");
    } finally {
      setSendingAdminReplyId(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-steel-500">Loading...</div>;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-steel-100">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink-950">Messages</h1>
            <p className="text-sm text-steel-600">Chat with buyers and handle admin verification questions.</p>
          </div>
          <Link
            href="/portal/supplier"
            className="rounded-full border border-ink-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft transition hover:bg-white"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("buyers")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "buyers" ? "bg-ink-950 text-white" : "bg-white/70 text-ink-900 hover:bg-white"
            }`}
          >
            Buyer chats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "admin" ? "bg-copper-500 text-ink-950" : "bg-white/70 text-ink-900 hover:bg-white"
            }`}
          >
            Admin verification
          </button>
          {activeTab === "admin" ? (
            <button
              type="button"
              onClick={fetchVerifications}
              disabled={loadingAdmin}
              className="ml-auto rounded-full border border-ink-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft transition hover:bg-white disabled:opacity-60"
            >
              {loadingAdmin ? "Refreshing..." : "Refresh"}
            </button>
          ) : null}
        </div>

        {activeTab === "buyers" ? (
          <div className="flex-1 min-h-0 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* List */}
            <div
              className={`${
                selectedConversation ? "hidden lg:flex" : "flex"
              } lg:col-span-4 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
            >
              <div className="p-4 border-b border-ink-900/10 bg-white/60">
                <h2 className="font-semibold text-ink-950">Buyer conversations</h2>
                <p className="text-xs text-steel-600">Respond quickly to procurement requests.</p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-steel-600">
                    No conversations yet.
                    <div className="mt-2 text-xs text-steel-500">
                      When an MSME clicks <span className="font-semibold text-ink-950">Contact Seller</span>, it will
                      appear here.
                    </div>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const active = selectedConversation?._id === conv._id;
                    return (
                      <button
                        key={conv._id}
                        type="button"
                        onClick={() => {
                          buyerShouldAutoScrollRef.current = true;
                          setSelectedConversation(conv);
                          loadMessages(conv.otherUser._id);
                        }}
                        className={`w-full text-left p-4 border-b border-ink-900/10 transition ${
                          active ? "bg-ink-950/5" : "hover:bg-ink-950/5"
                        }`}
                      >
                        <p className="font-semibold text-ink-950">
                          {conv.otherUser.companyName || conv.otherUser.name || conv.otherUser.email}
                        </p>
                        <p className="mt-1 text-xs text-steel-600 truncate">{conv.content}</p>
                        <p className="mt-2 text-[11px] text-steel-500">
                          {formatDate(conv.createdAt)} • {formatTime(conv.createdAt)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat */}
            <div
              className={`${
                selectedConversation ? "flex" : "hidden lg:flex"
              } lg:col-span-8 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
            >
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-ink-900/10 bg-white/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-soft"
                        >
                          Back
                        </button>
                        <div>
                          <h2 className="font-semibold text-ink-950">
                            {selectedConversation.otherUser.companyName ||
                              selectedConversation.otherUser.name ||
                              selectedConversation.otherUser.email}
                          </h2>
                          <p className="text-xs text-steel-600">{selectedConversation.otherUser.email}</p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex rounded-full bg-ink-950/5 px-3 py-1 text-[11px] font-semibold text-ink-900">
                        Buyer chat
                      </span>
                    </div>
                  </div>

                  <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="py-10 text-center text-steel-600">No messages yet.</div>
                    ) : (
                      messages.map((msg) => {
                        const inbound = msg.senderId._id === selectedConversation.otherUser._id;
                        return (
                          <div key={msg._id} className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-soft ${
                                inbound
                                  ? "bg-white border border-ink-900/10 text-ink-950"
                                  : "bg-ink-950 text-white"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-[11px] mt-1 ${inbound ? "text-steel-500" : "text-white/70"}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={sendMessage} className="p-4 border-t border-ink-900/10 bg-white/60">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-full border border-ink-900/15 bg-white px-4 py-2 text-sm outline-none focus:border-copper-500"
                      />
                      <button
                        type="submit"
                        disabled={sendingBuyerMessage || !newMessage.trim()}
                        className="rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-ink-950 shadow-soft transition hover:bg-copper-400 disabled:opacity-60"
                      >
                        {sendingBuyerMessage ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-steel-600">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Queue */}
            <div
              className={`${
                mobileAdminOpen ? "hidden lg:flex" : "flex"
              } lg:col-span-4 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
            >
              <div className="p-4 border-b border-ink-900/10 bg-white/60 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-950">Verification queue</h2>
                  <p className="text-xs text-steel-600">Reply to admin questions to speed up approval.</p>
                </div>
                <Link href="/portal/supplier/verify-machine" className="text-xs font-semibold text-copper-600">
                  View submissions →
                </Link>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                {loadingAdmin ? (
                  <div className="p-6 text-center text-steel-600">Loading...</div>
                ) : verifications.length === 0 ? (
                  <div className="p-6 text-center text-steel-600">
                    No submissions yet. Submit a machine for verification.
                  </div>
                ) : (
                  verifications.map((item) => {
                    const active = selectedVerificationId === item._id;
                    const replyNeeded = needsSellerResponse(item.messages);
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => {
                          adminShouldAutoScrollRef.current = true;
                          setSelectedVerificationId(item._id);
                          setMobileAdminOpen(true);
                        }}
                        className={`w-full text-left p-4 border-b border-ink-900/10 transition ${
                          active ? "bg-copper-500/10" : "hover:bg-ink-950/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink-950">{item.machineName}</p>
                            <p className="mt-1 text-xs text-steel-600 capitalize">
                              Status: {item.status}
                              {replyNeeded ? " • Reply needed" : ""}
                            </p>
                          </div>
                          {replyNeeded ? (
                            <span className="rounded-full bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-800">
                              Priority
                            </span>
                          ) : (
                            <span className="rounded-full bg-ink-950/5 px-2 py-1 text-[11px] font-semibold text-ink-900">
                              {item.status}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-[11px] text-steel-500">
                          Submitted: {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Admin chat */}
            <div
              className={`${
                mobileAdminOpen ? "flex" : "hidden lg:flex"
              } lg:col-span-8 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
            >
              {selectedVerification ? (
                <>
                  <div className="p-4 border-b border-ink-900/10 bg-white/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setMobileAdminOpen(false)}
                          className="lg:hidden rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-soft"
                        >
                          Back
                        </button>
                        <div>
                          <h2 className="font-semibold text-ink-950">{selectedVerification.machineName}</h2>
                          <p className="text-xs text-steel-600 mt-1">
                            Status: <span className="font-semibold text-ink-950">{selectedVerification.status}</span>
                            {selectedVerification.manufacturer ? (
                              <>
                                {" "}
                                • Manufacturer:{" "}
                                <span className="font-semibold text-ink-950">
                                  {selectedVerification.manufacturer}
                                </span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/portal/supplier/verify-machine"
                        className="text-sm font-semibold text-copper-600 hover:text-copper-500"
                      >
                        Open full details →
                      </Link>
                    </div>
                  </div>

                  <div ref={adminMessageListRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {Array.isArray(selectedVerification.messages) && selectedVerification.messages.length > 0 ? (
                      selectedVerification.messages.map((msg, idx) => (
                        <div
                          key={`${selectedVerification._id}-msg-${idx}`}
                          className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-soft ${
                              msg.sender === "seller"
                                ? "bg-ink-950 text-white"
                                : msg.priority
                                  ? "bg-red-50 border border-red-200 text-red-900"
                                  : "bg-white border border-ink-900/10 text-ink-950"
                            }`}
                          >
                            <p className="text-[11px] font-semibold opacity-80 mb-1">
                              {msg.sender === "seller" ? "You" : msg.priority ? "Admin • Priority" : "Admin"}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-[11px] opacity-70 mt-1">
                              {formatDate(msg.createdAt)} • {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-steel-600">No admin questions yet.</div>
                    )}
                    <div ref={adminBottomRef} />
                  </div>

                  {selectedVerification.status !== "approved" ? (
                    <div className="p-4 border-t border-ink-900/10 bg-white/60">
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
                          className="flex-1 rounded-2xl border border-ink-900/15 bg-white px-4 py-2 text-sm outline-none focus:border-copper-500 resize-none"
                        />
                        <button
                          type="submit"
                          disabled={
                            sendingAdminReplyId === selectedVerification._id ||
                            !String(adminReplyDrafts[selectedVerification._id] || "").trim()
                          }
                          className="rounded-2xl bg-copper-500 px-5 py-2 text-sm font-semibold text-ink-950 shadow-soft transition hover:bg-copper-400 disabled:opacity-60"
                        >
                          {sendingAdminReplyId === selectedVerification._id ? "Sending..." : "Send"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 border-t border-ink-900/10 bg-white/60 text-sm text-steel-600">
                      This machine is approved and live. Admin chat is read-only.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-steel-600">
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

