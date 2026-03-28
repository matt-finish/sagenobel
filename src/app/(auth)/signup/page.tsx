import { SignUpForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Sage Nobel
        </h1>
        <p className="text-foreground-muted mt-2">
          Create your account
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
