import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Sun, Moon, Share2, Loader2, RefreshCw } from "lucide-react";
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

const PLANET_INFO: Record<string, { name: string; icon: string; meaning: (sign: string) => string }> = {
  sun: {
    name: "Sol",
    icon: "☀️",
    meaning: (sign) => `Sua essência e vitalidade se expressam através das qualidades de ${sign}. O Sol representa seu núcleo, sua identidade mais profunda, aquilo que você veio brilhar nesta vida. Em ${sign}, você encontra força na energia deste signo.`
  },
  moon: {
    name: "Lua",
    icon: "🌙",
    meaning: (sign) => `Suas emoções e instintos são coloridos por ${sign}. A Lua governa suas necessidades emocionais profundas, memórias ancestrais e como você nutre a si mesmo e aos outros. Em ${sign}, suas emoções fluem com a natureza deste signo.`
  },
  ascendant: {
    name: "Ascendente",
    icon: "⬆️",
    meaning: (sign) => `A máscara que você mostra ao mundo tem as características de ${sign}. O Ascendente é sua primeira impressão, como os outros te veem antes de conhecer sua essência. Em ${sign}, você se apresenta com as qualidades deste signo.`
  },
  mercury: {
    name: "Mercúrio",
    icon: "☿️",
    meaning: (sign) => `Sua comunicação e pensamento seguem o estilo de ${sign}. Mercúrio governa como você processa informações, aprende, ensina e se expressa verbalmente. Em ${sign}, sua mente opera com a lógica e ritmo deste signo.`
  },
  venus: {
    name: "Vênus",
    icon: "♀️",
    meaning: (sign) => `Seu jeito de amar e valorizar a beleza reflete ${sign}. Vênus indica seus gostos, valores estéticos, como você dá e recebe afeto. Em ${sign}, você ama e aprecia segundo as qualidades deste signo.`
  },
  mars: {
    name: "Marte",
    icon: "♂️",
    meaning: (sign) => `Sua energia de ação e assertividade se manifesta como ${sign}. Marte mostra como você luta pelo que quer, sua coragem e impulso vital. Em ${sign}, você age e compete com o estilo deste signo.`
  },
  jupiter: {
    name: "Júpiter",
    icon: "♃",
    meaning: (sign) => `Sua expansão e busca por significado seguem ${sign}. Júpiter indica onde você encontra abundância, sorte e crescimento. Em ${sign}, você expande e busca sabedoria através das qualidades deste signo.`
  },
  saturn: {
    name: "Saturno",
    icon: "♄",
    meaning: (sign) => `Suas responsabilidades e estruturas têm a natureza de ${sign}. Saturno mostra onde você precisa amadurecer, seus limites e lições kármicas. Em ${sign}, você constrói disciplina e maturidade segundo este signo.`
  },
  uranus: {
    name: "Urano",
    icon: "♅",
    meaning: (sign) => `Sua originalidade e desejo de mudança se expressam via ${sign}. Urano indica onde você é revolucionário, inovador e busca liberdade. Em ${sign}, você rompe padrões com a energia deste signo.`
  },
  neptune: {
    name: "Netuno",
    icon: "♆",
    meaning: (sign) => `Sua espiritualidade e imaginação fluem através de ${sign}. Netuno conecta você ao transcendente, aos sonhos e à arte. Em ${sign}, sua sensibilidade mística se expressa pelas qualidades deste signo.`
  },
  pluto: {
    name: "Plutão",
    icon: "♇",
    meaning: (sign) => `Sua transformação profunda acontece nas áreas de ${sign}. Plutão indica onde você renasce, enfrenta sombras e encontra poder pessoal. Em ${sign}, você se transforma radicalmente segundo este signo.`
  }
};

