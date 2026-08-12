# GridStay — Fix Turbopack Crash + Scroll Glitch (Debug Prompt)

Paste this whole document as your instruction on your local machine (this needs to run where `npm run dev` actually runs — a cloud sandbox can't reproduce a Windows-local Turbopack panic).

---

## 1. Role

Act as a senior Next.js/Windows build-tooling engineer. Diagnose root cause before applying fixes — don't just restart the dev server and call it fixed. After every change, run `npm run dev`, let it sit idle for 60+ seconds, then hit the page 10+ times to confirm the panic doesn't recur, not just that it boots once.

## 2. Symptoms (exact, from the terminal log)

```
FATAL: An unexpected Turbopack error occurred. A panic log has been written to
C:\Users\VICTUS\AppData\Local\Temp\next-panic-*.log

Error message:
Failed to write app endpoint /page
Caused by:
- Next.js package not found
...
- Next.js version: `0.0.0`
```

This repeats every ~5-6 requests, after which the dev server dies (or the route breaks) until restarted. Separately: the site "auto-scrolls" / glitches on load in the browser.

## 3. Root Cause Analysis (read this before changing anything)

**A. The Turbopack panic**
`Next.js version: 0.0.0` is the tell — Turbopack is failing to resolve/read the installed `next` package's real version from `node_modules/next/package.json`, then panicking instead of erroring cleanly. This is a known class of Windows-specific Turbopack issue with these common causes, in order of likelihood:

1. **Turbopack root misdetection.** Turbopack walks up the directory tree looking for lockfiles/workspace markers to decide the project root. If any parent folder above `GridStay` (e.g. anywhere under `E:\D drive\XXZCODE\` or `E:\`) contains a stray `package.json`, `package-lock.json`, `pnpm-lock.yaml`, or `.git`, Turbopack can anchor the project root to the wrong directory and then fail to find `next` because it's looking in the wrong `node_modules`. This is the single most common cause of exactly this error on Windows.
2. **Antivirus / Windows Defender / OneDrive interference.** If `E:\D drive\XXZCODE\GridStay` is inside a synced or real-time-scanned folder, Defender/OneDrive can lock or quarantine files mid-write while Turbopack's HMR is writing `.next` output, causing intermittent "file not found" reads a moment later.
3. **Partially corrupted `node_modules`.** An interrupted `npm install` can leave `next`'s package.json readable but its internal binary/dist files inconsistent — works for static GETs, panics once HMR tries to re-resolve the module graph.
4. **Turbopack itself is still less mature than webpack** for some Windows path edge cases (Next 16 + Turbopack is a young combo). A stable fallback exists: `next dev` without `--turbopack`.

**B. The scroll glitch**
The codebase declares `lenis` as a dependency and `globals.css` has `.lenis` / `.lenis-smooth` override rules, but **no component anywhere actually instantiates Lenis** (`new Lenis()` does not appear in the codebase — confirmed by search). So smooth-scroll is not actually wired up; native browser scroll is what's running. The "auto-scrolling/glitching" you're seeing is very likely a side effect of the Turbopack crash-and-HMR-reconnect loop above: each panic/recovery triggers a full page remount via the dev overlay, which resets scroll position and feels like the page is "jumping." Fix the panic first, then re-test — if glitching persists, it's a separate Lenis wiring issue (Task 5 below).

## 4. Step-by-Step Fix Order

**Task 1 — Check for a rogue root anchor**
In PowerShell, check every folder from the drive root down to the project for stray lockfiles or `.git` folders that don't belong to GridStay:
```powershell
Get-ChildItem "E:\" -Filter "package.json" -File
Get-ChildItem "E:\D drive" -Filter "package.json" -File
Get-ChildItem "E:\D drive\XXZCODE" -Filter "package.json" -File
```
If anything shows up outside `E:\D drive\XXZCODE\GridStay` itself, that's very likely the cause — Turbopack is anchoring to the wrong root.

**Task 2 — Pin the Turbopack root explicitly**
Regardless of what Task 1 finds, make the root explicit so Turbopack never has to guess. Edit `next.config.ts`:
```ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
```
This is currently empty (`/* config options here */` placeholder only) — that's the gap.

**Task 3 — Clean reinstall**
```powershell
cd "E:\D drive\XXZCODE\GridStay"
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```
Do not skip deleting `.next` — a stale cache from a previous crash can itself cause the next panic.

**Task 4 — Exclude the project folder from real-time scanning**
If `GridStay` sits inside OneDrive, iCloud, Dropbox, or similar sync folder, move it outside of sync (a plain local folder like `E:\D drive\XXZCODE\GridStay` is already good — confirm it is NOT also mirrored by a sync client). Then add a Windows Defender exclusion for the folder:
```
Windows Security → Virus & threat protection → Manage settings → Exclusions → Add folder → E:\D drive\XXZCODE\GridStay
```

**Task 5 — If the panic still happens, fall back off Turbopack temporarily**
Edit `package.json`'s `dev` script to drop `--turbopack` and confirm the app is stable on the standard webpack dev server:
```json
"dev": "next dev"
```
If this is stable and Turbopack keeps panicking, stay on webpack for now and re-enable Turbopack later on a Next.js patch release — don't fight an upstream Windows bug mid-project. Note this as a temporary decision, not a permanent architecture change.

**Task 6 — Wire up Lenis properly (or remove it)**
Since Lenis is currently a phantom dependency (installed, styled for, never instantiated), pick one:
- **Wire it up**: create `src/components/providers/SmoothScrollProvider.tsx` as a client component that instantiates `Lenis` in a `useEffect`, drives it with `requestAnimationFrame`, and wrap `{children}` in root `layout.tsx` with it. Add `html.lenis` class toggling so the existing CSS overrides in `globals.css` actually take effect.
- **Remove it**: if smooth scroll isn't a priority right now, remove the `lenis` dependency and the unused `.lenis*` CSS blocks so the codebase doesn't imply a feature that doesn't exist.
Decide based on whether locomotive-style scroll is still wanted for the landing page — if yes, wire it up now while you're already in this file.

**Task 7 — Verify**
Run `npm run dev`, load `/`, `/auth/login`, `/auth/signup`. Scroll each page top to bottom by mouse wheel and by dragging the scrollbar. Leave the dev server idle for 2+ minutes then reload — confirm no panic. Check the DevTools console for scroll-related errors or repeated layout-shift warnings.

## 5. Constraints

- Don't upgrade or downgrade `next`/`react` versions to "fix" this — the panic is a root/environment issue, not a version mismatch (confirmed `next@16.2.4` is correctly installed with a single copy in `node_modules`).
- Don't delete or rewrite unrelated pages while debugging — isolate the fix to `next.config.ts`, `package.json`'s dev script, and (only if pursuing Task 6) one new provider file.
- Report back exactly which Task fixed it — that tells us whether this was a root-detection bug, an AV/sync lock, or a corrupted install, which matters if it recurs later.
