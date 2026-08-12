"use client";

import { useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

export type UserRole = "provider" | "student";

export interface GridStayUser {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName?: string;
  aadhaarNumber?: string;
}

interface AuthState {
  user: GridStayUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAuth — Dual-role authentication hook for GridStay.
 *
 * Wraps Firebase onAuthStateChanged and checks the Firestore
 * `users` collection for role verification. Provides sign-in,
 * sign-up (with role + optional Aadhaar), sign-out, and
 * automatic role-based redirection helpers.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  /* ── Fetch Firestore user doc ── */
  const fetchUserProfile = useCallback(
    async (firebaseUser: User): Promise<GridStayUser | null> => {
      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: data.role as UserRole,
            displayName: data.displayName,
            aadhaarNumber: data.aadhaarNumber,
          };
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  /* ── Auth state listener ── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser);
        setState({
          user: profile,
          firebaseUser,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        });
      }
    });
    return unsubscribe;
  }, [fetchUserProfile]);

  /* ── Sign In ── */
  const signIn = useCallback(
    async (email: string, password: string, expectedRole: UserRole) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);

        // Verify role in Firestore
        const profile = await fetchUserProfile(cred.user);
        if (!profile) {
          await firebaseSignOut(auth);
          setState((s) => ({
            ...s,
            loading: false,
            error: "Account not found. Please sign up first.",
          }));
          return null;
        }

        if (profile.role !== expectedRole) {
          await firebaseSignOut(auth);
          setState((s) => ({
            ...s,
            loading: false,
            error: `This account is registered as a ${profile.role}. Please select the correct role.`,
          }));
          return null;
        }

        setState({
          user: profile,
          firebaseUser: cred.user,
          loading: false,
          error: null,
        });
        return profile;
      } catch (err: unknown) {
        const message = mapFirebaseError(err);
        setState((s) => ({ ...s, loading: false, error: message }));
        return null;
      }
    },
    [fetchUserProfile]
  );

  /* ── Sign Up ── */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole,
      displayName?: string,
      aadhaarNumber?: string
    ) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Create Firestore profile
        const userData: Record<string, unknown> = {
          email,
          role,
          displayName: displayName || "",
          createdAt: serverTimestamp(),
        };

        if (role === "provider" && aadhaarNumber) {
          userData.aadhaarNumber = aadhaarNumber;
        }

        await setDoc(doc(db, "users", cred.user.uid), userData);

        const profile: GridStayUser = {
          uid: cred.user.uid,
          email,
          role,
          displayName,
          aadhaarNumber,
        };

        setState({
          user: profile,
          firebaseUser: cred.user,
          loading: false,
          error: null,
        });
        return profile;
      } catch (err: unknown) {
        const message = mapFirebaseError(err);
        setState((s) => ({ ...s, loading: false, error: message }));
        return null;
      }
    },
    []
  );

  /* ── Sign Out ── */
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setState({ user: null, firebaseUser: null, loading: false, error: null });
  }, []);

  /* ── Clear Error ── */
  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  /* ── Redirect Helper ── */
  const getRedirectPath = useCallback((role: UserRole) => {
    return role === "provider" ? "/dashboard" : "/explore";
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    getRedirectPath,
  };
}

/* ── Firebase Error Mapper ── */
function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