const HOUSE_MEANINGS = [
  "Identidade, aparência física, primeira impressão",
  "Recursos, valores pessoais, dinheiro",
  "Comunicação, irmãos, viagens curtas",
  "Lar, família, raízes emocionais",
  "Criatividade, romance, filhos, diversão",
  "Saúde, rotina, trabalho diário",
  "Relacionamentos, parcerias, casamento",
  "Transformação, heranças, sexualidade",
  "Filosofia, viagens longas, educação superior",
  "Carreira, reputação, status social",
  "Amizades, grupos, esperanças",
  "Espiritualidade, inconsciente, isolamento"
];

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
        setAstroData({
          sun: { sign: profile.sun_sign, house: 1, degree: 0 },
          moon: { sign: profile.moon_sign || "Câncer", house: 4, degree: 0 },
          ascendant: { sign: profile.ascendant_sign || "Áries", degree: 0 },
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

  // Build planet list from astroData
  const planetKeys = ["sun", "moon", "ascendant", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  const planets = planetKeys
    .filter(key => astroData?.[key as keyof AstroData])
    .map(key => ({
      key,
      data: astroData![key as keyof AstroData] as PlanetData,
      info: PLANET_INFO[key]
    }));

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

      {/* Big Three - Sun, Moon, Ascendant */}
      <div className="grid gap-4">
        {/* Sun Card */}
        {astroData?.sun && (
          <Card className="cosmic-card fade-in bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center glow">
                  <Sun className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="font-serif text-2xl">Sol em {astroData.sun.sign}</CardTitle>
                  <CardDescription className="text-base">
                    {astroData.sun.degree !== undefined && astroData.sun.degree > 0 && `${astroData.sun.degree.toFixed(1)}° • `}
                    Casa {astroData.sun.house || 1}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                {PLANET_INFO.sun.meaning(astroData.sun.sign)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Moon Card */}
        {astroData?.moon && (
          <Card className="cosmic-card fade-in bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Moon className="w-12 h-12 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="font-serif text-2xl">Lua em {astroData.moon.sign}</CardTitle>
                  <CardDescription className="text-base">
                    {astroData.moon.degree !== undefined && astroData.moon.degree > 0 && `${astroData.moon.degree.toFixed(1)}° • `}
                    Casa {astroData.moon.house || 4}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                {PLANET_INFO.moon.meaning(astroData.moon.sign)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Ascendant Card */}
        {astroData?.ascendant && (
          <Card className="cosmic-card fade-in bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-3xl">⬆️</span>
                </div>
                <div>
                  <CardTitle className="font-serif text-2xl">Ascendente em {astroData.ascendant.sign}</CardTitle>
                  <CardDescription className="text-base">
                    {astroData.ascendant.degree !== undefined && astroData.ascendant.degree > 0 && `${astroData.ascendant.degree.toFixed(1)}°`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                {PLANET_INFO.ascendant.meaning(astroData.ascendant.sign)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Other Planets */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Posições Planetárias</CardTitle>
          <CardDescription>Todos os planetas no momento do seu nascimento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {planets
            .filter(p => !["sun", "moon", "ascendant"].includes(p.key))
            .map((planet) => (
              <div key={planet.key} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{planet.info.icon}</span>
                  <div className="flex-1">
                    <span className="font-serif font-semibold text-lg">{planet.info.name}</span>
                    <span className="text-muted-foreground ml-2">
                      em {planet.data.sign}
                      {planet.data.degree !== undefined && planet.data.degree > 0 && ` • ${planet.data.degree.toFixed(1)}°`}
                      {planet.data.house && ` • Casa ${planet.data.house}`}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {planet.info.meaning(planet.data.sign)}
                </p>
              </div>
            ))}
          
          {planets.filter(p => !["sun", "moon", "ascendant"].includes(p.key)).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Clique em atualizar para calcular todos os planetas</p>
              <Button onClick={generateMap} disabled={isGenerating} className="mt-4">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Calcular Mapa Completo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Houses */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Casas Astrológicas</CardTitle>
          <CardDescription>As 12 áreas da vida no seu mapa</CardDescription>
        </CardHeader>
        <CardContent>
          {astroData?.houses && astroData.houses.length > 0 ? (
            <div className="grid gap-3">
              {astroData.houses.map((house: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{house.number || index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{house.sign}</span>
                      {house.degree && <span className="text-xs text-muted-foreground">{house.degree.toFixed(1)}°</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{HOUSE_MEANINGS[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/10 text-center">
                  <span className="text-xs text-muted-foreground">Casa {i + 1}</span>
                  <p className="text-sm font-medium text-muted-foreground/50">—</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
        <Button variant="outline" className="flex-1 gap-2" onClick={generateMap} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Recalcular Mapa
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
