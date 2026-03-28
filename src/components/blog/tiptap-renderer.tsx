import { generateHTML } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";

export function TiptapRenderer({ content }: { content: JSONContent }) {
  if (!content || Object.keys(content).length === 0) {
    return <p className="text-foreground-muted">No content.</p>;
  }

  const html = generateHTML(content, [
    StarterKit,
    ImageExtension,
    LinkExtension,
  ]);

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground-muted prose-a:text-sage prose-img:rounded-lg prose-blockquote:border-sage"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
