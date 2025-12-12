import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Bookmark, Droplets, Wind, Mountain, Flame, MessageCircle, Users, Heart, Briefcase, Home as HomeIcon, Brain, Coins, Compass, Sun, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Transit {
  planet: string;
  icon: string;
  sign: string;
  degree: string;
  startDate: string;
  endDate: string;
  message: string;
  advice: string;
  element: "agua" | "ar" | "terra" | "fogo";
  lifeArea: string;
}

interface DailyLuminary {
  sign: string;
  degree: number;
  startDate: string;
  endDate: string;
  message: string;
  deities: { pantheon: string; deity: string }[];
}

interface DailyData {
  sun: DailyLuminary;
  moon: DailyLuminary & { phase: string };
}

const elementIcons: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  agua: { icon: Droplets, label: "Emocional", color: "text-blue-400" },
  ar: { icon: Wind, label: "Mental", color: "text-cyan-400" },
  terra: { icon: Mountain, label: "Material", color: "text-amber-600" },
  fogo: { icon: Flame, label: "Espiritual", color: "text-orange-500" },
};

const lifeAreaIcons: Record<string, { icon: React.ElementType; label: string }> = {
  comunicacao: { icon: MessageCircle, label: "Comunicação" },
  familia: { icon: HomeIcon, label: "Família" },
  relacionamentos: { icon: Heart, label: "Relacionamentos" },
  carreira: { icon: Briefcase, label: "Carreira" },
  amizades: { icon: Users, label: "Amizades" },
  autoconhecimento: { icon: Brain, label: "Autoconhecimento" },
  financas: { icon: Coins, label: "Finanças" },
  espiritualidade: { icon: Compass, label: "Espiritualidade" },
};

const FREE_TRANSITS = 2;

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

