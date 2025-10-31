import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Play, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Rituals = () => {
  const { toast } = useToast();

  const rituals = [
    {
      title: "Meditação Lunar",
      description: "Conecte-se com a energia da Lua",
      duration: "10 min",
      progress: 0,
    },
    {
      title: "Respiração Solar",
      description: "Energize-se com o poder do Sol",
      duration: "5 min",
      progress: 0,
    },
    {
      title: "Reflexão Noturna",
      description: "Contemple as experiências do dia",
      duration: "15 min",
      progress: 0,
    },
  ];

  const handleStartRitual = (title: string) => {
    toast({
      title: "✨ Ritual iniciado",
      description: `${title} - Encontre um lugar tranquilo`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      {/* Header Card */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary glow" />
            Rituais Cósmicos
          </CardTitle>
          <CardDescription>
            Práticas guiadas para conexão interior
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Tracker */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Sua Jornada Hoje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progresso diário</span>
            <span>0/3 rituais</span>
          </div>
          <Progress value={0} className="h-2" />
        </CardContent>
      </Card>

      {/* Ritual Cards */}
      <div className="space-y-4 fade-in">
        {rituals.map((ritual, index) => (
          <Card key={index} className="cosmic-card hover-scale">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-serif text-lg">{ritual.title}</CardTitle>
                  <CardDescription>{ritual.description}</CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">{ritual.duration}</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full gap-2"
                onClick={() => handleStartRitual(ritual.title)}
              >
                <Play className="w-4 h-4" />
                Iniciar Ritual
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Preview */}
      <Card className="cosmic-card fade-in">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Complete rituais para desbloquear selos cósmicos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rituals;
