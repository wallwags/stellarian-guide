import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Sun, Moon, Star, BookOpen, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth?mode=login");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth?mode=login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até breve!",
      description: "Você saiu da sua conta.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="starfield" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 fade-in">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meu Cosmos
            </h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo, {user?.email?.split('@')[0]} ✨
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-primary/30">
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleLogout}
              className="border-primary/30"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="today" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Meu Dia</span>
            </TabsTrigger>
            <TabsTrigger value="celestial" className="gap-2">
              <Sun className="w-4 h-4" />
              <span className="hidden sm:inline">Sol & Lua</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Mapa Astral</span>
            </TabsTrigger>
            <TabsTrigger value="dreams" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Sonhos</span>
            </TabsTrigger>
          </TabsList>

          {/* Today's Energy */}
          <TabsContent value="today" className="space-y-6 fade-in">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Energia de Hoje
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="cosmic-card p-4 space-y-2">
                    <Sun className="w-8 h-8 text-secondary mb-2" />
                    <h3 className="font-serif text-lg font-semibold">Sol em...</h3>
                    <p className="text-sm text-muted-foreground">
                      Em breve: conselhos personalizados baseados nos trânsitos atuais
                    </p>
                  </div>
                  
                  <div className="cosmic-card p-4 space-y-2">
                    <Moon className="w-8 h-8 text-accent mb-2" />
                    <h3 className="font-serif text-lg font-semibold">Lua em...</h3>
                    <p className="text-sm text-muted-foreground">
                      Em breve: energia lunar do dia e recomendações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sun & Moon */}
          <TabsContent value="celestial" className="fade-in">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Sol & Lua Hoje</CardTitle>
                <CardDescription>Entenda a energia celestial atual</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: visualização detalhada das posições e significados
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Astral Map */}
          <TabsContent value="map" className="fade-in">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Meu Mapa Astral</CardTitle>
                <CardDescription>Seu universo interior revelado</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: mapa astral interativo completo com interpretações
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dreams Journal */}
          <TabsContent value="dreams" className="fade-in">
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Diário de Sonhos
                </CardTitle>
                <CardDescription>Converse com a IA Onírica</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Em breve: interpretação simbólica dos seus sonhos com IA
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
