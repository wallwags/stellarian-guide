import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transit {
  planet: string;
  icon: string;
  sign: string;
  degree: string;
  startDate: string;
  endDate: string;
  message: string;
  advice: string;
}

const TransitInsights = () => {
  const { toast } = useToast();
  const [transits, setTransits] = useState<Transit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const FREE_TRANSITS = 2; // Número de trânsitos completos visíveis

  useEffect(() => {
    loadTransitInsights();
  }, []);

  const loadTransitInsights = async () => {
    setIsLoading(true);
    
    // Tentar cache primeiro (12 horas)
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
    
    // Buscar dados novos
    try {
      const { data, error } = await supabase.functions.invoke('get-transit-insights');
      
      if (error) {
        console.error("Erro ao carregar insights:", error);
        throw error;
      }
      
      if (data?.transits) {
        setTransits(data.transits);
        
        // Salvar no cache
        localStorage.setItem('transit_insights_cache', JSON.stringify({
          data: data.transits,
          timestamp: Date.now()
        }));
        
        console.log("✅ Insights atualizados e salvos no cache");
      }
    } catch (error: any) {
      console.error("Erro ao carregar insights:", error);
      
      // Mostrar toast específico baseado no erro
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        toast({
          title: "⏳ Muitas requisições",
          description: "Por favor, aguarde alguns minutos antes de tentar novamente.",
          variant: "destructive",
        });
      } else if (error.message?.includes("402") || error.message?.includes("créditos")) {
        toast({
          title: "💳 Créditos insuficientes",
          description: "Adicione créditos em Settings → Workspace → Usage.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erro ao carregar",
          description: "Não foi possível buscar os trânsitos. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    toast({
      title: "🌟 Upgrade em breve!",
      description: "Em breve você poderá acessar análises completas de todos os trânsitos.",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card className="cosmic-card">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Consultando os trânsitos planetários...</p>
        </CardContent>
      </Card>
    );
  }

  if (!transits || transits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {transits.slice(0, FREE_TRANSITS).map((transit, index) => (
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
                  <CardTitle className="font-serif text-xl">
                    {transit.planet} em {transit.sign}
                  </CardTitle>
                  <CardDescription>
                    {transit.degree} • {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base leading-relaxed text-foreground/90">
              {transit.message}
            </p>
            <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-3">
              <p className="text-sm font-medium text-primary mb-1">💡 Conselho Prático</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {transit.advice}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {transits.slice(FREE_TRANSITS, FREE_TRANSITS + 2).map((transit, index) => (
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
                    {transit.degree} • {formatDate(transit.startDate)} - {formatDate(transit.endDate)}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base leading-relaxed text-foreground/90 blur-[3px]">
              {transit.message.substring(0, 50)}...
            </p>
            <div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-3 blur-[4px]">
              <p className="text-sm font-medium text-primary mb-1">💡 Conselho Prático</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {transit.advice.substring(0, 40)}...
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      {transits.length > FREE_TRANSITS && (
        <Card className="cosmic-card border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="py-8 text-center space-y-4">
            <Lock className="w-12 h-12 mx-auto text-primary glow" />
            <div>
              <h3 className="text-xl font-serif mb-2">Desbloqueie Todos os Trânsitos</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Acesse análises completas de todos os {transits.length} trânsitos planetários, 
                com conselhos personalizados e insights profundos para o seu momento.
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

export default TransitInsights;
