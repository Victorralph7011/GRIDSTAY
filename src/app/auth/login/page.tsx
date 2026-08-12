"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, type UserRole } from "@/lib/firebase/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuth();

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("student@gridstay.com");
  const [password, setPassword] = useState("password");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const flash = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password) { flash("Please fill in all fields."); return; }
    const profile = await signIn(email, password, role);
    if (profile) {
      router.push(profile.role === "provider" ? "/dashboard" : "/explore");
    }
  };

  if (error && !showToast) { flash(error); clearError(); }

  return (
    <div className="auth-page-wrapper" style={{ background: "#F8F9FA" }}>

      {/* Background — soft bokeh blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(210,215,225,0.5)",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "10%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(220,225,235,0.4)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* GridStay Logo — Top Left */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 32,
          zIndex: 20,
          fontFamily: "var(--font-body)",
          fontSize: 20,
          fontWeight: 600,
          color: "#111",
          letterSpacing: "-0.02em",
        }}
      >
        GridStay
      </div>

      {/* Main Login Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title — clean sans-serif, NOT Clash Display */}
        <h1
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#111",
            letterSpacing: "0",
            textAlign: "center",
            width: "100%",
            marginBottom: 32,
          }}
        >
          Welcome back
        </h1>

        {/* Role Selector Toggle */}
        <div
          style={{
            display: "flex",
            width: "100%",
            background: "rgba(0,0,0,0.04)",
            borderRadius: 9999,
            padding: 4,
            marginBottom: 40,
          }}
        >
          <button
            type="button"
            onClick={() => setRole("student")}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              transition: "all 300ms ease",
              background: role === "student" ? "#111" : "transparent",
              color: role === "student" ? "#fff" : "#666",
              boxShadow: role === "student" ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
            }}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            style={{
              flex: 1,
              padding: "12px 0",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              transition: "all 300ms ease",
              background: role === "provider" ? "#111" : "transparent",
              color: role === "provider" ? "#fff" : "#666",
              boxShadow: role === "provider" ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
            }}
          >
            Hostel Owner
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Email Field */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1.5px solid #111",
                padding: "8px 0",
                fontSize: 15,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                color: "#111",
                outline: "none",
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#666",
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                borderBottom: "1.5px solid #111",
                padding: "8px 0",
                fontSize: 18,
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                color: "#111",
                outline: "none",
                letterSpacing: "0.15em",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 0",
              marginTop: 8,
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 9999,
              fontSize: 12,
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
              transition: "background 300ms ease",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Footer Links */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 4,
            }}
          >
            <Link
              href="/auth/signup"
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#666",
                textDecoration: "none",
                transition: "color 300ms ease",
              }}
            >
              Get Started
            </Link>
            <Link
              href="#"
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#666",
                textDecoration: "none",
                transition: "color 300ms ease",
              }}
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-toast"
          >
            <span className="glass-toast-dot" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
