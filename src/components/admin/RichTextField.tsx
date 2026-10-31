"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, LinkIcon } from "lucide-react";

/**
 * Editor teks kaya (Tiptap) untuk field admin — bold/italic/heading/list/link.
 * Mengikuti pola hidden-input TikTokField/IconPicker: nilai HTML disimpan
 * di <input type="hidden"> supaya `saveEntity`/`saveSettings` (yang baca
 * `formData.get(name)`) tidak perlu diubah sama sekali.
 */
export default function RichTextField({
  name,
  label,
  value,
  help,
  hideLabel = false,
}: {
  name: string;
  label: string;
  value?: string | null;
  help?: string;
  hideLabel?: boolean;
}) {
  const [html, setHtml] = useState(value ?? "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        strike: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div>
      {!hideLabel ? (
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      ) : null}
      <input type="hidden" name={name} value={html} />
      <div className="overflow-hidden rounded-lg border border-neutral-300 focus-within:border-maroon">
        <Toolbar editor={editor} />
        <EditorContent
          editor={editor}
          className="prose-sm max-w-none px-3 py-2 text-sm [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-maroon [&_a]:underline"
        />
      </div>
      {help ? <p className="mt-1 text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 aria-pressed:bg-maroon/10 aria-pressed:text-maroon-dark"
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan", previous ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon size={15} />
      </ToolbarButton>
    </div>
  );
}
