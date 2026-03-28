import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { FileDown, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Guides",
};

export default async function GuidesPage() {
  const supabase = await createClient();

  const { data: guides } = await supabase
    .from("free_guides")
    .select("id, title, slug, description, cover_image_url, guide_type")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
          Resources
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-3">
        Free Guides
      </h1>
      <p className="text-foreground-muted text-lg mb-12 max-w-2xl">
        Resources and guides to help you curate your ideal lifestyle.
      </p>

      {!guides || guides.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">
            Free guides and resources will appear here. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {guide.cover_image_url ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={guide.cover_image_url}
                    alt={guide.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-background-alt flex items-center justify-center">
                  <FileDown size={32} className="text-foreground-muted/20" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium bg-sage/10 text-sage px-2 py-0.5 rounded-full">
                    {guide.guide_type === "download" ? "Download" : "Article"}
                  </span>
                </div>
                <h2 className="font-semibold text-foreground group-hover:text-sage transition-colors">
                  {guide.title}
                </h2>
                {guide.description && (
                  <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                    {guide.description}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-sage font-medium mt-3">
                  {guide.guide_type === "download" ? "Download" : "Read"}
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
