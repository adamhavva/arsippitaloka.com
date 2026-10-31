"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  MonitorPlay as YoutubeIcon,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Columns3,
  Rows3,
  Trash2,
} from "lucide-react";
import { fileToDataUrl, FileTooLargeError } from "@/lib/file-to-data-url";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        strike: false,
        codeBlock: false,
        code: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: true } }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg" },
      }),
      Youtube.configure({
        nocookie: true,
        HTMLAttributes: { class: "rounded-lg" },
      }),
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      // Paste gambar dari clipboard → sisipkan sebagai data URL base64.
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        const images = files.filter((f) => f.type.startsWith("image/"));
        if (images.length === 0) return false;
        event.preventDefault();
        void (async () => {
          for (const file of images) {
            try {
              const src = await fileToDataUrl(file);
              editor?.chain().focus().setImage({ src }).run();
            } catch (err) {
              window.alert(
                err instanceof FileTooLargeError
                  ? err.message
                  : "Gagal menempel gambar.",
              );
            }
          }
        })();
        return true;
      },
    },
  });

  return (
    <div>
      {!hideLabel ? (
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      ) : null}
      <input type="hidden" name={name} value={html} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file || !editor) return;
          try {
            const src = await fileToDataUrl(file);
            editor.chain().focus().setImage({ src }).run();
          } catch (err) {
            window.alert(
              err instanceof FileTooLargeError ? err.message : "Gagal memuat gambar.",
            );
          }
        }}
      />
      <div className="overflow-hidden rounded-lg border border-neutral-300 focus-within:border-maroon">
        <Toolbar
          editor={editor}
          onPickImage={() => fileInputRef.current?.click()}
        />
        <EditorContent
          editor={editor}
          className="prose-sm max-w-none px-3 py-2 text-sm [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-maroon [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_iframe]:my-2 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_hr]:my-4 [&_hr]:border-neutral-300 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_.selectedCell]:bg-maroon/10"
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

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor | null;
  onPickImage: () => void;
}) {
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

  function addYoutube() {
    if (!editor) return;
    const url = window.prompt("URL video YouTube");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  const inTable = editor.isActive("table");

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
      <ToolbarButton label="Gambar" onClick={onPickImage}>
        <ImageIcon size={15} />
      </ToolbarButton>
      <ToolbarButton label="Video YouTube" onClick={addYoutube}>
        <YoutubeIcon size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-neutral-300" aria-hidden />

      <ToolbarButton
        label="Kutipan"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Garis pemisah"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-neutral-300" aria-hidden />

      <ToolbarButton
        label="Rata kiri"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Rata tengah"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Rata kanan"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-neutral-300" aria-hidden />

      <ToolbarButton
        label="Sisip tabel"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon size={15} />
      </ToolbarButton>

      {inTable ? (
        <>
          <ToolbarButton
            label="Tambah kolom"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <span className="flex items-center text-[11px]">
              <Columns3 size={15} />+
            </span>
          </ToolbarButton>
          <ToolbarButton
            label="Hapus kolom"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <span className="flex items-center text-[11px]">
              <Columns3 size={15} />−
            </span>
          </ToolbarButton>
          <ToolbarButton
            label="Tambah baris"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <span className="flex items-center text-[11px]">
              <Rows3 size={15} />+
            </span>
          </ToolbarButton>
          <ToolbarButton
            label="Hapus baris"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <span className="flex items-center text-[11px]">
              <Rows3 size={15} />−
            </span>
          </ToolbarButton>
          <ToolbarButton
            label="Hapus tabel"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 size={15} />
          </ToolbarButton>
        </>
      ) : null}
    </div>
  );
}
