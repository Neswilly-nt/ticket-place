"use client";

import { useAuth } from "@/context/AuthContext";
import { twoFactorService } from "@/lib/services/twoFactor";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Step = "idle" | "setup" | "verify-disable";

export default function SecuritySettingsPage() {
  const { user, initialized, refreshTwoFactor } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("idle");
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialized && !user) router.push("/login");
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await twoFactorService.setup();
      setSecret(res.data.secret);
      setQrUri(res.data.qrUri);
      setStep("setup");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      await twoFactorService.enable(code);
      refreshTwoFactor(true);
      setSuccess("Authentification à 2 facteurs activée avec succès !");
      setStep("idle");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (code: string) => {
    setError("");
    setLoading(true);
    try {
      await twoFactorService.disable(code);
      refreshTwoFactor(false);
      setSuccess("Authentification à 2 facteurs désactivée.");
      setStep("idle");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = user.twoFactorEnabled;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 px-4 py-8 sm:px-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
          Sécurité du compte
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Gérez l&apos;authentification à deux facteurs pour protéger votre compte.
        </p>

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* 2FA Status card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-zinc-100 dark:bg-zinc-700"}`}>
                <svg className={`w-5 h-5 ${isEnabled ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Authentification à 2 facteurs
                </p>
                <p className={`text-xs font-medium ${isEnabled ? "text-green-600 dark:text-green-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {isEnabled ? "Activée" : "Désactivée"}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isEnabled ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"}`}>
              {isEnabled ? "ACTIF" : "INACTIF"}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Ajoutez une couche de sécurité supplémentaire en demandant un code de votre application d&apos;authentification à chaque connexion (Google Authenticator, Authy…).
          </p>
          {step === "idle" && (
            <button
              onClick={() => { setError(""); setSuccess(""); isEnabled ? setStep("verify-disable") : handleSetup(); }}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                isEnabled
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Chargement…
                </span>
              ) : isEnabled ? "Désactiver" : "Activer"}
            </button>
          )}
        </div>

        {/* Setup step — QR code */}
        {step === "setup" && (
          <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                1. Scannez le QR code
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ouvrez Google Authenticator, Authy ou toute autre application compatible TOTP et scannez ce code.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-white border border-zinc-200 dark:border-zinc-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUri)}`}
                  alt="QR Code 2FA"
                  width={180}
                  height={180}
                  className="rounded"
                />
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 px-4 py-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Ou entrez ce code manuellement :</p>
              <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white tracking-widest break-all">{secret}</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
                2. Entrez le code de vérification
              </h2>
              <EnableOtp onComplete={handleEnable} loading={loading} error={error} />
            </div>
            <button
              onClick={() => { setStep("idle"); setError(""); }}
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Disable step — verify code */}
        {step === "verify-disable" && (
          <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Confirmez avec votre code 2FA
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Entrez le code actuel de votre application pour désactiver la 2FA.
            </p>
            <EnableOtp onComplete={handleDisable} loading={loading} error={error} />
            <button
              onClick={() => { setStep("idle"); setError(""); }}
              className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EnableOtp({ onComplete, loading, error }: { onComplete: (code: string) => void; loading: boolean; error: string }) {
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
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { setDigits(pasted.split("")); onComplete(pasted); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={loading}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors disabled:opacity-50"
          />
        ))}
      </div>
      {loading && (
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
