import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TiptapRenderer } from "@/components/blog/tiptap-renderer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import type { Metadata } from "next";
import type { JSONContent } from "@tiptap/react";
import { requireSection } from "@/lib/check-section";

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">
): Promise<Metadata> {
  await requireSection("blog");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">
) {
  await requireSection("blog");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-sage transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Blog
      </Link>

      {post.cover_image_url && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <header className="mb-10">
        <p className="text-xs text-foreground-muted uppercase tracking-wider mb-4">
          {new Date(post.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground leading-[1.15]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-foreground-muted mt-5 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <div className="decorative-line mt-8" />
      </header>

      <div className="border-t border-border pt-8">
        <TiptapRenderer content={post.content as JSONContent} />
      </div>

      <div className="mt-12 bg-sage/5 border border-sage/10 rounded-2xl p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Enjoyed this post?
        </h3>
        <p className="text-sm text-foreground-muted mt-1 mb-5">
          Subscribe for more tips, guides, and inspiration.
        </p>
        <NewsletterForm variant="inline" />
      </div>
    </article>
  );
}
