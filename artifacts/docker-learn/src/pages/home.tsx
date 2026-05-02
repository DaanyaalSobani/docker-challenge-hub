import { useListChallenges, useGetProgress, useGetChallengeStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Lock, CheckCircle2, PlayCircle, BookOpen, Layers, Network, HardDrive, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const categoryColors: Record<string, string> = {
  dockerfile: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "multi-stage": "text-purple-400 border-purple-400/30 bg-purple-400/10",
  compose: "text-green-400 border-green-400/30 bg-green-400/10",
  networking: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  volumes: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  security: "text-red-400 border-red-400/30 bg-red-400/10",
};

const categoryIcons: Record<string, React.ReactNode> = {
  dockerfile: <BookOpen className="w-5 h-5" />,
  "multi-stage": <Layers className="w-5 h-5" />,
  compose: <Layers className="w-5 h-5" />,
  networking: <Network className="w-5 h-5" />,
  volumes: <HardDrive className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  dockerfile: "Dockerfile Basics",
  "multi-stage": "Multi-Stage Builds",
  compose: "Docker Compose",
  networking: "Networking",
  volumes: "Volumes",
  security: "Security",
};

export function Home() {
  const { data: challenges, isLoading: loadingChallenges } = useListChallenges();
  const { data: progress, isLoading: loadingProgress } = useGetProgress();
  const { data: stats, isLoading: loadingStats } = useGetChallengeStats();

  if (loadingChallenges || loadingProgress || loadingStats) {
    return <HomeSkeleton />;
  }

  if (!challenges) return <div>Failed to load challenges</div>;

  const categories = Array.from(new Set(challenges.map((c) => c.category)));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex flex-col gap-4 p-8 border-b border-border bg-card">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Challenge Map</h1>
          <p className="text-muted-foreground">Master Docker by building real-world container configurations.</p>
        </div>
        {progress && stats && (
          <div className="flex items-center gap-4 max-w-md">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Overall Progress</span>
                <span className="text-muted-foreground">{progress.totalCompleted} / {progress.totalChallenges}</span>
              </div>
              <Progress value={(progress.totalCompleted / progress.totalChallenges) * 100} className="h-2" />
            </div>
          </div>
        )}
      </header>

      <div className="p-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-16 pb-16">
          {categories.map((category) => {
            const categoryChallenges = challenges.filter((c) => c.category === category).sort((a, b) => a.order - b.order);
            const categoryColor = categoryColors[category] || "text-gray-400 border-gray-400/30 bg-gray-400/10";
            
            return (
              <section key={category} className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn("p-2 rounded-md border", categoryColor)}>
                    {categoryIcons[category] || <BookOpen className="w-5 h-5" />}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{categoryLabels[category] || category}</h2>
                  {stats?.byCategory[category] && (
                    <Badge variant="outline" className="ml-2 font-mono text-xs">
                      {stats.byCategory[category].completed} / {stats.byCategory[category].total}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-border/50 ml-5">
                  {categoryChallenges.map((challenge, index) => (
                    <div key={challenge.id} className="relative">
                      <div className="absolute top-1/2 -left-4 w-4 border-t-2 border-border/50 -translate-y-1/2"></div>
                      <ChallengeCard challenge={challenge} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const isLocked = challenge.locked;
  const isCompleted = challenge.completed;

  const difficultyColors = {
    beginner: "text-green-500 bg-green-500/10 border-green-500/20",
    intermediate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    advanced: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  const CardContent = () => (
    <div className={cn(
      "p-5 rounded-lg border flex flex-col h-full transition-all duration-200",
      isLocked 
        ? "bg-card/50 border-border/50 opacity-70 grayscale" 
        : isCompleted
          ? "bg-card border-primary/40 shadow-sm hover:border-primary"
          : "bg-card border-border hover:border-primary/60 hover:shadow-md hover:-translate-y-1"
    )}>
      <div className="flex justify-between items-start mb-3">
        <Badge variant="outline" className={cn("text-xs font-medium uppercase tracking-wider", difficultyColors[challenge.difficulty as keyof typeof difficultyColors])}>
          {challenge.difficulty}
        </Badge>
        <div>
          {isLocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          ) : (
            <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2 text-foreground leading-tight">{challenge.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{challenge.description}</p>
    </div>
  );

  if (isLocked) {
    return <CardContent />;
  }

  return (
    <Link href={`/challenges/${challenge.id}`} className="block h-full group">
      <CardContent />
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-8 border-b border-border bg-card">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-6" />
        <Skeleton className="h-10 w-full max-w-md" />
      </header>
      <div className="p-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-12">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4 border-l-2 border-border/50 ml-5">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-40 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
