"use client";

import { useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services/auth";
import { twoFactorService } from "@/lib/services/twoFactor";
import { useAuth } from "@/context/AuthContext";

function OtpInput({ onComplete }: { onComplete: (code: string) => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      onComplete(pasted);
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
        />
      ))}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/events";
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login(form);
      if (res.data.twoFactorRequired) {
        setPendingEmail(res.data.email);
        setTwoFactorPending(true);
      } else {
        login(res.data);
        router.push(redirect);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await twoFactorService.verify(pendingEmail, code);
      login(res.data);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  if (twoFactorPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
            Vérification 2FA
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Entrez le code à 6 chiffres de votre application d&apos;authentification
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <OtpInput onComplete={handleOtpComplete} />

          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <button
            onClick={() => { setTwoFactorPending(false); setError(""); }}
            className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Connexion
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
          Accédez à votre compte Ticket Place
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 dark:text-white hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
