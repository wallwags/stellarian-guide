import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starfield background */}
      <div className="starfield" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 fade-in">
          {/* Logo Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Sparkles className="w-20 h-20 text-primary glow" />
              <Moon className="w-8 h-8 text-accent absolute -top-2 -right-2" />
              <Sun className="w-8 h-8 text-secondary absolute -bottom-2 -left-2" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
            Cosmos
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Descubra seu mapa cósmico e desvende os mistérios do seu universo interior
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="cosmic-card p-6 space-y-3">
              <Sun className="w-10 h-10 text-secondary mx-auto" />
              <h3 className="font-serif text-lg font-semibold">Mapa Astral</h3>
              <p className="text-sm text-muted-foreground">
                Visualize e compreenda seu mapa completo com interpretações personalizadas
              </p>
            </div>
            
            <div className="cosmic-card p-6 space-y-3">
              <Moon className="w-10 h-10 text-accent mx-auto" />
              <h3 className="font-serif text-lg font-semibold">Conselhos Diários</h3>
              <p className="text-sm text-muted-foreground">
                Receba orientações baseadas nos trânsitos cósmicos atuais
              </p>
            </div>
            
            <div className="cosmic-card p-6 space-y-3">
              <Star className="w-10 h-10 text-primary mx-auto" />
              <h3 className="font-serif text-lg font-semibold">IA Onírica</h3>
              <p className="text-sm text-muted-foreground">
                Interprete seus sonhos com análise simbólica profunda
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <Button 
              size="lg" 
              className="cosmic-button text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              onClick={() => navigate("/auth?mode=signup")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Jornada
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              onClick={() => navigate("/auth?mode=login")}
            >
              Já tenho conta
            </Button>
          </div>

          {/* Trust Signal */}
          <p className="text-sm text-muted-foreground mt-8">
            Junte-se a milhares de exploradores espirituais em sua jornada de autoconhecimento
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
