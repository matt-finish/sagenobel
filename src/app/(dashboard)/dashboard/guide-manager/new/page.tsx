import { GuideEditorForm } from "@/components/guides/guide-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Guide",
};

export default function NewGuidePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Create New Guide</h2>
      <GuideEditorForm />
    </div>
  );
}
