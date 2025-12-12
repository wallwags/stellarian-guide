import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, Bookmark, Droplets, Wind, Mountain, Flame, MessageCircle, Users, Heart, Briefcase, Home as HomeIcon, Brain, Coins, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";

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

const Home = () => {
  const { toast } = useToast();
  const [transits, setTransits] = useState<Transit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransitInsights();
  }, []);

  const loadTransitInsights = async () => {
    setIsLoading(true);
    
    // Try cache first (12 hours)
    const cached = localStorage.getItem('transit_insights_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const TWELVE_HOURS = 12 * 60 * 60 * 1000;
        
        if (age < TWELVE_HOURS) {
          console.log("✅ Usando insights do cache");
          setTransits(data);
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
        
        // Save to cache
        localStorage.setItem('transit_insights_cache', JSON.stringify({
          data: data.transits,
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
          message: "Mercúrio em Sagitário expande sua mente e traz sede por conhecimento. É momento de explorar novas ideias, filosofias e perspectivas que ampliem sua visão de mundo.",
          advice: "Inicie aquele curso ou leitura que você vem adiando. Viagens curtas ou conversas com pessoas de culturas diferentes trarão insights valiosos.",
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
          message: "Vênus em Aquário traz um desejo de liberdade nos relacionamentos. Você valoriza conexões autênticas e não convencionais.",
          advice: "Permita-se conhecer pessoas diferentes do seu círculo habitual. Amizades podem se transformar em algo mais profundo.",
          element: "ar",
          lifeArea: "relacionamentos"
        },
        {
          planet: "Marte",
          icon: "♂️",
          sign: "Leão",
          degree: "23°45'",
          startDate: "2025-11-28",
          endDate: "2026-01-10",
          message: "Marte em Leão desperta sua coragem criativa e desejo de brilhar. Sua energia está alta para liderar projetos e expressar sua individualidade.",
          advice: "Canalize essa energia em projetos criativos ou esportivos. Evite conflitos de ego desnecessários.",
          element: "fogo",
          lifeArea: "carreira"
        },
        {
          planet: "Júpiter",
          icon: "♃",
          sign: "Gêmeos ℞",
          degree: "18°56'",
          startDate: "2025-10-15",
          endDate: "2026-02-20",
          message: "Júpiter retrógrado em Gêmeos pede revisão de crenças e expansão através do estudo interno.",
          advice: "Revise seus projetos de aprendizado. O conhecimento que você já possui precisa ser integrado antes de buscar mais.",
          element: "ar",
          lifeArea: "autoconhecimento"
        },
        {
          planet: "Saturno",
          icon: "♄",
          sign: "Peixes",
          degree: "2°34'",
          startDate: "2025-09-01",
          endDate: "2026-05-30",
          message: "Saturno em Peixes traz responsabilidade com sua vida espiritual e emocional. Estrutura e disciplina se encontram com intuição.",
          advice: "Crie uma rotina de práticas contemplativas. Meditação ou terapia ajudarão a dar forma aos seus sonhos.",
          element: "agua",
          lifeArea: "espiritualidade"
        }
      ]);
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
            Trânsitos de Hoje
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
          <p className="text-base text-muted-foreground">
            Conselhos práticos baseados nos movimentos planetários atuais
          </p>
        </CardContent>
      </Card>

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
                <p className="text-sm font-medium text-primary mb-1">💡 Conselho Prático</p>
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
                <p className="text-sm font-medium text-primary mb-1">💡 Conselho Prático</p>
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
                com conselhos personalizados para cada área da sua vida.
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
