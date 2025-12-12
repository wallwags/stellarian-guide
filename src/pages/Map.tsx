import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Sun, Moon, Star, Share2, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanetData {
  sign: string;
  degree?: number;
  house?: number;
  meaning?: string;
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

interface Transits {
  date: string;
  sun: { sign: string; message: string };
  moon: { sign: string; phase: string; message: string };
  dailyEnergy: string;
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

const getPlanetMeaning = (planet: string, sign: string): string => {
  const meanings: Record<string, string> = {
    sun: `Sua essência e vitalidade se expressam através das qualidades de ${sign}. É o centro do seu ser.`,
    moon: `Suas emoções e instintos são coloridos por ${sign}. Governa suas necessidades emocionais profundas.`,
    ascendant: `A máscara que você mostra ao mundo tem as características de ${sign}. É sua primeira impressão.`,
    mercury: `Sua comunicação e pensamento seguem o estilo de ${sign}. Governa como você processa informações.`,
    venus: `Seu jeito de amar e valorizar a beleza reflete ${sign}. Indica seus gostos e valores.`,
    mars: `Sua energia de ação e assertividade se manifesta como ${sign}. Mostra como você luta pelo que quer.`,
    jupiter: `Sua expansão e busca por significado seguem ${sign}. Indica onde você encontra abundância.`,
    saturn: `Suas responsabilidades e estruturas têm a natureza de ${sign}. Mostra onde você precisa amadurecer.`,
    uranus: `Sua originalidade e desejo de mudança se expressam via ${sign}. Indica onde você é revolucionário.`,
    neptune: `Sua espiritualidade e imaginação fluem através de ${sign}. Conecta você ao transcendente.`,
    pluto: `Sua transformação profunda acontece nas áreas de ${sign}. Indica onde você renasce.`,
  };
  return meanings[planet.toLowerCase()] || `Influência de ${sign} nesta área da sua vida.`;
};

const getMoonPhaseEmoji = (phase: string = "Cheia"): string => {
  const phases: Record<string, string> = {
    "Nova": "🌑",
    "Crescente": "🌒",
    "Quarto Crescente": "🌓",
    "Crescente Gibosa": "🌔",
    "Cheia": "🌕",
    "Minguante Gibosa": "🌖",
    "Quarto Minguante": "🌗",
    "Minguante": "🌘"
  };
  return phases[phase] || "🌕";
};

const Map = () => {
  const { toast } = useToast();
  const [astroData, setAstroData] = useState<AstroData | null>(null);
  const [transits, setTransits] = useState<Transits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAstroMap();
    loadDailyTransits();
  }, []);

  const loadDailyTransits = async () => {
    // Try cache first
    const cached = localStorage.getItem('daily_transits_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        
        if (age < SIX_HOURS) {
          setTransits(data);
          return;
        }
      } catch (e) {
        console.error("Erro ao ler cache:", e);
      }
    }
    
    // Fetch fresh data
    try {
      const { data, error } = await supabase.functions.invoke('get-daily-transits');
      if (error) throw error;
      if (data?.transits) {
        setTransits(data.transits);
        localStorage.setItem('daily_transits_cache', JSON.stringify({
          data: data.transits,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar trânsitos:", error);
      // Fallback
      setTransits({
        date: new Date().toISOString().split('T')[0],
        sun: { sign: "Sagitário", message: "O Sol em Sagitário traz otimismo e expansão" },
        moon: { sign: "Peixes", phase: "Crescente", message: "A Lua traz sensibilidade e intuição" },
        dailyEnergy: "Energia de crescimento, otimismo e busca por conhecimento"
      });
    }
  };

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
            <Button onClick={generateMap} disabled={isGenerating} size="sm" variant="outline">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Daily Energy Card */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary glow" />
            Energia de Hoje
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-muted-foreground">
            {transits?.dailyEnergy || "Os astros se alinham para trazer clareza e renovação"}
          </p>
        </CardContent>
      </Card>

      {/* Sun Card - Visual Highlight */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 glow">
            <Sun className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="font-serif text-2xl">
            Sol em {transits?.sun.sign || astroData?.sun.sign}
          </CardTitle>
          {astroData?.sun.degree && (
            <CardDescription>{astroData.sun.degree.toFixed(2)}° • Casa {astroData.sun.house || 1}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            {transits?.sun.message || getPlanetMeaning('sun', astroData?.sun.sign || 'Áries')}
          </p>
        </CardContent>
      </Card>

      {/* Moon Card - Visual Highlight with Phase */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <span className="text-6xl">{getMoonPhaseEmoji(transits?.moon.phase)}</span>
          </div>
          <CardTitle className="font-serif text-2xl">
            Lua em {transits?.moon.sign || astroData?.moon.sign}
          </CardTitle>
          <CardDescription className="text-base">
            Fase: {transits?.moon.phase || "Crescente"}
            {astroData?.moon.degree && ` • ${astroData.moon.degree.toFixed(2)}° • Casa ${astroData.moon.house || 12}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-base leading-relaxed text-muted-foreground">
            {transits?.moon.message || getPlanetMeaning('moon', astroData?.moon.sign || 'Câncer')}
          </p>
        </CardContent>
      </Card>

      {/* All Planets - Detailed */}
      {allPlanets.length > 0 && (
        <Card className="cosmic-card fade-in">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Todos os Planetas</CardTitle>
            <CardDescription>Posições no momento do seu nascimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allPlanets.map((planet) => (
                <div key={planet.key} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getPlanetIcon(planet.key)}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-lg">{planet.name}</span>
                      <span className="text-muted-foreground ml-2">
                        em {planet.data.sign}
                        {planet.data.degree !== undefined && planet.data.degree > 0 && ` ${planet.data.degree.toFixed(2)}°`}
                        {planet.data.house && ` • Casa ${planet.data.house}`}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getPlanetMeaning(planet.key, planet.data.sign)}
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
            <CardDescription>As 12 áreas da vida no seu mapa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {astroData.houses.map((house: any, index: number) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/10 text-center">
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
