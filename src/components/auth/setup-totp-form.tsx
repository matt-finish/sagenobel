"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function SetupTotpForm() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEnroll() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Sage Nobel Admin",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setError(null);

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (!qrCode) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
        <p className="text-sm text-foreground-muted">
          As an admin, you need to set up two-factor authentication. Click the
          button below to generate a QR code for your authenticator app.
        </p>
        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full rounded-lg bg-sage px-4 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate QR Code"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      {error && (
        <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div className="flex justify-center">
        <Image
          src={qrCode}
          alt="TOTP QR Code"
          width={200}
          height={200}
          className="rounded-lg"
          unoptimized
        />
      </div>
      <p className="text-sm text-foreground-muted text-center">
        Scan this QR code with your authenticator app, then enter the
        verification code below.
      </p>
      <div>
        <label
          htmlFor="code"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Verification Code
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground text-center text-lg tracking-widest placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
          placeholder="000000"
          autoComplete="one-time-code"
        />
      </div>
      <button
        type="submit"
        disabled={loading || verifyCode.length !== 6}
        className="w-full rounded-lg bg-sage px-4 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying..." : "Verify & Complete Setup"}
      </button>
    </form>
  );
}
