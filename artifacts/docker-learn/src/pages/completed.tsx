import { useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, List, Lightbulb } from "lucide-react";
import {
  getGetChallengeQueryKey,
  useGetChallenge,
  useListChallenges,
} from "@workspace/api-client-react";
import { useProgress } from "@/hooks/use-progress";
import { Markdown } from "@/components/markdown";

export function CompletedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const completedId = params.get("id");

  const { data: challenges } = useListChallenges();
  const { data: challenge } = useGetChallenge(completedId ?? "", {
    query: {
      queryKey: getGetChallengeQueryKey(completedId ?? ""),
      enabled: Boolean(completedId),
    },
  });
  const { completedIds } = useProgress();

  const nextChallenge = useMemo(() => {
    if (!challenges || !completedId) return null;

    const sorted = [...challenges].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((c) => c.id === completedId);
    if (currentIndex === -1 || currentIndex >= sorted.length - 1) return null;

    return sorted.slice(currentIndex + 1).find((c) => !completedIds.includes(c.id))
      ?? sorted[currentIndex + 1]
      ?? null;
  }, [challenges, completedId, completedIds]);

  const learnings = challenge?.keyLearnings ?? [];

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-2xl mx-auto p-8 flex flex-col items-center space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
            <div className="w-24 h-24 bg-card border-2 border-primary shadow-xl shadow-primary/20 rounded-full flex items-center justify-center relative z-10">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Challenge Passed!
            </h1>
            {challenge && (
              <p className="text-muted-foreground text-lg">
                You completed <span className="text-foreground font-medium">{challenge.title}</span>.
              </p>
            )}
          </div>
        </div>

        {learnings.length > 0 && (
          <div className="w-full border border-primary/40 bg-primary/5 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Lightbulb className="w-5 h-5" />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Key Learnings
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Why the approach you just used works — and what the tempting alternative
              would have cost you.
            </p>
            <div className="space-y-3">
              {learnings.map((learning, i) => (
                <div
                  key={i}
                  className="border border-border/60 bg-card/60 rounded-md p-4 space-y-2"
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {learning.title}
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <Markdown content={learning.body} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full h-[1px] bg-border"></div>

        <div className="flex flex-col gap-3 w-full max-w-md">
          {nextChallenge ? (
            <Link href={`/challenges/${nextChallenge.id}`} className="w-full">
              <Button size="lg" className="w-full font-semibold gap-2">
                Next Challenge: {nextChallenge.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              className="w-full font-semibold gap-2 bg-success text-success-foreground"
              disabled
            >
              All Challenges Completed
            </Button>
          )}

          <Link href="/" className="w-full">
            <Button variant="outline" size="lg" className="w-full gap-2">
              <List className="w-4 h-4" />
              Return to Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
