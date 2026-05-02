import { Link, useLocation } from "wouter";
import { Terminal, Map, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans dark">
      <div className="w-16 flex flex-col items-center py-4 border-r border-border bg-card shadow-lg z-10 shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-8 border border-primary/20">
          <Terminal className="w-5 h-5" />
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-2">
          <NavItem href="/" icon={<Map className="w-5 h-5" />} active={location === "/"} label="Challenge Map" />
        </nav>
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, active, label }: { href: string; icon: React.ReactNode; active: boolean; label: string }) {
  return (
    <Link href={href} className={cn(
      "w-12 h-12 flex items-center justify-center rounded-lg transition-colors group relative",
      active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}>
      {icon}
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
        {label}
      </div>
    </Link>
  );
}
