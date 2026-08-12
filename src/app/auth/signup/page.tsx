"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type UserRole } from "@/lib/firebase/useAuth";

function EchoLogo() {
  return (
    <div className="relative flex items-center justify-center h-16 mb-8 w-full">
      {/* 4px offset per layer with descending opacities of black/grey */}
      <span className="absolute font-[family-name:var(--font-display)] font-black text-5xl uppercase tracking-widest text-black/[0.02] translate-y-[16px]">GRIDSTAY</span>
      <span className="absolute font-[family-name:var(--font-display)] font-black text-5xl uppercase tracking-widest text-black/[0.05] translate-y-[12px]">GRIDSTAY</span>
      <span className="absolute font-[family-name:var(--font-display)] font-black text-5xl uppercase tracking-widest text-black/[0.15] translate-y-[8px]">GRIDSTAY</span>
      <span className="absolute font-[family-name:var(--font-display)] font-black text-5xl uppercase tracking-widest text-black/[0.25] translate-y-[4px]">GRIDSTAY</span>
      <span className="absolute font-[family-name:var(--font-display)] font-black text-5xl uppercase tracking-widest text-black z-10">GRIDSTAY</span>
    </div>
  );
}

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
  const inputBaseClasses = "w-full bg-transparent py-2 text-black focus:outline-none placeholder:text-black/30 border-b border-black/20 focus:border-black transition-colors [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_50px_rgba(255,255,255,0.01)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:black]";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center overflow-hidden font-[family-name:var(--font-body)] p-6 py-12 bg-cover bg-center bg-fixed"
      style={{ 
        // Abstract light-grey bokeh/hexagonal placeholder background
        backgroundImage: 'url("https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2560&auto=format&fit=crop")',
        backgroundColor: '#f3f4f6' 
      }}
    >
      {/* Light Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md p-12 rounded-[40px] flex flex-col gap-10 shadow-2xl shadow-black/5 my-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.20)',
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center w-full">
          <EchoLogo />
          <h2 className="text-black text-2xl font-semibold tracking-tight font-[family-name:var(--font-display)]">Get started</h2>
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

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">Full Name</label>
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
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">Email</label>
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
                  <label className="text-[11px] font-bold tracking-[0.2em] uppercase flex items-center justify-between text-black/50">
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
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">Password</label>
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
            <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-black/50">Confirm Password</label>
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
            className="w-full bg-[#111111] text-white font-extrabold uppercase tracking-[0.2em] py-4 rounded-full flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20"
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
