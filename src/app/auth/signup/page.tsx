"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type UserRole } from "@/lib/firebase/useAuth";
import EchoStackLogo from "@/components/ui/EchoStackLogo";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const flash = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)];
    setAadhaarNumber(parts.filter(Boolean).join(" "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!email || !password || !displayName) { flash("Please fill in all required fields."); return; }
    if (password !== confirmPassword) { flash("Passwords do not match."); return; }
    if (password.length < 6) { flash("Password must be at least 6 characters."); return; }
    if (role === "provider" && aadhaarNumber.replace(/\s/g, "").length !== 12) {
      flash("Please enter a valid 12-digit Aadhaar number."); return;
    }
    const profile = await signUp(email, password, role, displayName,
      role === "provider" ? aadhaarNumber.replace(/\s/g, "") : undefined
    );
    if (profile) {
      router.push(profile.role === "provider" ? "/dashboard" : "/explore");
    }
  };

  if (error && !showToast) { flash(error); clearError(); }

  // CSS Hack to kill Chrome's ugly autofill background boxes
  const inputBaseClasses = "w-full bg-white/50 rounded-xl px-4 py-3 text-[15px] text-black border border-black/10 placeholder:text-black/30 focus:outline-none focus:border-black/40 focus:bg-white/70 transition-colors [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_rgba(255,255,255,0.85)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]";

  return (
    <div className="auth-page-wrapper font-[family-name:var(--font-body)]">
      {/* Abstract high-blur background — no external image, matches login page */}
      <div className="auth-bg" />

      {/* Light Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card flex flex-col gap-9"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center w-full gap-2">
          <EchoStackLogo size="34px" />
          <p className="text-[13px] text-black/45 tracking-wide">Get started</p>
        </div>

        {/* Dual-Role Toggle */}
        <div className="relative grid grid-cols-2 p-1 rounded-full bg-black/[0.06]">
          <motion.div
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm"
            animate={{ x: role === "student" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`relative z-10 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${role === "student" ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`relative z-10 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${role === "provider" ? "text-black" : "text-black/40 hover:text-black/70"}`}
          >
            Hostel Owner
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[0.16em] uppercase text-black/45">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputBaseClasses}
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[0.16em] uppercase text-black/45">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBaseClasses}
              placeholder="you@example.com"
            />
          </div>

          {/* Aadhaar — Provider only */}
          <AnimatePresence>
            {role === "provider" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-[0.16em] uppercase flex items-center justify-between text-black/45">
                    Aadhaar Number
                    <span className="text-[8px] tracking-wider opacity-60">REQUIRED FOR ESIGN</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={aadhaarNumber}
                    onChange={(e) => handleAadhaar(e.target.value)}
                    className={`${inputBaseClasses} tracking-widest`}
                    placeholder="1234 5678 9012"
                    maxLength={14}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[0.16em] uppercase text-black/45">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBaseClasses}
              placeholder="Min. 6 characters"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-[0.16em] uppercase text-black/45">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputBaseClasses}
              placeholder="Re-enter password"
            />
          </div>

          {/* Main Pill Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#111111] text-white text-[12px] font-bold uppercase tracking-[0.16em] py-4 rounded-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20 hover:bg-black transition-colors"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="flex justify-center w-full">
          <Link href="/auth/login" className="text-[11px] font-bold tracking-widest uppercase text-black/40 hover:text-black transition-colors">
            Sign In Instead
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
