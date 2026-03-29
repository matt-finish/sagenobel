import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Star } from "lucide-react";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectReviewForm } from "@/components/projects/project-review-form";
import { ProjectOrderForm } from "@/components/projects/project-order-form";
import type { Metadata } from "next";
import { requireSection } from "@/lib/check-section";

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  await requireSection("projects");
  const { slug } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("title, description").eq("slug", slug).eq("is_published", true).single();
  if (!data) return { title: "Project Not Found" };
  return { title: data.title, description: data.description || undefined };
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  await requireSection("projects");
  const { slug } = await props.params;
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("*").eq("slug", slug).eq("is_published", true).single();
  if (!project) notFound();

  const galleryImages = project.gallery_images as string[];
  const videoUrls = project.video_urls as string[];
  const productLinks = project.product_links as { label: string; url: string }[];
  const guideIds = project.guide_ids as string[];
  const orderFormFields = project.order_form_fields as { id: string; label: string; type: string; required: boolean; options: string[] }[];

  // Fetch linked guides
  let guides: { id: string; title: string; slug: string; guide_type: string }[] = [];
  if (project.show_guides && guideIds.length > 0) {
    const { data } = await supabase.from("free_guides").select("id, title, slug, guide_type").in("id", guideIds).eq("is_published", true);
    guides = data || [];
  }

  // Fetch approved reviews
  let reviews: { id: string; reviewer_name: string; rating: number | null; comment: string | null; images: string[]; created_at: string }[] = [];
  if (project.show_reviews) {
    const { data } = await supabase.from("project_reviews").select("id, reviewer_name, rating, comment, images, created_at").eq("project_id", project.id).eq("is_approved", true).order("created_at", { ascending: false });
    reviews = (data || []) as typeof reviews;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-sage transition-colors mb-8">
        <ArrowLeft size={16} />Back to Projects
      </Link>

      {/* Header */}
      {project.cover_image_url && (
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-8">
          <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" priority />
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground">{project.title}</h1>
      {project.description && <p className="text-lg text-foreground-muted mt-3 leading-relaxed">{project.description}</p>}

      {/* Gallery */}
      {project.show_gallery && galleryImages.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Gallery</h2>
          <ProjectGallery images={galleryImages} />
        </section>
      )}

      {/* Videos */}
      {project.show_videos && videoUrls.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoUrls.map((url, i) => {
              const embedUrl = getEmbedUrl(url);
              return embedUrl ? (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              ) : (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 bg-background-alt rounded-lg text-sm text-sage hover:text-sage-dark">
                  <ExternalLink size={14} />Watch Video
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Guides */}
      {project.show_guides && guides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Free Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guides.map(guide => (
              <Link key={guide.id} href={`/guides/${guide.slug}`}
                className="flex items-center gap-3 px-4 py-3 bg-sage/5 border border-sage/10 rounded-xl hover:bg-sage/10 transition-colors">
                <Download size={18} className="text-sage flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{guide.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Links */}
      {project.show_products && productLinks.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">Shop</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 bg-background rounded-xl border border-border hover:border-sage transition-colors group">
                <span className="text-sm font-medium text-foreground group-hover:text-sage">{link.label}</span>
                <ExternalLink size={14} className="text-foreground-muted group-hover:text-sage" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Order Form */}
      {project.show_order_form && orderFormFields.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Place an Order</h2>
          {project.order_form_instructions && (
            <p className="text-sm text-foreground-muted mb-4">{project.order_form_instructions}</p>
          )}
          <ProjectOrderForm projectId={project.id} fields={orderFormFields} />
        </section>
      )}

      {/* Reviews */}
      {project.show_reviews && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Reviews {reviews.length > 0 && <span className="text-foreground-muted text-base font-normal">({reviews.length})</span>}
          </h2>

          {reviews.length > 0 && (
            <div className="space-y-4 mb-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-background rounded-xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">{review.reviewer_name}</span>
                    {review.rating && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={12} className="text-accent fill-accent" />
                        ))}
                      </span>
                    )}
                    <span className="text-xs text-foreground-muted ml-auto">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-sm text-foreground-muted">{review.comment}</p>}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                          <Image src={img} alt={`Review image ${i + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="bg-background-alt rounded-xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Share Your Results</h3>
            <ProjectReviewForm projectId={project.id} />
          </div>
        </section>
      )}
    </div>
  );
}