const Home = () => {
  const { toast } = useToast();
  const [transits, setTransits] = useState<Transit[]>([]);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransitInsights();
  }, []);

  const loadTransitInsights = async () => {
    setIsLoading(true);
    
    // Try cache first (12 hours)
    const cached = localStorage.getItem('transit_insights_v2_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        
        if (age < TWELVE_HOURS) {
          console.log("✅ Usando insights do cache");
          setTransits(data.transits || []);
          setDailyData(data.daily || null);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Erro ao ler cache:", e);
      }
    }
    
    // Fetch fresh data
    try {
      const { data, error } = await supabase.functions.invoke('get-transit-insights');
      
      if (error) throw error;
      
      if (data?.transits) {
        setTransits(data.transits);
        setDailyData(data.daily || null);
        
        // Save to cache
        localStorage.setItem('transit_insights_v2_cache', JSON.stringify({
          data: { transits: data.transits, daily: data.daily },
          timestamp: Date.now()
        }));
        
        console.log("✅ Insights atualizados e salvos no cache");
      }
    } catch (error: any) {
      console.error("Erro ao carregar insights:", error);
      
      // Fallback data
      setTransits([
        {
          planet: "Mercúrio",
          icon: "☿️",
          sign: "Sagitário",
          degree: "15°23'",
          startDate: "2025-12-05",
          endDate: "2025-12-24",
          message: "Mercúrio em Sagitário expande sua mente e traz sede por conhecimento.",
          advice: "Inicie aquele curso ou leitura que você vem adiando.",
          element: "fogo",
          lifeArea: "comunicacao"
        },
        {
          planet: "Vênus",
          icon: "♀️",
          sign: "Aquário",
          degree: "8°12'",
          startDate: "2025-12-07",
          endDate: "2026-01-03",
          message: "Vênus em Aquário traz desejo de liberdade nos relacionamentos.",
          advice: "Permita-se conhecer pessoas diferentes do seu círculo habitual.",
          element: "ar",
          lifeArea: "relacionamentos"
        }
      ]);
      
      setDailyData({
        sun: {
          sign: "Sagitário",
          degree: 21,
          startDate: "2025-11-22",
          endDate: "2025-12-21",
          message: "O Sol em Sagitário ilumina o caminho da expansão, aventura e busca por significado.",
          deities: [
            { pantheon: "Africano", deity: "Oxóssi" },
            { pantheon: "Grego", deity: "Zeus" },
            { pantheon: "Egípcio", deity: "Rá" },
            { pantheon: "Hindu", deity: "Vishnu" },
            { pantheon: "Nórdico", deity: "Odin" }
          ]
        },
        moon: {
          sign: "Peixes",
          degree: 12,
          startDate: "2025-12-11",
          endDate: "2025-12-13",
          phase: "Crescente",
          message: "A Lua em Peixes desperta sua intuição e sensibilidade emocional.",
          deities: [
            { pantheon: "Africano", deity: "Iemanjá" },
            { pantheon: "Grego", deity: "Poseidon" },
            { pantheon: "Egípcio", deity: "Ísis" },
            { pantheon: "Hindu", deity: "Chandra" },
            { pantheon: "Nórdico", deity: "Freyja" }
          ]
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleSave = () => {
    toast({
      title: "✨ Conselho salvo",
      description: "Adicionado aos seus favoritos cósmicos",
    });
  };

  const handleShare = () => {
    toast({
      title: "🌟 Compartilhando energia",
      description: "Sua mensagem foi lançada ao cosmos",
    });
  };

  const handleUpgrade = () => {
    toast({
      title: "🌟 Upgrade em breve!",
      description: "Em breve você poderá acessar análises completas de todos os trânsitos.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        <Card className="cosmic-card">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Consultando o cosmos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary glow" />
            Meu Dia
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            })}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sun of Today Card */}
      {dailyData?.sun && (
        <Card className="cosmic-card fade-in bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center glow">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="font-serif text-xl">Sol em {dailyData.sun.sign}</CardTitle>
                <CardDescription>
                  {dailyData.sun.degree}° • {formatDate(dailyData.sun.startDate)} - {formatDate(dailyData.sun.endDate)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed text-foreground/90">
              {dailyData.sun.message}
            </p>
            
            {/* Deities Table */}
            <div className="bg-amber-500/5 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Panteões com energia similar:</p>
              <div className="flex flex-wrap gap-2">
                {dailyData.sun.deities.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {d.pantheon}: {d.deity}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moon of Today Card */}
      {dailyData?.moon && (
        <Card className="cosmic-card fade-in bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center">
                <span className="text-4xl">{getMoonPhaseEmoji(dailyData.moon.phase)}</span>
              </div>
              <div className="flex-1">
                <CardTitle className="font-serif text-xl">Lua em {dailyData.moon.sign}</CardTitle>
                <CardDescription>
                  {dailyData.moon.phase} • {dailyData.moon.degree}° • {formatDate(dailyData.moon.startDate)} - {formatDate(dailyData.moon.endDate)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed text-foreground/90">
              {dailyData.moon.message}
            </p>
            
            {/* Deities Table */}
            <div className="bg-indigo-500/5 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Panteões com energia similar:</p>
              <div className="flex flex-wrap gap-2">
                {dailyData.moon.deities.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {d.pantheon}: {d.deity}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transits Section Header */}
      <h2 className="font-serif text-lg text-muted-foreground pt-4">Trânsitos Importantes</h2>

      {/* Free Transit Cards */}
      {transits.slice(0, FREE_TRANSITS).map((transit, index) => {
        const elementData = elementIcons[transit.element] || elementIcons.fogo;
        const areaData = lifeAreaIcons[transit.lifeArea] || lifeAreaIcons.autoconhecimento;
        const ElementIcon = elementData.icon;
        const AreaIcon = areaData.icon;

        return (
          <Card 
            key={index} 
            className="cosmic-card fade-in hover-scale"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{transit.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-serif text-xl">
                        {transit.planet} em {transit.sign}
                      </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-3 mt-1">
                      <span>{formatDate(transit.startDate)} - {formatDate(transit.endDate)}</span>
                    </CardDescription>
                  </div>
                </div>
                {/* Category Icons */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 ${elementData.color}`}>
                    <ElementIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{elementData.label}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 text-muted-foreground">
                    <AreaIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{areaData.label}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed text-foreground/90">
                {transit.message}
              </p>
              <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-3">
                <p className="text-sm font-medium text-primary mb-1">💡 Conselho Personalizado</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {transit.advice}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Locked Transit Cards with Fade */}
      {transits.slice(FREE_TRANSITS, FREE_TRANSITS + 2).map((transit, index) => {
        const elementData = elementIcons[transit.element] || elementIcons.fogo;
        const areaData = lifeAreaIcons[transit.lifeArea] || lifeAreaIcons.autoconhecimento;
        const ElementIcon = elementData.icon;
        const AreaIcon = areaData.icon;

        return (
          <Card 
            key={FREE_TRANSITS + index} 
            className="cosmic-card fade-in relative overflow-hidden"
            style={{ animationDelay: `${(FREE_TRANSITS + index) * 100}ms` }}
          >
            <div className="transit-fade-overlay" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl blur-sm">{transit.icon}</span>
                  <div>
                    <CardTitle className="font-serif text-xl blur-[2px]">
                      {transit.planet} em {transit.sign}
                    </CardTitle>
                    <CardDescription className="blur-sm">
                      {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 blur-sm">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 ${elementData.color}`}>
                    <ElementIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{elementData.label}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 text-muted-foreground">
                    <AreaIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{areaData.label}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-base leading-relaxed text-foreground/90 blur-[3px]">
                {transit.message.substring(0, 60)}...
              </p>
              <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-3 blur-[4px]">
                <p className="text-sm font-medium text-primary mb-1">💡 Conselho Personalizado</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {transit.advice.substring(0, 40)}...
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Upgrade CTA */}
      {transits.length > FREE_TRANSITS && (
        <Card className="cosmic-card border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="py-8 text-center space-y-4">
            <Lock className="w-12 h-12 mx-auto text-primary glow" />
            <div>
              <h3 className="text-xl font-serif mb-2">Desbloqueie Todos os Trânsitos</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Acesse análises completas de todos os {transits.length} trânsitos planetários, 
                com conselhos personalizados baseados no seu mapa natal.
              </p>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="cosmic-button"
              size="lg"
            >
              Fazer Upgrade ✨
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
