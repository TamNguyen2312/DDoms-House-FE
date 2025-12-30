import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập mô tả chi tiết...",
  disabled = false,
  maxLength,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Nếu có maxLength, kiểm tra text length (không tính HTML tags)
      if (maxLength) {
        const textLength = editor.getText().length;
        if (textLength > maxLength) {
          // Cắt nội dung nếu vượt quá
          return;
        }
      }
      onChange?.(html);
    },
  });

  // Sync editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentHtml = editor.getHTML();
      // Only update if different to avoid infinite loops
      if (currentHtml !== value) {
        editor.commands.setContent(value, false);
      }
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const currentLength = editor.getText().length;

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("bold") && "bg-accent"
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("italic") && "bg-accent"
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("bulletList") && "bg-accent"
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled || !editor.can().chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive("orderedList") && "bg-accent"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
        {maxLength && (
          <div className="ml-auto text-xs text-muted-foreground">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="min-h-[100px] p-4 bg-background">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[80px] [&_.tiptap-p]:my-1 [&_.tiptap-ul]:my-1 [&_.tiptap-ol]:my-1 [&_.tiptap-li]:my-0.5"
        />
      </div>
    </div>
  );
}

