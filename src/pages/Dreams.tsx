import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Mic, Send, BookOpen, Star, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DreamAnalysis {
  tema: string;
  simbolos: string[];
  mensagem: string;
  ritual_sugerido: string;
}

interface Dream {
  id: string;
  dream_text: string;
  analysis: DreamAnalysis;
  created_at: string;
  is_favorite: boolean;
}

const Dreams = () => {
  const { toast } = useToast();
  const [dreamText, setDreamText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<DreamAnalysis | null>(null);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDreams((data || []) as unknown as Dream[]);
    } catch (error) {
      console.error("Erro ao carregar sonhos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!dreamText.trim()) {
      toast({
        title: "Sonho vazio",
        description: "Conte-me sobre seu sonho para que eu possa interpretá-lo",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dream', {
        body: { dreamText },
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "⏳ Limite atingido",
            description: "Muitas interpretações em pouco tempo. Aguarde alguns minutos.",
            variant: "destructive",
          });
        } else if (error.message.includes('402')) {
          toast({
            title: "💎 Créditos esgotados",
            description: "Adicione créditos ao workspace para continuar usando a IA.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data?.analysis) {
        setCurrentAnalysis(data.analysis);
        setDreamText("");
        loadDreams(); // Reload dreams list
        toast({
          title: "🌙 Análise completa",
          description: "A IA Onírica interpretou seu sonho",
        });
      }
    } catch (error) {
      console.error("Erro ao analisar sonho:", error);
      toast({
        title: "Erro",
        description: "Não foi possível interpretar o sonho. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header Card */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Moon className="w-6 h-6 text-primary glow" />
            Diário de Sonhos
          </CardTitle>
          <CardDescription>
            Converse com a IA Onírica e descubra os símbolos do seu inconsciente
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Dream Input */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Relate seu sonho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Descreva seu sonho com o máximo de detalhes que você lembrar..."
            className="min-h-[150px] resize-none bg-background/50"
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voz
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Send className="w-4 h-4" />
              {isAnalyzing ? "Analisando..." : "Interpretar Sonho"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Analysis */}
      {currentAnalysis && (
        <Card className="cosmic-card fade-in border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Interpretação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tema Principal</p>
              <p className="font-semibold text-primary">{currentAnalysis.tema}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">Símbolos</p>
              <div className="flex flex-wrap gap-2">
                {currentAnalysis.simbolos.map((simbolo, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                    {simbolo}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Mensagem</p>
              <p className="text-sm">{currentAnalysis.mensagem}</p>
            </div>

            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-xs text-muted-foreground mb-1">✨ Ritual Sugerido</p>
              <p className="text-sm">{currentAnalysis.ritual_sugerido}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Dreams */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Sonhos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : dreams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Seus sonhos interpretados aparecerão aqui
            </p>
          ) : (
            <div className="space-y-3">
              {dreams.map((dream) => (
                <div
                  key={dream.id}
                  className="p-4 rounded-lg bg-background/50 border border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-primary">
                      {dream.analysis?.tema || "Sonho"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(dream.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {dream.dream_text}
                  </p>
                  {dream.analysis?.simbolos && (
                    <div className="flex flex-wrap gap-1">
                      {dream.analysis.simbolos.slice(0, 3).map((simbolo, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-primary/5 rounded text-xs">
                          {simbolo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dreams;
