"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function ConversationPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const currentUser = typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("user") ?? "null") : null;

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function load() {
    api
      .get(`/conversations/${id}/messages`)
      .then((res) => setMessages(res.messages ?? []))
      .catch(() => {});
  }

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      await api.post(`/conversations/${id}/messages`, { body: text.trim() });
      setText("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper">
      <Header />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
        <h1 className="font-display text-2xl italic text-ink">Conversation</h1>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto rounded-card border border-sand-dark bg-white p-4">
          {messages.length === 0 && (
            <p className="text-sm text-ink-soft">No messages yet — say hello.</p>
          )}
          {messages.map((m) => {
            const isMine = m.senderId === currentUser?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "bg-ink text-paper" : "bg-sand text-ink"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="mt-2 text-sm text-rani">{error}</p>}

        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="focus-ring flex-1 rounded-full border border-sand-dark bg-white px-4 py-2 text-sm text-ink outline-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="focus-ring rounded-full bg-marigold px-5 py-2 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}