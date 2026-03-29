import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PageSearch } from "@/components/shared/page-search";
import type { Metadata } from "next";
import { requireSection } from "@/lib/check-section";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSection("projects");
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const supabase = await createClient();

  let dbQuery = supabase
    .from("projects")
    .select("id, title, slug, description, cover_image_url")
    .eq("is_published", true);

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data: projects } = await dbQuery.order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-center gap-4 mb-4">
        <div className="decorative-line" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-foreground-muted">
          Showcase
        </span>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mb-3">
        Projects
      </h1>
      <p className="text-foreground-muted text-lg mb-8 max-w-2xl">
        Explore our curated projects — get guides, watch tutorials, shop products, and share your results.
      </p>
      <div className="mb-10 max-w-md">
        <PageSearch basePath="/projects" placeholder="Search projects..." />
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-16 text-center">
          <p className="font-serif text-foreground-muted/30 text-6xl italic mb-4">SN</p>
          <p className="text-foreground-muted">Projects coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <Link key={project.id} href={`/projects/${project.slug}`}
              className="group">
              {project.cover_image_url ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 image-hover">
                  <Image src={project.cover_image_url} alt={project.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-[4/3] rounded-xl bg-background-alt flex items-center justify-center mb-5 image-hover border border-border">
                  <span className="font-serif text-foreground-muted/10 text-6xl italic">SN</span>
                </div>
              )}
              <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-sage transition-colors duration-300 leading-snug">{project.title}</h2>
              {project.description && <p className="text-sm text-foreground-muted mt-2 line-clamp-2 leading-relaxed">{project.description}</p>}
              <span className="inline-flex items-center gap-1 text-sm text-sage font-medium mt-3 link-underline">
                Explore
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
