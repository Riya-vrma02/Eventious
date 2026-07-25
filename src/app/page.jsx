"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import VendorCard from "@/components/VendorCard";
import { api } from "@/lib/api";

const FALLBACK_CATEGORIES = ["Catering", "Photography", "Decor", "Venues", "Event managers"];

export default function HomePage() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES.map((name) => ({ name })));
  const [activeCategory, setActiveCategory] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.categories?.length) setCategories(res.categories);
    }).catch(() => {
      // Backend not reachable yet — the fallback category list above keeps the page usable.
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : "";
    api
      .get(`/vendors${query}`)
      .then((res) => setVendors(res.vendors ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">One event, every vendor</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl italic leading-tight text-ink md:text-5xl">
          Plan the whole thing without twenty separate calls.
        </h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          Browse caterers, photographers, decorators and more, then bundle everyone you book into one event and one checkout.
        </p>

        <div className="mt-8 flex max-w-xl items-center rounded-full border border-sand-dark bg-white px-5 py-3">
          <input
            type="text"
            placeholder="Search vendors, city, or event type"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap gap-2 border-b border-sand-dark pb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`focus-ring rounded-full px-4 py-1.5 text-sm transition ${
              activeCategory === null ? "bg-ink text-paper" : "border border-sand-dark text-ink-soft hover:border-marigold"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id ?? c.name}
              onClick={() => setActiveCategory(c.name)}
              className={`focus-ring rounded-full px-4 py-1.5 text-sm transition ${
                activeCategory === c.name ? "bg-ink text-paper" : "border border-sand-dark text-ink-soft hover:border-marigold"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <p className="text-sm text-ink-soft">Loading vendors…</p>
        ) : vendors.length === 0 ? (
          <div className="rounded-card border border-dashed border-sand-dark p-10 text-center">
            <p className="font-display text-xl italic text-ink">No vendors here yet</p>
            <p className="mt-2 text-sm text-ink-soft">
              Once vendors are seeded and approved, they'll show up in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
