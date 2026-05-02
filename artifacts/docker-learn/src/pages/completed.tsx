import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, List } from "lucide-react";
import { useListChallenges } from "@workspace/api-client-react";

export function CompletedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const completedId = params.get("id");
  
  const { data: challenges } = useListChallenges();
  
  let nextChallenge = null;
  
  if (challenges && completedId) {
    // Sort challenges by order
    const sorted = [...challenges].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex(c => c.id === completedId);
    
    if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
      // Find the next unlocked/not completed challenge
      nextChallenge = sorted.slice(currentIndex + 1).find(c => !c.locked);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background p-8">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
          <div className="w-24 h-24 bg-card border-2 border-primary shadow-xl shadow-primary/20 rounded-full flex items-center justify-center relative z-10">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Challenge Passed!</h1>
          <p className="text-muted-foreground text-lg">
            Your Docker configuration works perfectly. Excellent job.
          </p>
        </div>
        
        <div className="w-full h-[1px] bg-border"></div>
        
        <div className="flex flex-col gap-3 w-full">
          {nextChallenge ? (
            <Link href={`/challenges/${nextChallenge.id}`} className="w-full">
              <Button size="lg" className="w-full font-semibold gap-2">
                Next Challenge: {nextChallenge.title}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="w-full font-semibold gap-2 bg-success text-success-foreground" disabled>
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
