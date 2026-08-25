"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/lib/firebase/useAuth";

interface RoleGuardProps {
  /** Roles permitted to view this subtree. */
  allow: UserRole[];
  /**
   * Provider-only: bounce to /onboarding if the wizard hasn't been
   * completed yet. No-op for students. Left false by default so pages
   * built before the onboarding wizard exists aren't gated on a field
   * (`onboardingComplete`) their auth profile doesn't have yet.
   */
  requireOnboarding?: boolean;
  children: React.ReactNode;
}

/**
 * Client-side route guard composed on top of useAuth() rather than
 * inside it, so useAuth.ts itself never needs to change.
 *
 * Three states matter and must not be conflated:
 * 1. `loading` — auth state hasn't resolved yet. Render nothing
 *    committal and do NOT redirect, or every protected page flashes
 *    its content (or a login bounce) for a frame on every load.
 * 2. `firebaseUser` exists but `user` is null — the Firestore
 *    `users/{uid}` profile doc is missing (deleted, or a signup that
 *    died between auth creation and the profile write). useAuth
 *    already collapses this to `user: null`, so it's handled by the
 *    same branch as "signed out" — there's no separate profile-repair
 *    flow today, and pretending there is would be dishonest.
 * 3. Resolved with a role outside `allow` — send them to their OWN
 *    section rather than a bare error, via the existing
 *    getRedirectPath, so a student hitting a provider URL just lands
 *    on /explore instead of a dead end.
 */
export default function RoleGuard({
  allow,
  requireOnboarding = false,
  children,
}: RoleGuardProps) {
  const { user, loading, getRedirectPath } = useAuth();
  const router = useRouter();

  const isAllowed = !loading && user !== null && allow.includes(user.role);
  const needsOnboarding =
    isAllowed &&
    requireOnboarding &&
    user!.role === "provider" &&
    !user!.onboardingComplete;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(getRedirectPath(user.role));
      return;
    }
    if (needsOnboarding) {
      router.replace("/onboarding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, needsOnboarding]);

  if (!isAllowed || needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-midgrey text-sm">
        {loading ? "Loading…" : "Redirecting…"}
      </div>
    );
  }

  return <>{children}</>;
}
