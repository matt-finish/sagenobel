import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Library",
};

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Media Library</h2>
      <div className="bg-background rounded-xl border border-border p-8">
        <p className="text-foreground-muted text-sm">
          The media library allows you to manage uploaded images and files. Connect your Supabase
          Storage buckets to enable file uploads.
        </p>
        <div className="mt-4 p-4 bg-background-alt rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">Setup Required</h3>
          <p className="text-xs text-foreground-muted">
            Create the following storage buckets in your Supabase project:
          </p>
          <ul className="text-xs text-foreground-muted mt-2 space-y-1">
            <li>&bull; <code className="bg-border/50 px-1 rounded">blog-images</code> (public)</li>
            <li>&bull; <code className="bg-border/50 px-1 rounded">product-images</code> (public)</li>
            <li>&bull; <code className="bg-border/50 px-1 rounded">guide-files</code> (private)</li>
            <li>&bull; <code className="bg-border/50 px-1 rounded">guide-covers</code> (public)</li>
            <li>&bull; <code className="bg-border/50 px-1 rounded">site-assets</code> (public)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
