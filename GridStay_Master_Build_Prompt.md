# GridStay — Master Build & Fix Prompt

Paste this whole document as your instruction. It contains full project context, the current bugs, and a step-by-step build order. Written so an AI assistant can act as both a senior UI/UX designer and a backend engineer without needing anything re-explained.

---

## 1. Role

Act as a senior full-stack engineer who is also a UI/UX designer specializing in minimalist, glassmorphic interfaces. You will read the existing code before changing anything, never guess at file locations, and never introduce a new design language — you will strictly reuse the design system that already exists in this codebase. Fix root causes, not symptoms. After every change, verify it compiles and renders correctly before moving on.

## 2. Project Overview

GridStay is a Vertical SaaS Marketplace for the unorganized rental sector (student hostels, PGs, co-living spaces) — an "OYO for Hostels." It is dual-sided:

- **Student Marketplace**: discover verified hostels on a map, see real-time bed availability (1/2/3/4-sharing), sign digital rental agreements via Aadhaar eSign.
- **Provider SaaS OS**: dashboard for hostel owners to track bed-level inventory, manage maintenance tickets, automate rent collection and split-payments via Razorpay Route.
- **Firebase backend**: Auth (dual-role: student vs. provider) and Firestore for real-time sync (a booked bed disappears from search instantly).

## 3. Tech Stack (already installed — do not change versions without asking)

- Next.js 16 (App Router), TypeScript, React 19
- Tailwind CSS v4 (`@theme inline` syntax in `globals.css`, not a `tailwind.config.js`)
- Framer Motion for animation
- Lenis for smooth scroll
- Firebase (Auth, Firestore, Storage) — already configured in `.env.local`
- Fonts: **Clash Display** (headers, `var(--font-display)`) and **Satoshi** (body/labels, `var(--font-body)`), loaded via Fontshare CDN in `src/app/layout.tsx`

## 4. Current File Structure

```
src/
  app/
    (provider)/dashboard/page.tsx
    (provider)/layout.tsx
    (student)/explore/page.tsx
    (student)/layout.tsx
    auth/login/page.tsx        ← BROKEN: ignores design system, see Section 6
    auth/signup/page.tsx       ← PARTIAL: has its own EchoLogo, placeholder bg image
    globals.css                ← SOURCE OF TRUTH for the glass design system
    layout.tsx                 ← root layout, loads fonts
    page.tsx                   ← landing page
  components/
    landing/CTASection.tsx
    landing/Footer.tsx
    landing/Header.tsx
    landing/HeroSection.tsx    ← has its own working Echo Stack + video background
    landing/PhilosophySection.tsx
    landing/ServicesSection.tsx
    landing/ShowcaseGrid.tsx
    ui/glass/GlassButton.tsx
    ui/glass/GlassCard.tsx
    ui/glass/index.ts
  lib/
    esign/contracts.ts
    firebase/beds.ts
    firebase/config.ts         ← Firebase init, reads .env.local, WORKS
    firebase/useAuth.ts        ← dual-role auth hook, WORKS, do not rewrite
    razorpay/payments.ts
```

## 5. Design System — Source of Truth ("Kavach Sathi" reference)

This is not a request to invent a new look. `src/app/globals.css` (lines ~218–504) already defines the correct glassmorphic auth system. Any auth-related component must use these existing classes, not new inline styles:

