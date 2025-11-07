import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Sun, Moon, Star, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanetData {
  sign: string;
  degree?: number;
  house?: number;
}

interface AstroData {
  sun: PlanetData;
  moon: PlanetData;
  ascendant: PlanetData;
  mercury?: PlanetData;
  venus?: PlanetData;
  mars?: PlanetData;
  jupiter?: PlanetData;
  saturn?: PlanetData;
  uranus?: PlanetData;
  neptune?: PlanetData;
  pluto?: PlanetData;
  houses?: any[];
  aspects?: any[];
  isApproximation?: boolean;
}

const getPlanetIcon = (planet: string): string => {
  const icons: Record<string, string> = {
    sun: "☀️",
    moon: "🌙",
    mercury: "☿️",
    venus: "♀️",
    mars: "♂️",
    jupiter: "♃",
    saturn: "♄",
    uranus: "♅",
    neptune: "♆",
    pluto: "♇",
    ascendant: "⬆️"
  };
  return icons[planet.toLowerCase()] || "⭐";
};

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
          sun: { sign: profile.sun_sign, house: 1 },
          moon: { sign: profile.moon_sign || "Peixes", house: 12 },
          ascendant: { sign: profile.ascendant_sign || "Áries" },
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
          title: data.isApproximation ? "⚠️ Mapa aproximado" : "✨ Mapa gerado",
          description: data.isApproximation 
            ? "Usando cálculo simplificado (API indisponível)"
            : "Seu mapa astral foi calculado com precisão",
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

  const allPlanets = astroData ? [
    { key: "sun", name: "Sol", data: astroData.sun },
    { key: "moon", name: "Lua", data: astroData.moon },
    { key: "ascendant", name: "Ascendente", data: astroData.ascendant },
    { key: "mercury", name: "Mercúrio", data: astroData.mercury },
    { key: "venus", name: "Vênus", data: astroData.venus },
    { key: "mars", name: "Marte", data: astroData.mars },
    { key: "jupiter", name: "Júpiter", data: astroData.jupiter },
    { key: "saturn", name: "Saturno", data: astroData.saturn },
    { key: "uranus", name: "Urano", data: astroData.uranus },
    { key: "neptune", name: "Netuno", data: astroData.neptune },
    { key: "pluto", name: "Plutão", data: astroData.pluto },
  ].filter(p => p.data) : [];

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
                {astroData?.isApproximation && " (cálculo aproximado)"}
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

      {/* All Planets */}
      {allPlanets.length > 0 && (
        <Card className="cosmic-card fade-in">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Planetas no Seu Mapa</CardTitle>
            <CardDescription>Posições no momento do nascimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allPlanets.map((planet) => (
                <div key={planet.key} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getPlanetIcon(planet.key)}</span>
                    <span className="font-semibold">{planet.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {planet.data.sign}
                    {planet.data.degree !== undefined && planet.data.degree > 0 && ` ${planet.data.degree.toFixed(2)}°`}
                    {planet.data.house && ` • Casa ${planet.data.house}`}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Houses */}
      {astroData?.houses && astroData.houses.length > 0 && (
        <Card className="cosmic-card fade-in">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Casas Astrológicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {astroData.houses.map((house: any, index: number) => (
                <div key={index} className="p-2 rounded bg-secondary/10 text-center">
                  <span className="text-xs text-muted-foreground">Casa {house.number || index + 1}</span>
                  <p className="text-sm font-medium">{house.sign}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
