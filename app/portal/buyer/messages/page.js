"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-steel-500">Loading messages...</div>}>
      <MessagesPageInner />
    </Suspense>
  );
}

function MessagesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectUserId = searchParams.get("userId");
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messageListRef = useRef(null);
  const bottomRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const formatTime = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const payload = await apiFetch("/api/conversations");
        setConversations(payload.data || []);
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

    fetchConversations();
  }, [router]);

  useEffect(() => {
    if (!preselectUserId || selectedUser) return;
    const match = conversations.find((conv) => conv.otherUser?._id === preselectUserId);
    if (match?.otherUser) {
      setSelectedUser(match.otherUser);
    }
  }, [conversations, preselectUserId, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const payload = await apiFetch(`/api/messages/${selectedUser._id}`);
          setMessages(payload.data || []);
        } catch (err) {
          console.error(err);
        }
      };

      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 120;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!selectedUser) return;
    if (!shouldAutoScrollRef.current) return;
    // Keep latest message in view (chat-style) without jitter.
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }));
  }, [messages.length, selectedUser?._id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSendingMessage(true);
    try {
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          recipientId: selectedUser._id,
          content: newMessage
        })
      });
      setNewMessage("");
      const payload = await apiFetch(`/api/messages/${selectedUser._id}`);
      setMessages(payload.data || []);
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading messages...</div>;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-steel-100">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink-950">Messages</h1>
            <p className="text-sm text-steel-600">Chat with verified suppliers.</p>
          </div>
          <Link
            href="/portal/buyer"
            className="rounded-full border border-ink-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-900 shadow-soft transition hover:bg-white"
          >
            Back to portal
          </Link>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Conversations List */}
          <div
            className={`${
              selectedUser ? "hidden lg:flex" : "flex"
            } lg:col-span-4 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
          >
            <div className="p-4 border-b border-ink-900/10 bg-white/60">
              <h2 className="font-semibold text-ink-950">Conversations</h2>
              <p className="text-xs text-steel-600">Select a supplier to view messages.</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-steel-600 text-center">
                  No conversations yet. Click <span className="font-semibold text-ink-950">Contact Seller</span> from a
                  machine to start one.
                </div>
              ) : (
                conversations.map((conv) => {
                  const active = selectedUser?._id === conv.otherUser._id;
                  return (
                    <button
                      key={conv.otherUser._id}
                      type="button"
                      onClick={() => {
                        shouldAutoScrollRef.current = true;
                        setSelectedUser(conv.otherUser);
                      }}
                      className={`w-full text-left p-4 border-b border-ink-900/10 transition ${
                        active ? "bg-copper-500/10" : "hover:bg-ink-950/5"
                      }`}
                    >
                      <p className="font-semibold text-ink-950">
                        {conv.otherUser.companyName || conv.otherUser.name || conv.otherUser.email}
                      </p>
                      <p className="mt-1 text-xs text-steel-600 truncate">{conv.content}</p>
                      {conv.createdAt ? (
                        <p className="mt-2 text-[11px] text-steel-500">
                          {formatDate(conv.createdAt)} • {formatTime(conv.createdAt)}
                        </p>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              selectedUser ? "flex" : "hidden lg:flex"
            } lg:col-span-8 bg-white/80 rounded-2xl shadow-soft border border-ink-900/10 overflow-hidden flex-col min-h-0`}
          >
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-ink-900/10 bg-white/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          if (preselectUserId) router.replace("/portal/buyer/messages");
                        }}
                        className="lg:hidden rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-soft"
                      >
                        Back
                      </button>
                      <div>
                        <h2 className="font-semibold text-ink-950">
                          {selectedUser.companyName || selectedUser.name || selectedUser.email}
                        </h2>
                        <p className="text-xs text-steel-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex rounded-full bg-ink-950/5 px-3 py-1 text-[11px] font-semibold text-ink-900">
                      Supplier chat
                    </span>
                  </div>
                </div>

                <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-steel-600 py-10">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const inbound = msg.senderId._id === selectedUser._id;
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
                      disabled={sendingMessage || !newMessage.trim()}
                      className="rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-ink-950 shadow-soft transition hover:bg-copper-400 disabled:opacity-60"
                    >
                      {sendingMessage ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-steel-600">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
