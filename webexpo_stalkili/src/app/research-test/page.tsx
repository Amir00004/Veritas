"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const API_BASE = "http://localhost:8000";
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 40;
const EXAMPLE_PROFESSORS = [
  "Yann LeCun",
  "Yoshua Bengio",
  "Geoffrey Hinton",
  "Andrew Ng",
];

type FitScore = {
  total_score: number;
  max_score: number;
  breakdown: Record<string, number>;
  explanation: string;
};

type ProfessorPayload = {
  id?: number;
  full_name?: string;
  university?: string;
  department?: string;
  research_areas?: string[];
  h_index?: number | null;
  total_citations?: number | null;
  recent_papers?: Array<{ title?: string; year?: number; citations?: number }>;
  profile_urls?: Record<string, string>;
  email?: string | null;
  profile_data?: Record<string, unknown>;
  fit_score?: number;
  last_scraped?: string;
  updated_at?: string;
};

type ResearchSuccess = {
  status: "success";
  source?: "cache";
  professor: ProfessorPayload;
  fit_score: FitScore;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getScoreColor(score: number) {
  if (score > 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-300";
  return "text-rose-400";
}

export default function ResearchTestPage() {
  // Auth state
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("demo@veritas.ai");
  const [password, setPassword] = useState("DemoPass123!");
  const [confirmPassword, setConfirmPassword] = useState("DemoPass123!");
  const [firstName, setFirstName] = useState("Demo");
  const [lastName, setLastName] = useState("User");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Research state
  const [professorName, setProfessorName] = useState("");
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [result, setResult] = useState<ResearchSuccess | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Shared UI state
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    const storedAccess = localStorage.getItem("veritas_access_token") ?? "";
    const storedRefresh = localStorage.getItem("veritas_refresh_token") ?? "";
    const storedEmail = localStorage.getItem("veritas_email") ?? "";

    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
    if (storedEmail) setLoggedInEmail(storedEmail);
  }, []);

  const isLoggedIn = useMemo(() => Boolean(accessToken), [accessToken]);

  async function signup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const firstError = Object.values(data ?? {})[0];
        const message =
          typeof firstError === "string"
            ? firstError
            : Array.isArray(firstError)
              ? String(firstError[0])
              : "Signup failed.";
        throw new Error(message);
      }

      setSuccessMessage("Signup successful. You can now login.");
      setAuthMode("login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected signup error.";
      setError(message);
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsAuthLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Login failed. Check credentials.");
      }

      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      setLoggedInEmail(email);
      localStorage.setItem("veritas_access_token", data.access);
      localStorage.setItem("veritas_refresh_token", data.refresh);
      localStorage.setItem("veritas_email", email);
      setSuccessMessage("Login successful.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected login error.";
      setError(message);
    } finally {
      setIsAuthLoading(false);
    }
  }

  function logout() {
    setAccessToken("");
    setRefreshToken("");
    setLoggedInEmail("");
    setResult(null);
    setProfessorName("");
    setPollAttempts(0);
    setLoadingMessage("");
    setSuccessMessage("Logged out.");
    setError("");
    localStorage.removeItem("veritas_access_token");
    localStorage.removeItem("veritas_refresh_token");
    localStorage.removeItem("veritas_email");
  }

  async function pollTask(taskId: string, targetProfessorName: string) {
    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
      setPollAttempts(attempt);
      setLoadingMessage(
        `Gathering latest information about ${targetProfessorName}... (attempt ${attempt}/${MAX_POLL_ATTEMPTS})`,
      );

      await sleep(POLL_INTERVAL_MS);

      const response = await apiRequest(`/api/research/task/${taskId}/`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Token is invalid or expired. Please login again.");
      }

      if (data?.status === "processing") {
        continue;
      }

      if (data?.status === "success") {
        return data as ResearchSuccess;
      }

      if (data?.status === "failed") {
        throw new Error(data?.error || "Background task failed.");
      }

      throw new Error("Unexpected polling response format.");
    }

    throw new Error("Polling timed out. Please try again.");
  }

  async function researchProfessor(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setResult(null);
    setPollAttempts(0);

    if (!isLoggedIn) {
      setError("Please login first.");
      return;
    }
    if (!professorName.trim()) {
      setError("Please enter a professor name.");
      return;
    }

    setIsResearchLoading(true);
    setLoadingMessage(`Gathering latest information about ${professorName.trim()}...`);

    try {
      const response = await apiRequest("/api/research/professor/", {
        method: "POST",
        body: JSON.stringify({ professor_name: professorName.trim() }),
      });
      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Token is invalid or expired. Please login again.");
      }
      if (!response.ok && data?.status !== "processing") {
        throw new Error(data?.message || data?.detail || "Research request failed.");
      }

      if (data?.status === "success") {
        setResult(data as ResearchSuccess);
        setSuccessMessage("Professor found from cache.");
        return;
      }

      if (data?.status === "processing" && data?.task_id) {
        const finalResult = await pollTask(data.task_id, professorName.trim());
        setResult(finalResult);
        setSuccessMessage("Research completed.");
        return;
      }

      throw new Error("Unexpected response from research endpoint.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected research error.";
      setError(message);
    } finally {
      setLoadingMessage("");
      setIsResearchLoading(false);
    }
  }

  const fitScore = result?.fit_score?.total_score ?? 0;
  const scoreColor = getScoreColor(fitScore);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Veritas Research Test</h1>
        <p className="mt-2 text-sm text-gray-400">
          End-to-end testing page for JWT auth, professor research, and Celery task polling.
        </p>

        {/* Authentication section */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">1) Authentication</h2>
          {!isLoggedIn ? (
            <>
              <div className="mt-4 inline-flex rounded-lg border border-white/10 bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    authMode === "login" ? "bg-orange-500 text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    authMode === "signup" ? "bg-orange-500 text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  Signup
                </button>
              </div>

              {authMode === "login" ? (
                <form onSubmit={login} className="mt-4 grid gap-4 md:grid-cols-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAuthLoading ? "Logging in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form onSubmit={signup} className="mt-4 grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 8 chars)"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400 md:col-span-2"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
                  >
                    {isAuthLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-300">
                Logged in as <span className="font-semibold">{loggedInEmail}</span>
              </p>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          )}
          {refreshToken && (
            <p className="mt-3 text-xs text-gray-500">
              Refresh token stored for optional silent token refresh.
            </p>
          )}
        </section>

        {/* Research section */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">2) Professor Research</h2>
          <form onSubmit={researchProfessor} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                placeholder="Enter professor name"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-orange-400"
              />
              <button
                type="submit"
                disabled={isResearchLoading}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResearchLoading ? "Researching..." : "Research Professor"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROFESSORS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setProfessorName(name)}
                  className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-gray-200 transition hover:border-orange-400 hover:text-white"
                >
                  {name}
                </button>
              ))}
            </div>
          </form>
        </section>

        {/* Global messages */}
        {(loadingMessage || error || successMessage) && (
          <section className="mt-6 space-y-3">
            {loadingMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-200">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
                <span>
                  {loadingMessage}
                  {pollAttempts > 0 ? ` (polling)` : ""}
                </span>
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                {successMessage}
              </div>
            )}
          </section>
        )}

        {/* Result section */}
        {result && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">
                  {result.professor.full_name || "Unknown Professor"}
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  {result.professor.university || "Unknown University"}
                  {result.professor.department ? ` · ${result.professor.department}` : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-gray-400">Fit Score</p>
                <p className={`mt-1 text-4xl font-bold ${scoreColor}`}>
                  {fitScore}/{result.fit_score.max_score}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(result.fit_score.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {key.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-medium text-gray-200">Explanation</p>
              <p className="mt-1 text-sm text-gray-300">{result.fit_score.explanation}</p>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm font-medium text-gray-200">Recent Papers</p>
              {result.professor.recent_papers?.length ? (
                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                  {result.professor.recent_papers.map((paper, index) => (
                    <li key={`${paper.title ?? "paper"}-${index}`} className="rounded-lg bg-white/5 p-2">
                      <p className="font-medium text-white">{paper.title || "Untitled paper"}</p>
                      <p className="text-xs text-gray-400">
                        Year: {paper.year ?? "N/A"} · Citations: {paper.citations ?? "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-400">No recent papers available.</p>
              )}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowRaw((prev) => !prev)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 transition hover:bg-white/10"
              >
                {showRaw ? "Hide Raw Data" : "Show Raw Data"}
              </button>
              {showRaw && (
                <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 text-xs text-gray-200">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
