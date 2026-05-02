import { CheckCircle2, XCircle, Terminal as TerminalIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ValidationResult } from "@workspace/api-client-react";

interface TerminalProps {
  result: ValidationResult | null;
  isRunning: boolean;
}

export function Terminal({ result, isRunning }: TerminalProps) {
  if (isRunning) {
    return (
      <div className="flex-1 bg-zinc-950 font-mono text-sm p-4 text-zinc-400 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800 text-zinc-500">
          <TerminalIcon className="w-4 h-4" />
          <span>Output Console</span>
        </div>
        <div className="flex items-center gap-2 text-primary animate-pulse mt-4">
          <span className="w-2 h-4 bg-primary inline-block"></span>
          Running validation checks...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 bg-zinc-950 font-mono text-sm p-4 text-zinc-400 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800 text-zinc-500">
          <TerminalIcon className="w-4 h-4" />
          <span>Output Console</span>
        </div>
        <div className="text-zinc-600 mt-4 italic">Ready to run validation...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 font-mono text-sm p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-zinc-800 text-zinc-500">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span>Output Console</span>
        </div>
        <div className="text-xs">
          Score: {result.score} / {result.maxScore}
        </div>
      </div>
      
      <ScrollArea className="flex-1 pt-2 pr-4">
        <div className="space-y-4">
          {result.checks.map((check, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-start gap-2">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className={`font-medium ${check.passed ? "text-green-400" : "text-red-400"}`}>
                    {check.name}
                  </div>
                  <div className="text-zinc-400 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                    {check.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {result.output && (
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="text-zinc-500 text-xs mb-2 font-medium">Build Output:</div>
              <pre className="text-zinc-300 text-xs whitespace-pre-wrap font-mono leading-relaxed bg-zinc-900/50 p-3 rounded border border-zinc-800">
                {result.output}
              </pre>
            </div>
          )}
          
          {result.feedback && !result.passed && (
            <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded text-red-400 text-sm">
              <span className="font-semibold block mb-1">Feedback:</span>
              {result.feedback}
            </div>
          )}
          
          {result.passed && (
            <div className="mt-4 p-3 bg-green-950/30 border border-green-900/50 rounded text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Success! All checks passed.</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
