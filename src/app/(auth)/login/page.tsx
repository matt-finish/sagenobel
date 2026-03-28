import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Sage Nobel
        </h1>
        <p className="text-foreground-muted mt-2">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
