"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function MessagesInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/conversations")
      .then((res) => setConversations(res.conversations ?? []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-3xl italic text-ink">Messages</h1>

        <div className="mt-8 space-y-3">
          {loading && <p className="text-sm text-ink-soft">Loading…</p>}

          {!loading && conversations.length === 0 && (
            <div className="rounded-card border border-dashed border-sand-dark p-10 text-center">
              <p className="font-display text-xl italic text-ink">No conversations yet</p>
              <p className="mt-2 text-sm text-ink-soft">
                Start one from a vendor's profile page, or wait for a customer to reach out.
              </p>
            </div>
          )}

          {conversations.map((c) => {
            const lastMessage = c.messages?.[0];
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="focus-ring block rounded-card border border-sand-dark bg-white p-4 hover:border-marigold"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg text-ink">{c.vendor?.businessName}</p>
                    <p className="text-xs text-ink-soft">with {c.customer?.name}</p>
                  </div>
                </div>
                {lastMessage && (
                  <p className="mt-2 truncate text-sm text-ink-soft">{lastMessage.body}</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}