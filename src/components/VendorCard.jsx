import Link from "next/link";

export default function VendorCard({ vendor }) {
  if (!vendor) return null;

  const fromPrice = vendor.services?.length
    ? Math.min(...vendor.services.map((s) => Number(s.price)))
    : null;

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="focus-ring group block rounded-card border border-sand-dark bg-white p-3 transition hover:border-marigold"
    >
      <div className="arch-frame h-36 w-full bg-sand">
        {vendor.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vendor.photoUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="pt-3">
        <p className="font-display text-lg text-ink">{vendor.businessName}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {vendor.category?.name}
          {vendor.city ? ` · ${vendor.city}` : ""}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-emerald">
            ★ {vendor.ratingAvg?.toFixed?.(1) ?? "New"}
          </span>
          {fromPrice !== null && (
            <span className="font-mono text-sm text-ink">from ₹{fromPrice.toLocaleString("en-IN")}</span>
          )}
        </div>
      </div>
    </Link>
  );
}