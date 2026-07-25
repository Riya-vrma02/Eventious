"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function logout() {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("vendorProfileId");
    window.localStorage.removeItem("activeEventId");
    window.location.href = "/";
  }

  return (
    <header className="border-b border-sand-dark bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl italic text-ink">
          Gather
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          <Link href="/" className="focus-ring hover:text-marigold-deep">
            Browse
          </Link>

          {user?.role === "customer" && (
            <Link href="/events" className="focus-ring hover:text-marigold-deep">
              My events
            </Link>
          )}

          {user && (
            <Link href="/messages" className="focus-ring hover:text-marigold-deep">
              Messages
            </Link>
          )}

          {user?.role === "vendor" && (
            <Link href="/vendor-dashboard" className="focus-ring hover:text-marigold-deep">
              Dashboard
            </Link>
          )}

          {!user && (
            <Link href="/vendor-dashboard" className="focus-ring hover:text-marigold-deep">
              For vendors
            </Link>
          )}

          {user?.role === "admin" && (
            <Link href="/admin" className="focus-ring hover:text-marigold-deep">
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-ink">{user.name}</span>
              <button onClick={logout} className="focus-ring text-ink-soft underline hover:text-rani">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="focus-ring hover:text-marigold-deep">
                Log in
              </Link>
              <Link
                href="/register"
                className="focus-ring rounded-full bg-ink px-4 py-1.5 text-paper hover:bg-ink-soft"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}