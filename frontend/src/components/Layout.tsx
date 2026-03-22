import type { Page } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Mic,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
  navigate: (page: Page) => void;
  currentPage?: Page;
}

export default function Layout({
  children,
  isAdmin,
  navigate,
  currentPage,
}: LayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem("vexora_user");
    navigate("login");
  };

  const navLinks: { page: Page; label: string; icon: React.ElementType }[] = [
    { page: "home", label: "Home", icon: Brain },
    { page: "resume", label: "Resume", icon: FileText },
    { page: "interview", label: "Interview", icon: Mic },
    { page: "history", label: "History", icon: Clock },
    ...(isAdmin
      ? [{ page: "admin" as Page, label: "Admin", icon: LayoutDashboard }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Flowing aurora background */}
      <div className="bg-aurora" aria-hidden="true">
        <div className="bg-aurora-mid" />
      </div>

      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-gradient">
              Vexora AI
            </span>
          </button>

          <div className="flex items-center gap-1">
            {navLinks.map(({ page, label, icon: Icon }) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                onClick={() => navigate(page)}
                data-ocid={`nav.${page}.link`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 ml-2"
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
