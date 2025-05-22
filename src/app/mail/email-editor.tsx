'use client'

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Text } from '@tiptap/extension-text';
import EditorMenuBar from './editor-menubar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import TagInput from './tag-input';
import { Input } from '@/components/ui/input';

type Props = {
    subject: string;
    setSubject: (subject: string) => void;

    toValues: { label: string, value: string }[];
    setToValues: (values: { label: string, value: string }[]) => void;
    
    ccValues: { label: string, value: string }[];
    setCcValues: (values: { label: string, value: string }[]) => void;
    
    to: string[]
    
    handleSend: (value: string) => void;
    isSending: boolean;

    defaultToolbarExpand?: boolean;
}

const EmailEditor = ({ toValues, ccValues, subject, setSubject, to, handleSend, isSending, setToValues, setCcValues, defaultToolbarExpand = false }: Props) => {
  const [value, setValue] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpand)

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        'Meta-j': () => {
          console.log('Meta-j');
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  if(!editor) return null

  return (
    <div>
        <div className="flex p-4 py-2 border-b">
            <EditorMenuBar editor={editor} />
        </div>

        <div className="p-4 pb-0 space-y-2">
            {expanded && (
                <>
                    <TagInput 
                      label='To'
                      onChange={setToValues}
                      placeholder='Add Recipients'
                      value={toValues}
                    />
                    <TagInput 
                      label='Cc'
                      onChange={setCcValues}
                      placeholder='Add Recipients'
                      value={ccValues}
                    />
                    <Input id='subject' placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
                </>
            )}

            <div className="flex items-center gap-2">
                <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <span className="text-green-600 font-medium">
                        Draft {" "}
                    </span>
                    <span>
                        to {to.join(', ')}
                    </span>
                </div>
            {/* <AIComposeButton
                        isComposing={defaultToolbarExpand}
                        onGenerate={setGeneration}
                    /> */}
            </div>

        </div>

        <div className="prose w-full px-4 py-5">
            <EditorContent editor={editor} value={value} placeholder="Write your email here..." />
        </div>

        <Separator />

        <div className="py-3 px-4 flex items-center justify-between">
        <span className="text-sm flex items-center gap-2">
            Tip: Press
                <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            CTRL + J
                </kbd>
            for AI autocomplete
        </span>

            <Button onClick={async () => {
                editor?.commands?.clearContent()
                handleSend(value)
            }} disabled={isSending}>
                Send
            </Button>
        </div>
    </div>
  );
};

export default EmailEditor;
