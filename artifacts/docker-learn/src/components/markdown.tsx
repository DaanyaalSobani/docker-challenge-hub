import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-invert prose-sm max-w-none", className)}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="relative rounded-md bg-zinc-950 overflow-hidden border border-border/50 my-4">
                <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-border/50 text-xs text-muted-foreground font-mono">
                  {match?.[1] || "text"}
                </div>
                <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-zinc-100 font-mono m-0">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono text-[0.85em]" {...props}>
                {children}
              </code>
            );
          },
          a: ({ node, ...props }) => <a className="text-primary hover:underline underline-offset-4" target="_blank" rel="noreferrer" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold tracking-tight text-foreground mt-8 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold tracking-tight text-foreground mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium tracking-tight text-foreground mt-5 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-muted-foreground leading-7 mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-muted-foreground mb-4 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="leading-normal" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
