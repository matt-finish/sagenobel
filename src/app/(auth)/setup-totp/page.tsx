import { SetupTotpForm } from "@/components/auth/setup-totp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set Up Two-Factor Authentication",
};

export default function SetupTotpPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Set Up 2FA
        </h1>
        <p className="text-foreground-muted mt-2">
          Scan the QR code with your authenticator app to secure your admin
          account.
        </p>
      </div>
      <SetupTotpForm />
    </div>
  );
}
