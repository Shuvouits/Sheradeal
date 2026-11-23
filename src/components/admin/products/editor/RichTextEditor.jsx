"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  CodeXml,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  ImagePlus,
  Link2,
  Unlink,
  Upload,
  LoaderCircle,
  X,
} from "lucide-react";

function EditorButton({
  icon: Icon,
  title,
  active = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`sd-rte-btn ${active ? "is-active" : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon size={17} strokeWidth={1.9} />
    </button>
  );
}

function Separator() {
  return <span className="sd-rte-separator" />;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Unable to read image file."));
    };

    reader.onload = () => {
      const image = new window.Image();

      image.onerror = () => {
        reject(new Error("Invalid image file."));
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Image processing is unavailable."));
          return;
        }

        const originalWidth = image.naturalWidth;
        const originalHeight = image.naturalHeight;

        if (!originalWidth || !originalHeight) {
          reject(new Error("Invalid image dimensions."));
          return;
        }

        const maxDimension = 1200;

        const scale = Math.min(
          1,
          maxDimension / Math.max(
            originalWidth,
            originalHeight
          )
        );

        let width = Math.max(
          1,
          Math.round(originalWidth * scale)
        );

        let height = Math.max(
          1,
          Math.round(originalHeight * scale)
        );

        let quality = 0.82;

        for (let attempt = 0; attempt < 15; attempt++) {
          canvas.width = width;
          canvas.height = height;

          context.clearRect(0, 0, width, height);

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          const base64 = canvas.toDataURL(
            "image/webp",
            quality
          );

          if (!base64.startsWith("data:image/webp;base64,")) {
            reject(
              new Error("Your browser does not support WebP encoding.")
            );
            return;
          }

          const encoded = base64.split(",")[1] || "";

          const estimatedSize = Math.ceil(
            encoded.length * 0.75
          );

          if (estimatedSize <= 900 * 1024) {
            resolve(base64);
            return;
          }

          if (quality > 0.5) {
            quality = Math.max(
              0.5,
              quality - 0.1
            );
          } else {
            width = Math.max(
              1,
              Math.round(width * 0.8)
            );

            height = Math.max(
              1,
              Math.round(height * 0.8)
            );

            quality = 0.8;
          }
        }

        reject(
          new Error(
            "Image is too large. Please choose a smaller image."
          )
        );
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write a detailed product description...",
  disabled = false,
}) {
  const [, setVersion] = useState(0);

  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const imageInputRef = useRef(null);
  const imagePositionRef = useRef(null);
  const imageMenuRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },

        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,

          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),

      Image.configure({
        inline: false,
        allowBase64: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),

      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value || "",
    editable: !disabled,

    editorProps: {
      attributes: {
        class: "sd-rte-content",
        spellcheck: "true",
        "aria-label": "Product description editor",
      },
    },

    onUpdate: ({ editor }) => {
      const html = editor.isEmpty
        ? ""
        : editor.getHTML();

      onChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    function refreshToolbar() {
      setVersion((previous) => previous + 1);
    }

    editor.on("selectionUpdate", refreshToolbar);
    editor.on("transaction", refreshToolbar);

    return () => {
      editor.off("selectionUpdate", refreshToolbar);
      editor.off("transaction", refreshToolbar);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;

    const incoming = value || "";

    const current = editor.isEmpty
      ? ""
      : editor.getHTML();

    if (incoming !== current) {
      editor.commands.setContent(incoming, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        imageMenuRef.current &&
        !imageMenuRef.current.contains(event.target)
      ) {
        setImageMenuOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
    };
  }, []);

  function insertLink() {
    if (!editor || disabled) return;

    const existing = editor.getAttributes("link").href || "";

    const input = window.prompt(
      "Enter link URL:",
      existing || "https://"
    );

    if (input === null) return;

    const url = input.trim();

    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    if (!isValidUrl(url)) {
      window.alert("Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  function saveImagePosition() {
    if (!editor) return;

    imagePositionRef.current = editor.state.selection.from;
  }

  function insertImageAtSavedPosition(src, alt) {
    if (!editor) return;

    const maxPosition = editor.state.doc.content.size;

    const position = Math.max(
      0,
      Math.min(
        imagePositionRef.current ??
          editor.state.selection.from,
        maxPosition
      )
    );

    editor
      .chain()
      .focus()
      .insertContentAt(
        position,
        {
          type: "image",
          attrs: {
            src,
            alt,
          },
        },
        {
          updateSelection: true,
        }
      )
      .run();

    imagePositionRef.current = null;
  }

  function openImagePicker() {
    if (!editor || disabled || processingImage) return;

    setImageMenuOpen(false);
    setImageError("");

    imageInputRef.current?.click();
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !editor || disabled) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!supportedTypes.includes(file.type)) {
      setImageError(
        "Only JPG, PNG and WEBP images are supported."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError(
        "Image file must be smaller than 10 MB."
      );
      return;
    }

    setProcessingImage(true);
    setImageError("");

    try {
      const base64 = await compressImage(file);

      const alt = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ");

      insertImageAtSavedPosition(base64, alt);
    } catch (error) {
      setImageError(
        error.message || "Unable to insert image."
      );
    } finally {
      setProcessingImage(false);
    }
  }

  function insertImageUrl() {
    if (!editor || disabled) return;

    setImageMenuOpen(false);
    setImageError("");

    const input = window.prompt(
      "Enter image URL:",
      "https://"
    );

    if (input === null) return;

    const url = input.trim();

    if (!isValidUrl(url)) {
      setImageError(
        "Please enter a valid HTTP or HTTPS image URL."
      );
      return;
    }

    insertImageAtSavedPosition(
      url,
      "Product description image"
    );
  }

  function toggleImageMenu() {
    if (!editor || disabled || processingImage) return;

    if (!imageMenuOpen) {
      saveImagePosition();
    }

    setImageMenuOpen((previous) => !previous);
    setImageError("");
  }

  function button(Icon, title, action, active = false) {
    return (
      <EditorButton
        icon={Icon}
        title={title}
        active={!!active}
        disabled={disabled || !editor}
        onClick={() => {
          if (!editor || disabled) return;
          action();
        }}
      />
    );
  }

  return (
    <>
      <div className="sd-rte">
        <div className="sd-rte-toolbar">
          <div className="sd-rte-toolbar-row">
            {button(
              Undo2,
              "Undo",
              () => editor.chain().focus().undo().run()
            )}

            {button(
              Redo2,
              "Redo",
              () => editor.chain().focus().redo().run()
            )}

            <Separator />

            {button(
              Heading1,
              "Heading 1",
              () =>
                editor.chain().focus()
                  .toggleHeading({ level: 1 }).run(),
              editor?.isActive("heading", { level: 1 })
            )}

            {button(
              Heading2,
              "Heading 2",
              () =>
                editor.chain().focus()
                  .toggleHeading({ level: 2 }).run(),
              editor?.isActive("heading", { level: 2 })
            )}

            {button(
              Heading3,
              "Heading 3",
              () =>
                editor.chain().focus()
                  .toggleHeading({ level: 3 }).run(),
              editor?.isActive("heading", { level: 3 })
            )}

            {button(
              Pilcrow,
              "Paragraph",
              () =>
                editor.chain().focus().setParagraph().run(),
              editor?.isActive("paragraph")
            )}

            <Separator />

            {button(
              Bold,
              "Bold",
              () =>
                editor.chain().focus().toggleBold().run(),
              editor?.isActive("bold")
            )}

            {button(
              Italic,
              "Italic",
              () =>
                editor.chain().focus().toggleItalic().run(),
              editor?.isActive("italic")
            )}

            {button(
              Underline,
              "Underline",
              () =>
                editor.chain().focus().toggleUnderline().run(),
              editor?.isActive("underline")
            )}

            {button(
              Strikethrough,
              "Strikethrough",
              () =>
                editor.chain().focus().toggleStrike().run(),
              editor?.isActive("strike")
            )}

            {button(
              Code,
              "Inline Code",
              () =>
                editor.chain().focus().toggleCode().run(),
              editor?.isActive("code")
            )}

            <Separator />

            {button(
              List,
              "Bullet List",
              () =>
                editor.chain().focus().toggleBulletList().run(),
              editor?.isActive("bulletList")
            )}

            {button(
              ListOrdered,
              "Numbered List",
              () =>
                editor.chain().focus().toggleOrderedList().run(),
              editor?.isActive("orderedList")
            )}

            {button(
              Quote,
              "Blockquote",
              () =>
                editor.chain().focus().toggleBlockquote().run(),
              editor?.isActive("blockquote")
            )}

            {button(
              CodeXml,
              "Code Block",
              () =>
                editor.chain().focus().toggleCodeBlock().run(),
              editor?.isActive("codeBlock")
            )}

            <Separator />

            {button(
              AlignLeft,
              "Align Left",
              () =>
                editor.chain().focus()
                  .setTextAlign("left").run(),
              editor?.isActive({ textAlign: "left" })
            )}

            {button(
              AlignCenter,
              "Align Center",
              () =>
                editor.chain().focus()
                  .setTextAlign("center").run(),
              editor?.isActive({ textAlign: "center" })
            )}

            {button(
              AlignRight,
              "Align Right",
              () =>
                editor.chain().focus()
                  .setTextAlign("right").run(),
              editor?.isActive({ textAlign: "right" })
            )}

            {button(
              Minus,
              "Horizontal Rule",
              () =>
                editor.chain().focus().setHorizontalRule().run()
            )}
          </div>

          <div className="sd-rte-toolbar-row sd-rte-second-row">
            <div
              className="sd-rte-image-control"
              ref={imageMenuRef}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className={`sd-rte-btn ${
                  imageMenuOpen ? "is-active" : ""
                }`}
                title="Insert image"
                aria-label="Insert image"
                aria-expanded={imageMenuOpen}
                disabled={disabled || processingImage || !editor}
                onMouseDown={(event) => event.preventDefault()}
                onClick={toggleImageMenu}
              >
                {processingImage ? (
                  <LoaderCircle
                    size={17}
                    className="sd-rte-spin"
                  />
                ) : (
                  <ImagePlus size={17} strokeWidth={1.9} />
                )}
              </button>

              {imageMenuOpen && (
                <div className="sd-rte-image-menu">
                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={openImagePicker}
                  >
                    <Upload size={16} />
                    <span>Upload image</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(event) =>
                      event.preventDefault()
                    }
                    onClick={insertImageUrl}
                  >
                    <Link2 size={16} />
                    <span>Image URL</span>
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {button(
              Link2,
              "Insert or Edit Link",
              insertLink,
              editor?.isActive("link")
            )}

            {editor?.isActive("link") &&
              button(
                Unlink,
                "Remove Link",
                () =>
                  editor.chain().focus().unsetLink().run()
              )}
          </div>
        </div>

        {processingImage && (
          <div className="sd-rte-image-status">
            <LoaderCircle
              size={15}
              className="sd-rte-spin"
            />
            Processing image...
          </div>
        )}

        {imageError && (
          <div
            className="sd-rte-image-error"
            role="alert"
          >
            <span>{imageError}</span>

            <button
              type="button"
              onClick={() => setImageError("")}
              aria-label="Dismiss image error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="sd-rte-writing-area">
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div className="sd-rte-loading">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sd-rte {
          width: 100%;
          border: 1px solid #dfe3e8;
          border-radius: 15px;
          background: #ffffff;
          font-family: "Segoe UI", Arial, sans-serif;
          box-sizing: border-box;
        }

        .sd-rte * {
          box-sizing: border-box;
        }

        .sd-rte:focus-within {
          border-color: #c4d9cd;
        }

        .sd-rte-toolbar {
          position: relative;
          z-index: 10;
          padding: 6px 9px;
          background: #fafafa;
          border-bottom: 1px solid #e4e5e8;
          border-radius: 15px 15px 0 0;
        }

        .sd-rte-toolbar-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 3px;
          min-height: 35px;
        }

        .sd-rte-second-row {
          margin-top: 2px;
        }

        .sd-rte-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 32px;
          width: 32px;
          height: 32px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #30343b;
          cursor: pointer;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
        }

        .sd-rte-btn svg {
          display: block;
          flex-shrink: 0;
        }

        .sd-rte-btn:hover:not(:disabled) {
          background: #eeeeef;
        }

        .sd-rte-btn.is-active {
          background: #e5f3ed;
          color: #05714b;
        }

        .sd-rte-btn:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .sd-rte-separator {
          width: 1px;
          height: 23px;
          flex: 0 0 1px;
          margin: 0 4px;
          background: #e2e4e7;
        }

        .sd-rte-image-control {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .sd-rte-image-menu {
          position: absolute;
          top: 37px;
          left: 0;
          z-index: 100;
          width: 156px;
          padding: 5px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 5px 16px rgba(0,0,0,0.13);
        }

        .sd-rte-image-menu button {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 10px 9px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #27272a;
          text-align: left;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .sd-rte-image-menu button:hover {
          background: #f3f5f4;
        }

        .sd-rte-image-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-bottom: 1px solid #e5e7eb;
          color: #05714b;
          font-size: 12px;
        }

        .sd-rte-image-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 9px 13px;
          border-bottom: 1px solid #fecaca;
          background: #fef2f2;
          color: #dc2626;
          font-size: 12px;
        }

        .sd-rte-image-error button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .sd-rte-spin {
          animation: sd-rte-spin 1s linear infinite;
        }

        @keyframes sd-rte-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .sd-rte-writing-area {
          min-height: 205px;
          background: #ffffff;
          border-radius: 0 0 15px 15px;
        }

        .sd-rte-content {
          min-height: 205px;
          max-height: 650px;
          overflow-y: auto;
          padding: 17px 16px;
          outline: none;
          color: #27272a;
          background: transparent;
          font-family: "Segoe UI", Arial, sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .sd-rte-content:focus {
          outline: none;
          box-shadow: none;
        }

        .sd-rte-loading {
          min-height: 205px;
          padding: 17px 16px;
          color: #9399a2;
          font-size: 14px;
        }

        .sd-rte-content p {
          margin: 0 0 12px;
        }

        .sd-rte-content p:last-child {
          margin-bottom: 0;
        }

        .sd-rte-content h1 {
          margin: 14px 0 10px;
          font-size: 26px;
          font-weight: 700;
          line-height: 1.4;
        }

        .sd-rte-content h2 {
          margin: 14px 0 10px;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.4;
        }

        .sd-rte-content h3 {
          margin: 12px 0 8px;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
        }

        .sd-rte-content strong {
          font-weight: 700;
        }

        .sd-rte-content em {
          font-style: italic;
        }

        .sd-rte-content u {
          text-decoration: underline;
        }

        .sd-rte-content s {
          text-decoration: line-through;
        }

        .sd-rte-content ul {
          list-style-type: disc;
          padding-left: 26px;
          margin: 10px 0;
        }

        .sd-rte-content ol {
          list-style-type: decimal;
          padding-left: 26px;
          margin: 10px 0;
        }

        .sd-rte-content li {
          margin: 4px 0;
        }

        .sd-rte-content li p {
          margin: 0;
        }

        .sd-rte-content blockquote {
          margin: 14px 0;
          padding: 8px 14px;
          border-left: 3px solid #05714b;
          background: #f5faf7;
          color: #52525b;
        }

        .sd-rte-content code {
          padding: 2px 5px;
          border-radius: 4px;
          background: #f1f3f5;
          color: #be185d;
          font-family: Consolas, monospace;
          font-size: 0.9em;
        }

        .sd-rte-content pre {
          margin: 12px 0;
          padding: 14px;
          border-radius: 8px;
          background: #1f2937;
          color: #f9fafb;
          overflow-x: auto;
          white-space: pre;
        }

        .sd-rte-content pre code {
          padding: 0;
          background: transparent;
          color: inherit;
        }

        .sd-rte-content a {
          color: #05714b;
          text-decoration: underline;
          cursor: pointer;
        }

        .sd-rte-content img {
          display: block;
          width: auto;
          max-width: 100%;
          max-height: 600px;
          height: auto;
          margin: 14px 0;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          object-fit: contain;
        }

        .sd-rte-content img.ProseMirror-selectednode {
          outline: 2px solid #05714b;
          outline-offset: 2px;
        }

        .sd-rte-content hr {
          margin: 18px 0;
          border: 0;
          border-top: 1px solid #d4d4d8;
        }

        .sd-rte-content .is-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          color: #9299a3;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .sd-rte-toolbar {
            padding: 5px;
          }

          .sd-rte-toolbar-row {
            gap: 2px;
          }

          .sd-rte-btn {
            flex-basis: 30px;
            width: 30px;
            height: 30px;
          }

          .sd-rte-separator {
            margin: 0 2px;
          }

          .sd-rte-content {
            min-height: 230px;
            padding: 14px;
          }
        }
      `}</style>
    </>
  );
}
