import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Star, Award, Moon, Sun, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até breve! ✨",
      description: "Que os astros te guiem sempre",
    });
    navigate("/");
  };

  const achievements = [
    { name: "Primeira Lua", description: "Registrou seu primeiro sonho", locked: false },
    { name: "Explorador Matinal", description: "7 dias consecutivos", locked: true },
    { name: "Alquimista Solar", description: "Completou 30 rituais", locked: true },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Profile Header */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl">
                {user?.email?.split('@')[0] || "Explorador"}
              </CardTitle>
              <CardDescription>
                Sol em Escorpião • Lua em Peixes • Asc. Áries
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Constellation Progress */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary glow" />
            Constelação de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center border border-primary/10">
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i <= 2 ? "text-primary fill-primary glow" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">2 de 5 estrelas acesas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Conquistas Cósmicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border flex items-center gap-3 ${
                achievement.locked
                  ? "bg-background/50 border-muted opacity-50"
                  : "bg-primary/5 border-primary/20"
              }`}
            >
              <Award className={`w-5 h-5 ${achievement.locked ? "text-muted" : "text-primary"}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 fade-in">
        <Card className="cosmic-card">
          <CardContent className="pt-6 text-center">
            <Moon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Sonhos interpretados</p>
          </CardContent>
        </Card>
        <Card className="cosmic-card">
          <CardContent className="pt-6 text-center">
            <Sun className="w-8 h-8 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Rituais completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-2 fade-in">
        <Button variant="outline" className="w-full gap-2">
          <Settings className="w-4 h-4" />
          Configurações
        </Button>
        <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Profile;
