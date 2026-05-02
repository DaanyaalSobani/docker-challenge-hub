import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  readonly?: boolean;
  path?: string;
}

export function CodeEditor({ value, onChange, language, readonly = false, path }: CodeEditorProps) {
  return (
    <div className="w-full h-full">
      <Editor
        height="100%"
        path={path}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        keepCurrentModel={false}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--app-font-mono)",
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          readOnly: readonly,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
