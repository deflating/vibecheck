"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type Conversation = {
  request_id: number;
  title: string;
  last_message: string;
  last_message_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  unread_count: number;
};

type Message = {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(() => {
    fetch("/api/messages/conversations")
      .then(r => r.json())
      .then(d => {
        setConversations(d.conversations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    // Get current user id from session
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(s => {
        if (s?.user?.dbId) setCurrentUserId(s.user.dbId);
        else if (s?.user?.id) setCurrentUserId(Number(s.user.id));
      })
      .catch(() => {});
  }, []);

  const fetchMessages = useCallback((requestId: number) => {
    fetch(`/api/requests/${requestId}/messages`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    // Mark as read
    fetch(`/api/messages/conversations/${selectedId}/read`, { method: "POST" });
    // Update unread count locally
    setConversations(prev =>
      prev.map(c => c.request_id === selectedId ? { ...c, unread_count: 0 } : c)
    );
    const interval = setInterval(() => fetchMessages(selectedId), 5000);
    return () => clearInterval(interval);
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    setSending(true);
    await fetch(`/api/requests/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: input }),
    });
    setInput("");
    setSending(false);
    fetchMessages(selectedId);
    // Mark as read after sending
    fetch(`/api/messages/conversations/${selectedId}/read`, { method: "POST" });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr + "Z").getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  const selected = conversations.find(c => c.request_id === selectedId);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="h-7 bg-surface-hover rounded w-32 mb-4 animate-pulse" />
        <div className="border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 180px)" }}>
          <div className="w-full md:w-80 md:min-w-[320px] border-r border-border bg-surface">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="px-4 py-3 border-b border-border animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-hover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 bg-surface-hover rounded w-24 mb-2" />
                    <div className="h-3 bg-surface-hover rounded w-40 mb-1.5" />
                    <div className="h-3 bg-surface-hover rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 hidden md:flex items-center justify-center text-text-muted text-sm">
            Select a conversation to start messaging
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
      <div className="border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 180px)" }}>
        {/* Conversation list */}
        <div className={`w-full md:w-80 md:min-w-[320px] border-r border-border overflow-y-auto bg-surface ${selectedId ? "hidden md:block" : ""}`}>
          {conversations.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-text-muted">
              No conversations yet
            </div>
          ) : (
            conversations.map(c => (
              <button
                key={c.request_id}
                onClick={() => setSelectedId(c.request_id)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-surface-hover transition-colors ${
                  selectedId === c.request_id ? "bg-accent/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {c.other_user_avatar ? (
                    <img src={c.other_user_avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-surface-hover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${c.unread_count > 0 ? "font-semibold" : ""}`}>
                        {c.other_user_name}
                      </span>
                      <span className="text-xs text-text-muted flex-shrink-0">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <p className="text-xs text-text-muted truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-xs truncate flex-1 ${c.unread_count > 0 ? "text-text font-medium" : "text-text-muted"}`}>
                        {c.last_message}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message thread */}
        <div className={`flex-1 flex flex-col ${!selectedId ? "hidden md:flex" : "flex"}`}>
          {selectedId && selected ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden text-text-secondary hover:text-text p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                  </svg>
                </button>
                {selected.other_user_avatar ? (
                  <img src={selected.other_user_avatar} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-surface-hover" />
                )}
                <div>
                  <p className="text-sm font-medium">{selected.other_user_name}</p>
                  <p className="text-xs text-text-muted">{selected.title}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-sm text-text-muted text-center py-8">No messages yet. Start the conversation.</p>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.sender_id === currentUserId ? "flex-row-reverse" : ""}`}>
                    {m.sender_avatar ? (
                      <img src={m.sender_avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-surface-hover flex-shrink-0 mt-0.5" />
                    )}
                    <div className={`max-w-[75%] ${m.sender_id === currentUserId ? "text-right" : ""}`}>
                      <div className="text-xs text-text-muted mb-0.5">{m.sender_name}</div>
                      <div className={`text-sm rounded-lg px-3 py-2 inline-block ${
                        m.sender_id === currentUserId
                          ? "bg-accent text-white"
                          : "bg-surface border border-border"
                      }`}>
                        {m.body}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
