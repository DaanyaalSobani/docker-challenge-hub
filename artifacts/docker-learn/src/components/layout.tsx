import { Link, useLocation } from "wouter";
import { Terminal, Map, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const initials = (() => {
    if (!user) return "";
    const f = (user.firstName ?? "").trim();
    const l = (user.lastName ?? "").trim();
    if (f || l) return `${f[0] ?? ""}${l[0] ?? ""}`.toUpperCase();
    if (user.email) return user.email[0]!.toUpperCase();
    return "?";
  })();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans dark">
      <div className="w-16 flex flex-col items-center py-4 border-r border-border bg-card shadow-lg z-10 shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-8 border border-primary/20">
          <Terminal className="w-5 h-5" />
        </div>

        <nav className="flex flex-col gap-4 w-full px-2">
          <NavItem
            href="/"
            icon={<Map className="w-5 h-5" />}
            active={location === "/"}
            label="Challenge Map"
          />
        </nav>

        <div className="mt-auto flex flex-col items-center gap-3 w-full px-2">
          {isLoading ? null : isAuthenticated ? (
            <>
              <div
                className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden group relative"
                title={user?.email ?? "Signed in"}
                data-testid="avatar-current-user"
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : initials ? (
                  <span className="text-xs font-semibold text-primary">
                    {initials}
                  </span>
                ) : (
                  <UserIcon className="w-4 h-4 text-primary" />
                )}
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {user?.email ?? "Signed in"}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                data-testid="button-logout"
                className="w-12 h-12 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group relative"
              >
                <LogOut className="w-5 h-5" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Log out
                </div>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={login}
              data-testid="button-login"
              className="w-12 h-12 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors group relative"
            >
              <LogIn className="w-5 h-5" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Log in
              </div>
            </button>
          )}
        </div>
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  active,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-lg transition-colors group relative",
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
        {label}
      </div>
    </Link>
  );
}
