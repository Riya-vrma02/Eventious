"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [vendorId, setVendorId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ businessName: "", categoryId: "", city: "", description: "", photoUrl: "" });
  const [service, setService] = useState({ title: "", price: "", priceType: "fixed", description: "", imageUrl: "" });

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.categories ?? [])).catch(() => {});
  }, []);

  async function createProfile(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/vendors", profile);
      window.localStorage.setItem("vendorProfileId", res.profile.id);
      setVendorId(res.profile.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createService(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post(`/vendors/${vendorId}/services`, {
        ...service,
        price: Number(service.price),
        categoryId: profile.categoryId,
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <Header />

      <div className="mx-auto max-w-lg px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marigold-deep">Vendor setup · step {step} of 3</p>
        <h1 className="mt-2 font-display text-3xl italic text-ink">
          {step === 1 && "Tell us about your business"}
          {step === 2 && "Add your first package"}
          {step === 3 && "You're listed"}
        </h1>

        {step === 1 && (
          <form onSubmit={createProfile} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-soft">Business name</label>
              <input
                type="text"
                required
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">Category</label>
              <select
                required
                value={profile.categoryId}
                onChange={(e) => setProfile({ ...profile, categoryId: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">Short description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={3}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">Cover photo URL (optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={profile.photoUrl}
                onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
              <p className="mt-1 text-xs text-ink-soft/70">Paste a link to an image — no upload needed.</p>
            </div>

            {error && <p className="text-sm text-rani">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-full bg-marigold py-2.5 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
            >
              {loading ? "Saving…" : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={createService} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-ink-soft">Package title</label>
              <input
                type="text"
                required
                placeholder="e.g. Gold catering package"
                value={service.title}
                onChange={(e) => setService({ ...service, title: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-ink-soft">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={service.price}
                  onChange={(e) => setService({ ...service, price: e.target.value })}
                  className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-soft">Price type</label>
                <select
                  value={service.priceType}
                  onChange={(e) => setService({ ...service, priceType: e.target.value })}
                  className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
                >
                  <option value="fixed">Fixed</option>
                  <option value="per_guest">Per guest</option>
                  <option value="per_hour">Per hour</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">Description</label>
              <textarea
                value={service.description}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                rows={3}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink-soft">Photo URL (optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={service.imageUrl}
                onChange={(e) => setService({ ...service, imageUrl: e.target.value })}
                className="focus-ring mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-ink outline-none"
              />
            </div>

            {error && <p className="text-sm text-rani">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-full bg-marigold py-2.5 text-sm font-medium text-ink hover:bg-marigold-deep disabled:opacity-50"
            >
              {loading ? "Saving…" : "Add package"}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-4">
            <div className="rounded-card border border-sand-dark bg-white p-4">
              <p className="text-sm text-ink">
                Your profile and first package are saved. New vendors need admin approval before they
                show up in search — an admin can approve you from the admin panel.
              </p>
            </div>
            <button
              onClick={() => router.push("/vendor-dashboard")}
              className="focus-ring w-full rounded-full bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink-soft"
            >
              Go to vendor dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}