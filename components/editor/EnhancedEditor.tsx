"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Undo, Redo,
  Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Minus, Upload, FileCode
} from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function EnhancedEditor({ content, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create lowlight instance with common languages
  const lowlight = createLowlight(common);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default code block
        codeBlock: false,
      }),
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[500px] p-6",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImageURL = () => {
    const url = window.prompt("Enter image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-3 flex flex-wrap gap-2">
        {/* Heading Dropdown */}
        <select
          onChange={(e) => {
            const level = e.target.value;
            if (level === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              setHeading(parseInt(level) as any);
            }
          }}
          className="px-3 py-1.5 border rounded text-sm"
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" :
            editor.isActive("heading", { level: 4 }) ? "4" :
            editor.isActive("heading", { level: 5 }) ? "5" :
            editor.isActive("heading", { level: 6 }) ? "6" : "p"
          }
        >
          <option value="p">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {/* Font Family Dropdown */}
        <select
          onChange={(e) => {
            const font = e.target.value;
            if (font === "default") {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(font).run();
            }
          }}
          className="px-3 py-1.5 border rounded text-sm min-w-[140px]"
          value={editor.getAttributes("textStyle").fontFamily || "default"}
        >
          <option value="default">Default</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="Open Sans, sans-serif">Open Sans</option>
          <option value="Lato, sans-serif">Lato</option>
          <option value="Poppins, sans-serif">Poppins</option>
          <option value="Montserrat, sans-serif">Montserrat</option>
          <option value="Merriweather, serif">Merriweather</option>
          <option value="Playfair Display, serif">Playfair Display</option>
          <option value="Caveat, cursive">Caveat</option>
          <option value="monospace">Monospace</option>
        </select>

        <div className="w-px bg-gray-300" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-300" : ""}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("underline") ? "bg-gray-300" : ""}`}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("strike") ? "bg-gray-300" : ""}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("code") ? "bg-gray-300" : ""}`}
          title="Inline Code"
        >
          <Code size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("codeBlock") ? "bg-gray-300" : ""}`}
          title="Code Block"
        >
          <FileCode size={18} />
        </button>

        <div className="w-px bg-gray-300" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-300" : ""}`}
          title="Left"
        >
          <AlignLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-300" : ""}`}
          title="Center"
        >
          <AlignCenter size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-300" : ""}`}
          title="Right"
        >
          <AlignRight size={18} />
        </button>

        <div className="w-px bg-gray-300" />

        {/* Lists & Quote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-300" : ""}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-300" : ""}`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("blockquote") ? "bg-gray-300" : ""}`}
          title="Quote"
        >
          <Quote size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Horizontal Line"
        >
          <Minus size={18} />
        </button>

        <div className="w-px bg-gray-300" />

        {/* Link & Images */}
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-300" : ""}`}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-gray-200"
          title="Upload Image"
        >
          <Upload size={18} />
        </button>

        <button
          type="button"
          onClick={addImageURL}
          className="p-2 rounded hover:bg-gray-200"
          title="Image from URL"
        >
          <ImageIcon size={18} />
        </button>

        <div className="w-px bg-gray-300" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <Undo size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
