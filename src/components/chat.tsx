"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  body: string;
  created_at: string;
};

export function Chat({ requestId, currentUserId }: { requestId: number; currentUserId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function fetchMessages() {
    fetch(`/api/requests/${requestId}/messages`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    await fetch(`/api/requests/${requestId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: input }),
    });
    setInput("");
    setSending(false);
    fetchMessages();
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface">
        <h3 className="text-sm font-medium">Messages</h3>
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((m) => (
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
          onChange={(e) => setInput(e.target.value)}
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
    </div>
  );
}
