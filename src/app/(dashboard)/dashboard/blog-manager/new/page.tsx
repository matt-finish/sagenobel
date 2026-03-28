import { BlogEditorForm } from "@/components/blog/blog-editor-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Blog Post",
};

export default function NewBlogPostPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">
        Create New Blog Post
      </h2>
      <BlogEditorForm />
    </div>
  );
}
