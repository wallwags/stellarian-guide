import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sparkles, Share2, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Transits {
  date: string;
  sun: { sign: string; message: string };
  moon: { sign: string; phase: string; message: string };
  dailyEnergy: string;
  advices: string[];
}

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
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const [transits, setTransits] = useState<Transits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyTransits();
  }, []);

  const loadDailyTransits = async () => {
    setIsLoading(true);
    
    // Try cache first
    const cached = localStorage.getItem('daily_transits_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const SIX_HOURS = 6 * 60 * 60 * 1000;
        
        if (age < SIX_HOURS) {
          console.log("✅ Usando trânsitos do cache");
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
      const { data, error } = await supabase.functions.invoke('get-daily-transits');
      
      if (error) throw error;
      if (data?.transits) {
        setTransits(data.transits);
        
        // Save to cache
        localStorage.setItem('daily_transits_cache', JSON.stringify({
          data: data.transits,
          timestamp: Date.now()
        }));
        
        console.log("✅ Trânsitos atualizados e salvos no cache");
      }
    } catch (error) {
      console.error("Erro ao carregar trânsitos:", error);
      // Fallback to default data
      setTransits({
        date: new Date().toISOString().split('T')[0],
        sun: { sign: "Escorpião", message: "O Sol ilumina temas de transformação" },
        moon: { sign: "Peixes", phase: "Crescente", message: "A Lua traz sensibilidade" },
        dailyEnergy: "Energia de crescimento e intuição",
        advices: [
          "Permita-se sentir todas as emoções que surgirem hoje",
          "O universo conspira a seu favor",
          "Cultive momentos de silêncio interior",
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dailyAdvices = transits?.advices || [
    "A energia de hoje pede introspecção. Reserve um momento para ouvir sua voz interior.",
    "Os trânsitos favorecem novas conexões. Esteja aberto ao inesperado.",
    "Momento propício para cuidar do corpo e da mente. Pratique autocuidado.",
  ];

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
      {/* Daily Energy Card */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary glow" />
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
          <p className="text-lg leading-relaxed text-muted-foreground">
            {transits?.dailyEnergy || "Os astros se alinham para trazer clareza e renovação"}
          </p>
        </CardContent>
      </Card>

      {/* Sol Card - Destaque Visual */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 glow">
            <Sun className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="font-serif text-3xl">
            Sol em {transits?.sun.sign}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {transits?.sun.message || "O Sol ilumina sua autenticidade e propósito de vida"}
          </p>
        </CardContent>
      </Card>

      {/* Lua Card - Destaque Visual com Fase */}
      <Card className="cosmic-card fade-in bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
            <span className="text-6xl">{getMoonPhaseEmoji(transits?.moon.phase)}</span>
          </div>
          <CardTitle className="font-serif text-3xl">
            Lua em {transits?.moon.sign}
          </CardTitle>
          <CardDescription className="text-base">
            Fase: {transits?.moon.phase}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {transits?.moon.message || "A Lua governa suas emoções e intuição"}
          </p>
        </CardContent>
      </Card>

      {/* Advice Carousel */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Conselhos para Hoje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[100px] flex items-center justify-center">
            <p className="text-center text-lg text-muted-foreground leading-relaxed">
              {dailyAdvices[currentAdviceIndex]}
            </p>
          </div>
          
          <div className="flex justify-center gap-2">
            {dailyAdvices.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdviceIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentAdviceIndex 
                    ? "bg-primary w-6" 
                    : "bg-primary/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 justify-center pt-2">
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
    </div>
  );
};

export default Home;
