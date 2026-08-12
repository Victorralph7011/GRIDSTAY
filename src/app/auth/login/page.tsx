"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type UserRole } from "@/lib/firebase/useAuth";
import EchoStackLogo from "@/components/ui/EchoStackLogo";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuth();

  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email || !password) {
      flash("Please fill in all fields.");
      return;
    }
    const profile = await signIn(email, password, role);
    if (profile) {
      router.push(profile.role === "provider" ? "/dashboard" : "/explore");
    }
  };

  if (error && !showToast) {
    flash(error);
    clearError();
  }

  // Kill Chrome's ugly autofill background boxes — same treatment as signup
  const inputBaseClasses =
    "w-full bg-transparent py-2 text-black focus:outline-none placeholder:text-black/30 border-b border-black/20 focus:border-black transition-colors [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_rgba(255,255,255,0.01)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]";

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden font-[family-name:var(--font-body)] p-6 py-12 relative">
      {/* Abstract high-blur background — same layered gradient as signup, no external image */}
      <div className="auth-bg" />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md p-12 rounded-[40px] flex flex-col gap-10 shadow-2xl shadow-black/5 my-auto"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          border: "1px solid rgba(255, 255, 255, 0.20)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center w-full">
          <EchoStackLogo />
          <h2 className="text-black text-2xl font-semibold tracking-tight font-[family-name:var(--font-display)]">
            Welcome back
          </h2>
        </div>

        {/* Dual-Role Toggle */}
        <div className="relative flex p-1 rounded-full border border-black/10 bg-black/5">
          <motion.div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-black/10"
            animate={{ x: role === "student" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${role === "student" ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`relative z-10 flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${role === "provider" ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            Hostel Owner
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBaseClasses}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBaseClasses} tracking-widest`}
              placeholder="Your password"
              required
            />
          </div>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#111111] text-white font-extrabold uppercase tracking-[0.2em] py-4 rounded-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Footer Links */}
        <div className="flex justify-center items-center gap-6 w-full">
          <Link
            href="/auth/signup"
            className="text-[11px] font-bold tracking-widest uppercase text-black/40 hover:text-black transition-colors"
          >
            Get Started
          </Link>
          <span className="text-black/20">•</span>
          <Link
            href="#"
            className="text-[11px] font-bold tracking-widest uppercase text-black/40 hover:text-black transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl bg-white/90 backdrop-blur-md border border-black/10"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm font-medium text-black">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
