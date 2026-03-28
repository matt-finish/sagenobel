import { VerifyTotpForm } from "@/components/auth/verify-totp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Two-Factor Authentication",
};

export default function VerifyTotpPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Two-Factor Verification
        </h1>
        <p className="text-foreground-muted mt-2">
          Enter the code from your authenticator app.
        </p>
      </div>
      <VerifyTotpForm />
    </div>
  );
}
