# Event marketplace — backend scaffold (JavaScript)

Next.js (App Router) + Prisma + PostgreSQL scaffold implementing the ERD and API route list from planning. Plain JavaScript — no TypeScript build step, so it runs directly in VS Code with the standard Node/Next.js setup.

## Open in VS Code

1. Unzip and open the `event-marketplace` folder in VS Code (`code event-marketplace`).
2. Install the recommended extensions if prompted (ESLint, Prisma — optional but helpful for `.prisma` syntax highlighting).
3. Open a terminal in VS Code (`` Ctrl+` ``) and run the setup below.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run seed            # loads starter service categories
npm run dev
```

Server runs at `http://localhost:3000`, API routes under `http://localhost:3000/api/...`.

## Structure

```
prisma/
  schema.prisma        # full data model
  seed.js               # seeds service categories

src/
  lib/
    prisma.js            # Prisma client singleton
    auth.js               # JWT sign/verify, password hashing, getAuth() helper
    api.js                # client-side fetch helper used by the frontend pages

  components/
    Header.jsx            # shared nav
    VendorCard.jsx         # vendor grid card (the arch-photo signature element)

  app/
    page.jsx                          # homepage — browse/search + category filters
    vendors/[id]/page.jsx              # vendor profile — packages, availability, reviews, "add to event"
    events/[id]/page.jsx               # event builder/cart — multi-vendor bundle + checkout
    vendor-dashboard/page.jsx          # vendor's booking requests + earnings
    admin/page.jsx                     # admin — stats, vendor approvals, disputes
    api/...                            # all backend routes (see below)
```

## Frontend notes

- Plain client components (`"use client"`) that fetch from the API routes on mount — no server-side auth wiring yet, so `src/lib/api.js` reads a JWT from `localStorage` under the key `token`. Wire up a real login page to set that after `/api/auth/login`.
- The event builder page reads/writes `activeEventId` in `localStorage` as a stand-in for "the event you're currently planning" — replace with real session/URL state once there's a proper event-selection flow.
- The vendor dashboard reads `vendorProfileId` from `localStorage` the same way — replace once login returns the vendor's own profile id.
- Styling is Tailwind with a custom palette (`tailwind.config.js`): ink/paper base, marigold gold as the primary action color, emerald and rani (deep pink) as secondary accents. The vendor photo's arch-shaped frame (`.arch-frame` in `globals.css`) is the one recurring signature element, used on cards and the vendor profile hero.
- Run `npm install` once — it now also pulls in `tailwindcss`, `postcss`, and `autoprefixer` for the frontend.

## API routes
    auth/register, login
    vendors/                          # search/list, create
    vendors/[id]/                     # detail, update
    vendors/[id]/services/            # vendor's packages
    vendors/[id]/availability/        # block/unblock dates
    categories/                       # service categories
    vendors/[id]/verify/               # admin approve/reject (the approval queue button)
    vendors/[id]/reviews/              # reviews shown on a vendor's profile
    events/                           # customer's events
    events/[id]/bookings/             # add a vendor to an event (the cart)
    bookings/[id]/status/             # accept/decline/cancel
    bookings/[id]/payments/           # initiate payment
    bookings/[id]/reviews/            # post-completion review
    payments/webhook/                 # gateway callback, unauthenticated
    conversations/                    # list / start a thread with a vendor
    conversations/[id]/messages/       # send/read messages in a thread
    admin/stats/                      # platform overview
    admin/vendors/pending/            # approval queue
    admin/disputes/                   # list + raise disputes
    admin/disputes/[id]/              # resolve a dispute, optional refund
    admin/commissions/                # get/set per-category commission rate
```

## What's stubbed vs real

- **Real**: auth (JWT + bcrypt), full Prisma schema (now including conversations, messages, disputes, and per-category commission rate), the core event → booking → payment → review flow, chat, admin approval/disputes/commissions — all with ownership/role checks on every mutating route.
- **Stubbed — needs a real integration**: `payments/webhook` signature verification, `bookings/[id]/payments` gateway order creation, and the refund call inside `admin/disputes/[id]` are marked with `TODO` — wire up Razorpay or Stripe's SDK at those three spots. Everything else in those routes (updating our own DB records) is real.
- **Not yet scaffolded**: frontend pages. The backend now covers every route from the original API list.

## Auth pattern

Every protected route calls `getAuth(request)` from `src/lib/auth.ts` to pull and verify the bearer token, then checks `auth.userId` / `auth.role` against the resource being touched (e.g. a vendor can only edit their own profile; only admins can approve vendors).
