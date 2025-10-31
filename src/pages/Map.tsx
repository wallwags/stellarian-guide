import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Sun, Moon, Star, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Map = () => {
  const { toast } = useToast();

  const planetData = [
    { name: "Sol", sign: "Escorpião", house: "Casa 8", icon: Sun },
    { name: "Lua", sign: "Peixes", house: "Casa 12", icon: Moon },
    { name: "Ascendente", sign: "Áries", house: "Casa 1", icon: Star },
  ];

  const handleShare = () => {
    toast({
      title: "🌟 Mapa compartilhado",
      description: "Seu mapa astral foi exportado",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header Card */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary glow" />
            Meu Mapa Astral
          </CardTitle>
          <CardDescription>
            Seu universo interior revelado
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Insights */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Insights Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              Seu Sol em Escorpião revela uma natureza intensa e transformadora
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              Lua em Peixes traz sensibilidade emocional e intuição aguçada
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              Ascendente em Áries indica uma personalidade pioneira e corajosa
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Planet Cards */}
      <div className="space-y-4 fade-in">
        {planetData.map((planet, index) => {
          const Icon = planet.icon;
          return (
            <Card key={index} className="cosmic-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="font-serif text-lg">{planet.name}</CardTitle>
                    <CardDescription>{planet.sign} - {planet.house}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Astro Wheel Placeholder */}
      <Card className="cosmic-card fade-in">
        <CardContent className="py-8">
          <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center border border-primary/20">
            <div className="text-center">
              <Globe className="w-16 h-16 text-primary mx-auto mb-2 glow" />
              <p className="text-sm text-muted-foreground">
                Mapa interativo em breve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2">
          Comparar com Hoje
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Exportar
        </Button>
      </div>
    </div>
  );
};

export default Map;
