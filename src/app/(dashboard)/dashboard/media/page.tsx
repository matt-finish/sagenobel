import { createClient } from "@/lib/supabase/server";
import { MediaLibrary } from "@/components/media/media-library";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Library",
};

const buckets = [
  { name: "product-images", label: "Product Images" },
  { name: "blog-images", label: "Blog Images" },
  { name: "guide-covers", label: "Guide Covers" },
  { name: "site-assets", label: "Site Assets" },
];

export default async function MediaPage() {
  const supabase = await createClient();

  const bucketFiles: Record<string, { name: string; url: string }[]> = {};

  for (const bucket of buckets) {
    const { data: files } = await supabase.storage
      .from(bucket.name)
      .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (files) {
      // List nested files too (e.g. products/ subfolder)
      const allFiles: { name: string; url: string }[] = [];

      for (const file of files) {
        if (file.id) {
          const { data } = supabase.storage.from(bucket.name).getPublicUrl(file.name);
          allFiles.push({ name: file.name, url: data.publicUrl });
        } else {
          // It's a folder — list its contents
          const { data: nested } = await supabase.storage
            .from(bucket.name)
            .list(file.name, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

          if (nested) {
            for (const nestedFile of nested) {
              if (nestedFile.id) {
                const path = `${file.name}/${nestedFile.name}`;
                const { data } = supabase.storage.from(bucket.name).getPublicUrl(path);
                allFiles.push({ name: path, url: data.publicUrl });
              }
            }
          }
        }
      }

      bucketFiles[bucket.name] = allFiles;
    } else {
      bucketFiles[bucket.name] = [];
    }
  }

  return <MediaLibrary buckets={buckets} bucketFiles={bucketFiles} />;
}
