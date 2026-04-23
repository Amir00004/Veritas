"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { SiriOrb } from "@/components/ui/siri-orb";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login, register } = useAuth();

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v: string) => v.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setStatusMessage("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else setEmailError("");

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else setPasswordError("");

    if (!valid) return;

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        });
        setStatusMessage("Account created. Please sign in.");
        setMode("signin");
        setPassword("");
      } else {
        await login(email, password);
        router.push("/chat");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setEmailError("");
    setPasswordError("");
    setStatusMessage("");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Side glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/3 w-80 h-120 opacity-25"
          style={{ background: "radial-gradient(ellipse at left, rgba(249,115,22,0.4) 0%, transparent 65%)", filter: "blur(70px)" }} />
        <div className="absolute -right-24 top-1/2 w-80 h-120 opacity-20"
          style={{ background: "radial-gradient(ellipse at right, rgba(249,115,22,0.3) 0%, transparent 65%)", filter: "blur(70px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-4xl flex flex-col md:flex-row rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60"
      >
        {/* ── Left panel ── */}
        <div className="bg-black text-white md:w-1/2 relative overflow-hidden min-h-64 md:min-h-0">
          {/* Top-to-black gradient overlay */}
          <div className="w-full h-full z-10 absolute bg-linear-to-t from-transparent to-black pointer-events-none" />

          {/* Vertical stripe bars */}
          <div className="flex absolute z-10 overflow-hidden backdrop-blur-2xl pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-160 w-16 bg-linear-90 from-[#ffffff00] via-[#000000] via-69% to-[#ffffff30] opacity-30 overflow-hidden" />
            ))}
          </div>

          {/* Orange blob */}
          <div className="w-60 h-60 bg-orange-500 absolute z-0 rounded-full -bottom-10 -left-10" />
          {/* White ellipses */}
          <div className="w-32 h-20 bg-white absolute z-0 rounded-full bottom-0 left-4 opacity-60" />
          <div className="w-24 h-16 bg-white/40 absolute z-0 rounded-full bottom-0 left-20" />

          {/* Text — top-left, stays fixed */}
          <div className="relative z-20 p-8 md:p-12">
            <button onClick={() => router.push("/")} className="flex items-center gap-2.5 w-fit hover:opacity-80 transition-opacity mb-8">
              <SiriOrb size={26} animationDuration={16}
                colors={{ c1: "oklch(72% 0.22 35)", c2: "oklch(62% 0.16 45)", c3: "oklch(48% 0.04 0)" }} />
              <span className="text-white font-semibold tracking-wide text-sm">Veritas</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight">
              Know who you're walking<br />into a room with.
            </h1>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="md:w-1/2 bg-white/5 backdrop-blur-xl px-10 py-14 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {mode === "signup" ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-gray-500 text-sm mt-1 mb-8">
                {mode === "signup"
                  ? "Start surfacing intelligence in minutes."
                  : "Sign in to continue your research."}
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 flex-1">
                {mode === "signup" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-orange-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-2xl bg-white/8 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-orange-500/50"
                    />
                  </div>
                )}
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-2xl bg-white/8 border px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors
                      ${emailError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-orange-500/50"}`}
                  />
                  {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-2xl bg-white/8 border px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors
                      ${passwordError ? "border-red-500/60 focus:border-red-500" : "border-white/10 focus:border-orange-500/50"}`}
                  />
                  {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-2xl transition-colors text-sm mt-2"
                >
                  {isSubmitting
                    ? mode === "signup"
                      ? "Creating account..."
                      : "Signing in..."
                    : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                </button>

                {statusMessage && (
                  <p className="text-center text-sm text-orange-300">{statusMessage}</p>
                )}

                {/* Switch mode */}
                <p className="text-center text-sm text-gray-500 mt-auto pt-4">
                  {mode === "signup" ? "Already have an account?" : "Don&apos;t have an account?"}{" "}
                  <button type="button" onClick={switchMode} className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                    {mode === "signup" ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
