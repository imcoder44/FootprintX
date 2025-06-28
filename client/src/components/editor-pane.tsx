import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { configureMonaco } from "@/lib/monaco-config";
import { getLanguageTemplate } from "@/lib/language-templates";

interface EditorPaneProps {
  file: any;
  language: string;
  onFileChange: (file: any) => void;
}

export default function EditorPane({ file, language, onFileChange }: EditorPaneProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<any>(null);
  const [lineNumber, setLineNumber] = useState(1);
  const [columnNumber, setColumnNumber] = useState(1);
  const queryClient = useQueryClient();

  const updateContentMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: number; content: string }) => {
      const response = await apiRequest('PUT', `/api/files/${fileId}/content`, { content });
      return response.json();
    },
    onSuccess: (updatedFile) => {
      queryClient.setQueryData([`/api/files/${updatedFile.id}`], updatedFile);
      onFileChange(updatedFile);
    },
  });

  // Initialize Monaco Editor
  useEffect(() => {
    if (!editorRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ 
        paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } 
      });
      
      (window as any).require(['vs/editor/editor.main'], () => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.dispose();
        }

        configureMonaco();

        const monaco = (window as any).monaco;
        const editor = monaco.editor.create(editorRef.current, {
          value: file?.content || getLanguageTemplate(language),
          language: getMonacoLanguage(language),
          theme: 'hackerTerminal',
          fontSize: 14,
          fontFamily: 'Fira Code, Monaco, Menlo, monospace',
          fontLigatures: true,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          cursorBlinking: 'expand',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
        });

        monacoEditorRef.current = editor;

        // Cursor position tracking
        editor.onDidChangeCursorPosition((e: any) => {
          setLineNumber(e.position.lineNumber);
          setColumnNumber(e.position.column);
        });

        // Auto-save with debounce
        let saveTimeout: NodeJS.Timeout;
        editor.onDidChangeModelContent(() => {
          if (file) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
              const content = editor.getValue();
              updateContentMutation.mutate({ fileId: file.id, content });
            }, 1000);
          }
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
      }
    };
  }, []);

  // Update editor content when file changes
  useEffect(() => {
    if (monacoEditorRef.current && file) {
      const monaco = (window as any).monaco;
      const model = monaco.editor.createModel(
        file.content || getLanguageTemplate(language),
        getMonacoLanguage(language)
      );
      monacoEditorRef.current.setModel(model);
    }
  }, [file, language]);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'python': return 'python';
      case 'java': return 'java';
      case 'react': return 'typescript';
      case 'cpp': return 'cpp';
      case 'mysql': return 'sql';
      case 'html': return 'html';
      default: return 'javascript';
    }
  };

  return (
    <div className="flex-1 bg-terminal-black relative">
      {/* Editor Header */}
      <div className="absolute top-0 left-0 right-0 bg-terminal-dark border-b border-terminal-green px-4 py-2 text-xs flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="text-terminal-cyan">EDITING:</span>
          <span>{file?.name || 'untitled'}</span>
          {updateContentMutation.isPending && (
            <span className="text-yellow-400 animate-blink">●</span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-terminal-cyan">
          <span>Line: <span className="text-terminal-green">{lineNumber}</span></span>
          <span>Col: <span className="text-terminal-green">{columnNumber}</span></span>
        </div>
      </div>
      
      {/* Monaco Editor Container */}
      <div 
        ref={editorRef}
        className="absolute top-10 left-0 right-0 bottom-0 glow-border"
        style={{ margin: '1px' }}
      />
    </div>
  );
}
