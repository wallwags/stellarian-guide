import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Mic, Send, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dreams = () => {
  const { toast } = useToast();
  const [dreamText, setDreamText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "🌙 Análise completa",
        description: "A IA Onírica interpretou seu sonho",
      });
    }, 2000);
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

      {/* Recent Dreams */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Sonhos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Seus sonhos interpretados aparecerão aqui
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dreams;