- **`.auth-page-wrapper`** — full-screen centered flex container
- **`.auth-bg`** — fixed, full-bleed layered radial-gradient background in light-grey/white tones with `filter: blur(40px)` (this IS the "high-blur abstract pattern" — use it, don't replace it with a stock photo)
- **`.glass-card`** — the login/signup card: `max-width: 460px`, `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.2)`, `border-radius: 20px`
- **`.role-toggle-track` / `.role-toggle-btn` / `.role-toggle-indicator`** — the Student/Hostel Owner pill toggle
- **`.glass-heading` / `.glass-subheading`** — title typography (Clash Display)
- **`.glass-form` / `.glass-field` / `.glass-label` / `.glass-input` / `.glass-hint`** — form elements: transparent backgrounds, `1px solid` bottom border only, small uppercase labels above each field
- **`.glass-submit-btn`** — primary CTA button
- **`.glass-footer-links` / `.glass-link`** — "Get Started" / "Forgot Password?" row
- **`.glass-toast` / `.glass-toast-dot` / `.glass-spinner`** — error toast and loading spinner

**Branding — "Echo Stack" logo:** 5 stacked layers of the wordmark "GRIDSTAY". Top layer solid black (or near-black), the 4 layers behind it are light grey with descending opacity and a Y-axis offset, creating a motion-blur/echo trail effect upward. Two working reference implementations already exist in the codebase:
- `src/components/landing/HeroSection.tsx` (4 echo layers + 1 solid front layer, uses `--font-display`, `clamp()` sizing)
- `src/app/auth/signup/page.tsx`'s local `EchoLogo()` function (5 layers using Tailwind opacity classes)

These two are inconsistent with each other. Consolidate into **one shared component** (Section 7, Task 3).

**Typography rule:** Clash Display for headings/logo, Satoshi for body, labels, inputs, buttons. Never fall back to system sans-serif.

## 6. Known Bugs (confirmed by reading the code — fix these first)

1. **`src/app/auth/login/page.tsx` does not use the design system at all.** It reimplements everything with inline `style={}` objects: a flat `#F8F9FA` background instead of `.auth-bg`'s blurred gradient, no `.glass-card` (no blur, no transparency, no border), a hand-rolled role toggle that doesn't match `.role-toggle-track`, and **no Echo Stack logo** — just a plain "GridStay" text label in the top-left corner. This is the main problem to fix.

2. **`src/app/auth/signup/page.tsx` uses a placeholder Unsplash stock photo** (`backgroundImage: url("https://images.unsplash.com/...")`) instead of the `.auth-bg` blurred radial-gradient pattern that's already defined for this exact purpose.

3. **Three divergent Echo Stack implementations** exist (`HeroSection.tsx`, `signup/page.tsx`'s inline `EchoLogo`, and login has none) — no shared component, so the logo will drift out of sync as each page is edited independently.

4. **Verify before assuming fixed:** run a TypeScript/ESLint pass and `next dev` after changes — do not declare done just because the file was edited. Check the browser console for hydration errors, missing font warnings, and Firebase initialization errors (a missing `.env.local` var throws at runtime, not build time).

## 7. Step-by-Step Build Order

Work through these in order. Do not skip verification steps.

**Task 1 — Audit environment**
Confirm `.env.local` has all six `NEXT_PUBLIC_FIREBASE_*` keys populated (config.ts reads them). Run `npm run dev` and confirm the app boots with no console errors before touching any UI code.

**Task 2 — Extract shared `EchoStackLogo` component**
Create `src/components/ui/EchoStackLogo.tsx`. Props: `size` (sm/md/lg or a pixel value) and optional `className`. Port the 5-layer pattern from `signup/page.tsx`'s `EchoLogo`, matching the opacity/offset curve already proven there. Replace the local logo code in `HeroSection.tsx` and `signup/page.tsx` with this shared component so all three surfaces (hero, signup, login) stay pixel-identical going forward.

**Task 3 — Rebuild `src/app/auth/login/page.tsx`**
Strip all inline `style={}` objects. Rebuild using the existing classes: `.auth-page-wrapper` → `.auth-bg` (as a sibling fixed div, matching how it's meant to be used) → `.glass-card` containing `<EchoStackLogo />`, `.glass-heading`/`.glass-subheading`, `.role-toggle-track` with `.role-toggle-indicator` sliding between Student/Hostel Owner, `.glass-form` with two `.glass-field`s (email, password) using `.glass-label` + `.glass-input`, `.glass-submit-btn` wired to the existing `useAuth().signIn`, and `.glass-footer-links`. Keep all existing Firebase logic (`useAuth`, `signIn`, role-mismatch error handling, redirect to `/dashboard` or `/explore`) — only the markup/styling changes, not the auth behavior.

**Task 4 — Align `signup/page.tsx` to the same background**
Swap the Unsplash `backgroundImage` for `.auth-bg`, and swap its local `EchoLogo()` for `<EchoStackLogo />` from Task 2. Confirm the glass card, inputs, and role toggle already there match `.glass-*` classes 1:1; adjust any Tailwind-class drift to use the shared CSS classes instead where they conflict.

**Task 5 — Cross-check `HeroSection.tsx`**
Confirm it now imports `<EchoStackLogo />` instead of its inline layer map, and still renders correctly over the `hero-bg.mp4` video background.

**Task 6 — Debug pass**
Run `npm run lint` and fix all reported errors. Start `npm run dev`, open `/auth/login`, `/auth/signup`, and `/` in the browser, and check the console for: hydration mismatches, missing font-loading warnings, Firebase `auth/*` errors, and any TypeScript errors surfaced in the terminal. Test the role toggle, form validation (empty fields, wrong password, role mismatch), and both success redirects (`/dashboard` for provider, `/explore` for student).

**Task 7 — Report back**
Summarize exactly what changed per file, flag anything that still needs real Firebase test accounts to verify (e.g., actual sign-in with a seeded Firestore user), and note any remaining visual gaps versus the Kavach Sathi reference screenshots.

## 8. Constraints

- Do not change the Firebase config, `useAuth.ts` logic, or Firestore schema — only the UI layer.
- Do not add new npm dependencies unless something is genuinely missing (check `package.json` first).
- Do not invent new color values or CSS classes when an equivalent already exists in `globals.css` — extend that system, don't fork it.
- This is a first-time Claude Code / Cowork user — explain what you changed and why in plain terms, not just diffs.
