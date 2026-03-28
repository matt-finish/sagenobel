"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
}

export function ProjectOrderForm({ projectId, fields }: { projectId: string; fields: FormField[] }) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("project_submissions").insert({
      project_id: projectId,
      submitter_name: name,
      submitter_email: email,
      form_data: formData,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-success bg-success/10 rounded-xl p-4">
        <Check size={18} />
        <p className="text-sm font-medium">Your order has been submitted! We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-background rounded-xl border border-border p-6">
      {error && <div className="bg-error/10 text-error text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name <span className="text-error">*</span></label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email <span className="text-error">*</span></label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" placeholder="your@email.com" />
        </div>
      </div>

      {fields.map(field => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {field.label} {field.required && <span className="text-error">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea value={formData[field.label] || ""} onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
              required={field.required} rows={3}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage resize-none" />
          ) : field.type === "dropdown" ? (
            <select value={formData[field.label] || ""} onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
              required={field.required}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage">
              <option value="">Select...</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
              value={formData[field.label] || ""} onChange={e => setFormData({ ...formData, [field.label]: e.target.value })}
              required={field.required}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground placeholder:text-foreground-muted/50 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage" />
          )}
        </div>
      ))}

      <button type="submit" disabled={submitting}
        className="rounded-lg bg-sage px-6 py-2.5 text-white font-medium hover:bg-sage-dark transition-colors disabled:opacity-50">
        {submitting ? "Submitting..." : "Submit Order"}
      </button>
    </form>
  );
}
