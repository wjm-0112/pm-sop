'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export function PRDEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '撰写 PRD 内容…' }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-content min-h-[300px] focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      'rounded p-1.5 text-slate-600 hover:bg-slate-100',
      active && 'bg-primary-50 text-primary',
    );

  return (
    <div className="rounded-lg border border-border">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        <button className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} type="button">
          <Bold size={16} />
        </button>
        <button className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} type="button">
          <Italic size={16} />
        </button>
        <button className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} type="button">
          <Heading2 size={16} />
        </button>
        <button className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} type="button">
          <List size={16} />
        </button>
        <button className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} type="button">
          <ListOrdered size={16} />
        </button>
        <button className={btn(editor.isActive('taskList'))} onClick={() => editor.chain().focus().toggleTaskList().run()} type="button">
          <List size={16} />
        </button>
        <button className={btn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} type="button">
          <Quote size={16} />
        </button>
        <button className={btn(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} type="button">
          <Code size={16} />
        </button>
        <button className={btn(false)} onClick={() => editor.chain().focus().undo().run()} type="button">
          <Undo size={16} />
        </button>
        <button className={btn(false)} onClick={() => editor.chain().focus().redo().run()} type="button">
          <Redo size={16} />
        </button>
      </div>
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
