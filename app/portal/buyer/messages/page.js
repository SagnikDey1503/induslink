"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading messages...</div>}>
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
  const bottomRef = useRef(null);

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
    if (!selectedUser) return;
    // Keep latest message in view (chat-style).
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Conversations</h2>
            </div>
            <div className="overflow-y-auto max-h-96">
              {conversations.length === 0 ? (
                <div className="p-4 text-gray-600 text-center">No conversations yet</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.otherUser._id}
                    onClick={() => setSelectedUser(conv.otherUser)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition ${
                      selectedUser?._id === conv.otherUser._id ? "bg-blue-100" : ""
                    }`}
                  >
                    <p className="font-semibold">
                      {conv.otherUser.companyName || conv.otherUser.name || conv.otherUser.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{conv.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-bold text-lg">
                    {selectedUser.companyName || selectedUser.name || selectedUser.email}
                  </h2>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderId._id === selectedUser._id ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId._id === selectedUser._id
                              ? "bg-gray-200 text-gray-800"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
