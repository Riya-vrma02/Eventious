"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import VendorCard from "@/components/VendorCard";
import { api } from "@/lib/api";

const FALLBACK_CATEGORIES = ["Catering", "Photography", "Decor", "Venues", "Event managers"];

export default function HomePage() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES.map((name) => ({ name })));
  const [activeCategory, setActiveCategory] = useState(null);
  const [maxBudget, setMaxBudget] = useState("");
  const [date, setDate] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => {
      if (res.categories?.length) setCategories(res.categories);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (maxBudget) params.set("maxBudget", maxBudget);
    if (date) params.set("date", date);
    const query = params.toString() ? `?${params.toString()}` : "";

    api
      .get(`/vendors${query}`)
      .then((res) => setVendors(res.vendors ?? []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, [activeCategory, maxBudget, date]);

  const filtersActive = maxBudget || date;

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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-sand-dark bg-white px-4 py-2">
            <span className="text-xs text-ink-soft">Max budget</span>
            <input
              type="number"
              min="0"
              placeholder="₹ any"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-24 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
            />
          </div>

          <div className="flex items-center gap-2 rounded-full border border-sand-dark bg-white px-4 py-2">
            <span className="text-xs text-ink-soft">Available on</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-ink outline-none"
            />
          </div>

          {filtersActive && (
            <button
              onClick={() => {
                setMaxBudget("");
                setDate("");
              }}
              className="focus-ring text-xs text-ink-soft underline hover:text-rani"
            >
              Clear filters
            </button>
          )}
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
            <p className="font-display text-xl italic text-ink">No vendors match</p>
            <p className="mt-2 text-sm text-ink-soft">
              {filtersActive
                ? "Try a higher budget, a different date, or clearing filters."
                : "Once vendors are seeded and approved, they'll show up here."}
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