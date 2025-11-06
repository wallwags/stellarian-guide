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

const Home = () => {
  const { toast } = useToast();
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const [transits, setTransits] = useState<Transits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyTransits();
  }, []);

  const loadDailyTransits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-daily-transits');
      
      if (error) throw error;
      if (data?.transits) {
        setTransits(data.transits);
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
      <Card className="cosmic-card fade-in">
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

      {/* Sun & Moon Today */}
      <div className="grid grid-cols-2 gap-4 fade-in">
        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <Sun className="w-8 h-8 text-secondary mb-2" />
            <CardTitle className="font-serif text-lg">Sol em {transits?.sun.sign}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {transits?.sun.message || "Profundidade e transformação"}
            </p>
          </CardContent>
        </Card>

        <Card className="cosmic-card">
          <CardHeader className="pb-3">
            <Moon className="w-8 h-8 text-accent mb-2" />
            <CardTitle className="font-serif text-lg">Lua em {transits?.moon.sign}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {transits?.moon.phase} - {transits?.moon.message || "Intuição amplificada"}
            </p>
          </CardContent>
        </Card>
      </div>

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
