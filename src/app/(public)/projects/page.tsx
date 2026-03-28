import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, description, cover_image_url")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">Projects</h1>
      <p className="text-foreground-muted mb-8">Explore our curated projects — get guides, watch tutorials, shop products, and share your results.</p>

      {!projects || projects.length === 0 ? (
        <div className="bg-background-alt rounded-2xl p-12 text-center">
          <p className="text-foreground-muted">Projects coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.id} href={`/projects/${project.slug}`}
              className="group bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              {project.cover_image_url ? (
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={project.cover_image_url} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-background-alt flex items-center justify-center">
                  <span className="text-foreground-muted/20 text-4xl font-serif">SN</span>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-sage transition-colors">{project.title}</h2>
                {project.description && <p className="text-sm text-foreground-muted mt-1 line-clamp-2">{project.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
