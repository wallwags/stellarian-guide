import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Sun, Moon, Star, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AstroData {
  sun: { sign: string; house: string };
  moon: { sign: string; house: string };
  ascendant: { sign: string; house: string };
}

const Map = () => {
  const { toast } = useToast();
  const [astroData, setAstroData] = useState<AstroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAstroMap();
  }, []);

  const loadAstroMap = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('astro_data, sun_sign, moon_sign, ascendant_sign')
        .single();

      if (error) throw error;

      if (profile?.astro_data) {
        setAstroData(profile.astro_data as unknown as AstroData);
      } else if (profile?.sun_sign) {
        // Use basic signs if full astro_data not available
        setAstroData({
          sun: { sign: profile.sun_sign, house: "Casa 1" },
          moon: { sign: profile.moon_sign || "Peixes", house: "Casa 12" },
          ascendant: { sign: profile.ascendant_sign || "Áries", house: "Casa 1" },
        });
      }
    } catch (error) {
      console.error("Erro ao carregar mapa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMap = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-astro-map');
      
      if (error) throw error;
      
      if (data?.astroData) {
        setAstroData(data.astroData);
        toast({
          title: "✨ Mapa gerado",
          description: "Seu mapa astral foi calculado com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar mapa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o mapa. Verifique seus dados de nascimento.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const planetData = astroData ? [
    { name: "Sol", sign: astroData.sun.sign, house: astroData.sun.house, icon: Sun },
    { name: "Lua", sign: astroData.moon.sign, house: astroData.moon.house, icon: Moon },
    { name: "Ascendente", sign: astroData.ascendant.sign, house: astroData.ascendant.house, icon: Star },
  ] : [];

  const handleShare = () => {
    toast({
      title: "🌟 Mapa compartilhado",
      description: "Seu mapa astral foi exportado",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        <Card className="cosmic-card">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Carregando seu mapa astral...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header Card */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary glow" />
                Meu Mapa Astral
              </CardTitle>
              <CardDescription>
                Seu universo interior revelado
              </CardDescription>
            </div>
            {!astroData && (
              <Button onClick={generateMap} disabled={isGenerating} size="sm">
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Gerar Mapa
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quick Insights */}
      {astroData && (
        <Card className="cosmic-card fade-in">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Insights Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Seu Sol em {astroData.sun.sign} revela uma natureza autêntica e poderosa
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Lua em {astroData.moon.sign} traz sensibilidade emocional e intuição aguçada
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Ascendente em {astroData.ascendant.sign} indica como você se apresenta ao mundo
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planet Cards */}
      {planetData.length > 0 && (
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
      )}

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
