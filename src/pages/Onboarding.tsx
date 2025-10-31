import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Save birth data to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_place: birthPlace,
        });

      if (profileError) throw profileError;
      
      toast({
        title: "Perfil salvo! ✨",
        description: "Seu mapa cósmico está sendo preparado...",
      });
      
      navigate("/home");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
      <div className="starfield" />
      
      <Card className="w-full max-w-2xl cosmic-card relative z-10 fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-16 h-16 text-primary glow" />
          </div>
          <CardTitle className="font-serif text-4xl mb-2">
            O Universo se Alinhava
          </CardTitle>
          <CardDescription className="text-lg">
            Quando você nasceu... conte-nos sobre esse momento mágico
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5 text-secondary" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="bg-background/50 text-lg p-6"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthTime" className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-accent" />
                Horário de Nascimento
              </Label>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                required
                className="bg-background/50 text-lg p-6"
              />
              <p className="text-sm text-muted-foreground">
                Para cálculos precisos do seu Ascendente
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthPlace" className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5 text-primary" />
                Local de Nascimento
              </Label>
              <Input
                id="birthPlace"
                type="text"
                placeholder="Cidade, Estado, País"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                required
                className="bg-background/50 text-lg p-6"
              />
            </div>

            <div className="cosmic-card p-4 mt-6">
              <p className="text-sm text-center text-muted-foreground">
                ✨ Esses dados são essenciais para calcular seu mapa astral completo 
                e fornecer interpretações personalizadas
              </p>
            </div>
          </CardContent>
          
          <div className="px-6 pb-6">
            <Button 
              type="submit" 
              className="w-full cosmic-button bg-primary hover:bg-primary/90 text-lg py-6"
              disabled={loading}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {loading ? "Calculando seu mapa..." : "Revelar Meu Cosmos"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Onboarding;
