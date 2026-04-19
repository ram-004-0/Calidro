import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Ellipsis,
  Save,
  FileText,
  Copy,
  Eye,
  RotateCcw,
} from "lucide-react";
import React, { useState, useEffect } from "react";

const OverviewAboutUs = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const charLimit = 500;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({ limit: charLimit }),
    ],
    content: `<p><strong>Calidro Events Place</strong> is owned and operated by <strong>Station C Creative Solutions, Inc.</strong></p>`,
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none min-h-[150px]",
      },
    },
  });

  const [, setUpdate] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const handler = () => setUpdate((s) => s + 1);
    editor.on("transaction", handler);
    return () => editor.off("transaction", handler);
  }, [editor]);

  if (!editor) return null;

  // --- Menu Functions ---
  const handleCopy = () => {
    const plainText = editor.getText();
    navigator.clipboard.writeText(plainText);
    alert("Text copied to clipboard!"); // You can replace this with a toast notification
    setShowMenu(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all content?")) {
      editor.commands.setContent("<p>Start typing here...</p>");
    }
    setShowMenu(false);
  };

  const charCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#4a3733] mb-4 uppercase">
        About Us
      </h1>

      <div className="flex gap-6 items-start">
        <div className="relative bg-white rounded-2xl shadow-md p-5 w-105 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {/* Styling Buttons */}
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-md border border-white ${editor.isActive("bold") ? "bg-[#4a3733] text-white" : "text-[#4a3733] hover:bg-gray-100"}`}
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-md border border-white ${editor.isActive("italic") ? "bg-[#4a3733] text-white" : "text-[#4a3733] hover:bg-gray-100"}`}
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded-md border border-white ${editor.isActive("underline") ? "bg-[#4a3733] text-white" : "text-[#4a3733] hover:bg-gray-100"}`}
              >
                <UnderlineIcon size={16} />
              </button>
            </div>

            {/* Ellipsis Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <Ellipsis size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-xl w-48 z-20 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setIsPreview(!isPreview);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-sm text-[#4a3733]"
                  >
                    <Eye size={14} /> {isPreview ? "Edit Mode" : "View Draft"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-sm text-[#4a3733]"
                  >
                    <Copy size={14} /> Copy to Clipboard
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                  >
                    <RotateCcw size={14} /> Reset Content
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Editor / Preview Area */}
          <div
            className={`rounded-xl p-4 border transition-all ${isPreview ? "bg-gray-50 border-transparent shadow-inner" : "bg-[#fcfaf9] border-gray-100"}`}
          >
            {isPreview ? (
              <div
                className="prose prose-sm max-w-none min-h-[150px] text-gray-700"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            ) : (
              <EditorContent editor={editor} />
            )}
          </div>

          {/* Counts */}
          <div className="mt-3 flex justify-between items-center px-1">
            <div className="flex items-center gap-1 text-gray-400">
              <FileText size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {wordCount} Words
              </span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${charCount >= charLimit ? "text-red-500" : "text-gray-400"}`}
            >
              {charCount} / {charLimit}
            </span>
          </div>

          <button className="mt-4 w-full px-4 py-2 rounded-xl text-white bg-[#4a3733] hover:bg-[#3a2c28] transition flex items-center justify-center gap-2 font-semibold shadow-sm">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewAboutUs;
