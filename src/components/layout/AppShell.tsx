import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Moon, Sparkles, Globe, User } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/home", icon: Home, label: "Meu Dia" },
    { path: "/dreams", icon: Moon, label: "Sonhos" },
    { path: "/rituals", icon: Sparkles, label: "Rituais" },
    { path: "/map", icon: Globe, label: "Meu Mapa" },
    { path: "/profile", icon: User, label: "Eu Cósmico" },
  ];

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.label : "Cosmos";
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="starfield" />
      
      {/* Header */}
      <header className="relative z-10 h-16 flex items-center justify-center border-b border-primary/10 backdrop-blur-sm">
        <h1 className="font-serif text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 h-16 border-t border-primary/10 backdrop-blur-md bg-background/80">
        <div className="h-full flex items-center justify-around max-w-2xl mx-auto px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                }`}
              >
                <Icon className={`w-6 h-6 transition-all ${isActive ? "glow" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
