import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetChallenge,
  useSubmitChallenge,
  type ChallengeFile,
  type ValidationResult,
} from "@workspace/api-client-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, RotateCcw, ArrowLeft, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { CodeEditor } from "@/components/editor";
import { Markdown } from "@/components/markdown";
import { Terminal } from "@/components/terminal";
import { FileTree } from "@/components/file-tree";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProgress } from "@/hooks/use-progress";

export function ChallengePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: challenge, isLoading: isChallengeLoading } = useGetChallenge(id);

  const submitChallenge = useSubmitChallenge();
  const { isCompleted, markComplete } = useProgress();

  const [files, setFiles] = useState<ChallengeFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Initialize files when challenge loads
  useEffect(() => {
    if (challenge && challenge.starterFiles && files.length === 0) {
      setFiles(JSON.parse(JSON.stringify(challenge.starterFiles)));
      if (challenge.starterFiles.length > 0) {
        setActiveFile(challenge.starterFiles[0].name);
      }
    }
  }, [challenge]);

  const handleFileChange = (content: string | undefined) => {
    if (content === undefined) return;
    setFiles((prev) =>
      prev.map((f) => (f.name === activeFile ? { ...f, content } : f)),
    );
  };

  const handleReset = () => {
    if (challenge && challenge.starterFiles) {
      setFiles(JSON.parse(JSON.stringify(challenge.starterFiles)));
      setValidationResult(null);
      toast({
        title: "Editor reset",
        description: "Files have been restored to their initial state.",
      });
    }
  };

  const handleRun = () => {
    submitChallenge.mutate(
      { id, data: { files } },
      {
        onSuccess: (result) => {
          setValidationResult(result);
          if (result.passed) {
            markComplete(id);
            toast({
              title: "Challenge Completed!",
              description: "All checks passed successfully.",
            });
            setTimeout(() => {
              setLocation(`/completed?id=${id}`);
            }, 1500);
          } else {
            toast({
              title: "Validation Failed",
              description: "Some checks did not pass. Check the output for details.",
              variant: "destructive",
            });
          }
        },
        onError: (err) => {
          toast({
            title: "Error",
            description: err.data?.error || err.message || "Failed to validate challenge.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isChallengeLoading) {
    return <ChallengeSkeleton />;
  }

  if (!challenge) {
    return <div className="p-8 text-center text-muted-foreground">Challenge not found</div>;
  }

  const completed = isCompleted(challenge.id);
  const currentFile = files.find((f) => f.name === activeFile);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header / Action Bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </Link>
          <div className="h-4 w-[1px] bg-border mx-2"></div>
          <h1 className="font-semibold text-foreground flex items-center gap-3">
            {challenge.title}
            {completed && <CheckCircle2 className="w-4 h-4 text-primary" />}
          </h1>
          <Badge variant="outline" className="font-mono text-xs uppercase">
            {challenge.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1.5"
            disabled={submitChallenge.isPending}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            disabled={submitChallenge.isPending}
            className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitChallenge.isPending ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Run & Validate
          </Button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Instructions */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="bg-card">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-8">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Project
                  </h2>
                  <div className="border border-border rounded-md bg-zinc-900/50 p-3">
                    <FileTree
                      files={files.length > 0 ? files : challenge.starterFiles}
                      activeFile={activeFile}
                      onSelect={setActiveFile}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Objectives
                  </h2>
                  <ul className="space-y-3">
                    {challenge.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 w-4 h-4 rounded-full border border-primary/50 flex items-center justify-center shrink-0 bg-primary/10 text-primary text-[10px] font-bold">
                          {i + 1}
                        </div>
                        <span className="text-foreground leading-snug">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-[1px] w-full bg-border"></div>

                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                    Instructions
                  </h2>
                  <Markdown content={challenge.instructions} />
                </div>

                {challenge.hints && challenge.hints.length > 0 && (
                  <div className="pt-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                      Hints
                    </h2>
                    <div className="space-y-3">
                      {challenge.hints.map((hint, i) => (
                        <Collapsible key={i} className="border border-border rounded-md bg-zinc-900/50">
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-zinc-800/50 transition-colors [&[data-state=open]>svg]:rotate-90">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <HelpCircle className="w-4 h-4 text-blue-400" />
                              Hint {i + 1}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-3 pt-0 text-sm text-zinc-400 border-t border-border/50 mt-2">
                            <Markdown content={hint} />
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Right Panel: Editor + Terminal */}
          <ResizablePanel defaultSize={65}>
            <ResizablePanelGroup direction="vertical">
              {/* Top: Editor */}
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  {files.length > 1 && (
                    <Tabs
                      value={activeFile}
                      onValueChange={setActiveFile}
                      className="w-full shrink-0 rounded-none border-b border-zinc-800"
                    >
                      <TabsList className="h-10 w-full justify-start rounded-none bg-[#1e1e1e] p-0">
                        {files.map((f) => (
                          <TabsTrigger
                            key={f.name}
                            value={f.name}
                            className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-zinc-900 data-[state=active]:text-primary px-4 font-mono text-xs text-zinc-400 hover:text-zinc-200"
                          >
                            {f.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                  <div className="flex-1 min-h-0 relative">
                    {currentFile && (
                      <CodeEditor
                        path={currentFile.name}
                        value={currentFile.content}
                        onChange={handleFileChange}
                        language={currentFile.language}
                        readonly={currentFile.readonly}
                      />
                    )}
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-1 bg-zinc-800 hover:bg-primary/50 transition-colors" />

              {/* Bottom: Terminal Output */}
              <ResizablePanel defaultSize={30} minSize={15}>
                <Terminal result={validationResult} isRunning={submitChallenge.isPending} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        <Skeleton className="h-6 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>
      <div className="flex-1 flex">
        <div className="w-[35%] border-r border-border p-6 space-y-6">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-4 w-32 mt-8" />
          <div className="space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-[70%] border-b border-border bg-[#1e1e1e] p-4">
            <Skeleton className="h-full w-full bg-zinc-900" />
          </div>
          <div className="h-[30%] bg-zinc-950 p-4">
            <Skeleton className="h-full w-full bg-zinc-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
