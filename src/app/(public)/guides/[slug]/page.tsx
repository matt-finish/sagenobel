import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TiptapRenderer } from "@/components/blog/tiptap-renderer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import type { Metadata } from "next";
import type { JSONContent } from "@tiptap/react";
import { requireSection } from "@/lib/check-section";

export async function generateMetadata(
  props: PageProps<"/guides/[slug]">
): Promise<Metadata> {
  await requireSection("guides");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: guide } = await supabase
    .from("free_guides")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!guide) return { title: "Guide Not Found" };

  return {
    title: guide.title,
    description: guide.description || undefined,
  };
}

export default async function GuidePage(
  props: PageProps<"/guides/[slug]">
) {
  await requireSection("guides");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: guide } = await supabase
    .from("free_guides")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!guide) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/guides"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-sage transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Guides
      </Link>

      {guide.cover_image_url && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={guide.cover_image_url}
            alt={guide.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-8">
        <span className="text-xs font-medium bg-sage/10 text-sage px-2.5 py-1 rounded-full">
          {guide.guide_type === "download" ? "Downloadable Guide" : "Article"}
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight mt-4">
          {guide.title}
        </h1>
        {guide.description && (
          <p className="text-lg text-foreground-muted mt-4 leading-relaxed">
            {guide.description}
          </p>
        )}
      </header>

      {guide.guide_type === "download" && (() => {
        const files = (guide.files as { url: string; name: string }[]) || [];
        const hasFiles = files.length > 0;
        const hasLegacy = !hasFiles && guide.file_url;
        if (!hasFiles && !hasLegacy) return null;
        return (
          <div className="bg-sage/5 border border-sage/20 rounded-xl p-6 mb-8">
            {hasFiles ? (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg bg-sage/10 px-4 py-3 text-sage font-medium hover:bg-sage/20 transition-colors"
                  >
                    <Download size={16} className="flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <a
                  href={guide.file_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-sage px-6 py-3 text-white font-medium hover:bg-sage-dark transition-colors"
                >
                  <Download size={18} />
                  Download Guide
                </a>
              </div>
            )}
          </div>
        );
      })()}

      {guide.guide_type === "article" && guide.content && (
        <div className="border-t border-border pt-8">
          <TiptapRenderer content={guide.content as JSONContent} />
        </div>
      )}
    </div>
  );
}
