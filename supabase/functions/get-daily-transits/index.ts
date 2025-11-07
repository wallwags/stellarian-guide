import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get current zodiac sign for a given date
function getCurrentZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const zodiacSigns = [
    { sign: "Capricórnio", endDay: 19, month: 1 },
    { sign: "Aquário", endDay: 18, month: 2 },
    { sign: "Peixes", endDay: 20, month: 3 },
    { sign: "Áries", endDay: 19, month: 4 },
    { sign: "Touro", endDay: 20, month: 5 },
    { sign: "Gêmeos", endDay: 20, month: 6 },
    { sign: "Câncer", endDay: 22, month: 7 },
    { sign: "Leão", endDay: 22, month: 8 },
    { sign: "Virgem", endDay: 22, month: 9 },
    { sign: "Libra", endDay: 22, month: 10 },
    { sign: "Escorpião", endDay: 21, month: 11 },
    { sign: "Sagitário", endDay: 21, month: 12 },
    { sign: "Capricórnio", endDay: 31, month: 12 },
  ];

  for (const zodiac of zodiacSigns) {
    if (month === zodiac.month && day <= zodiac.endDay) {
      return zodiac.sign;
    }
  }
  
  return "Capricórnio";
}

// Get moon phase
function getMoonPhase(date: Date): string {
  const knownNewMoon = new Date('2000-01-06').getTime();
  const currentTime = date.getTime();
  const daysSinceNew = (currentTime - knownNewMoon) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53;
  const phase = (daysSinceNew % lunarCycle) / lunarCycle;

  if (phase < 0.03 || phase > 0.97) return "Nova";
  if (phase < 0.22) return "Crescente";
  if (phase < 0.28) return "Quarto Crescente";
  if (phase < 0.47) return "Crescente Gibosa";
  if (phase < 0.53) return "Cheia";
  if (phase < 0.72) return "Minguante Gibosa";
  if (phase < 0.78) return "Quarto Minguante";
  return "Minguante";
}

// Get moon zodiac sign (cycles every ~2.5 days)
function getMoonSign(date: Date): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const moonCycleDays = 27.3;
  const signIndex = Math.floor((daysSinceEpoch % moonCycleDays) / (moonCycleDays / 12));
  
  return signs[signIndex % 12];
}

// Get rich sun message
function getSunMessage(sign: string): string {
  const messages: Record<string, string> = {
    "Áries": "Sol em Áries desperta coragem, iniciativa e o espírito pioneiro. Hora de começar novos projetos.",
    "Touro": "Sol em Touro convida à estabilidade, prazer sensorial e construção de valores duradouros.",
    "Gêmeos": "Sol em Gêmeos ativa comunicação, curiosidade e conexões sociais vibrantes.",
    "Câncer": "Sol em Câncer ilumina emoções, família e o cuidado com quem você ama.",
    "Leão": "Sol em Leão brilha com criatividade, autoexpressão e generosidade de coração.",
    "Virgem": "Sol em Virgem traz organização, análise e aprimoramento dos detalhes.",
    "Libra": "Sol em Libra busca equilíbrio, harmonia e conexões autênticas.",
    "Escorpião": "Sol em Escorpião mergulha em transformação, intensidade e mistérios profundos.",
    "Sagitário": "Sol em Sagitário expande horizontes, busca significado e aventura.",
    "Capricórnio": "Sol em Capricórnio constrói estruturas, metas de longo prazo e responsabilidade.",
    "Aquário": "Sol em Aquário inova, liberta e conecta com a visão coletiva.",
    "Peixes": "Sol em Peixes dissolve fronteiras, mergulha na compaixão e intuição espiritual."
  };
  return messages[sign] || `Sol em ${sign} ilumina sua jornada única.`;
}

// Get rich moon message
function getMoonMessage(sign: string, phase: string): string {
  const baseMessages: Record<string, string> = {
    "Áries": "impulsividade emocional e coragem para sentir",
    "Touro": "necessidade de conforto, segurança e prazer",
    "Gêmeos": "mente ágil e curiosidade emocional",
    "Câncer": "sensibilidade profunda e necessidade de acolhimento",
    "Leão": "expressão dramática das emoções e desejo de reconhecimento",
    "Virgem": "análise dos sentimentos e busca por ordem emocional",
    "Libra": "equilíbrio emocional e busca por harmonia relacional",
    "Escorpião": "intensidade emocional e transformação profunda",
    "Sagitário": "otimismo emocional e busca por significado",
    "Capricórnio": "controle emocional e responsabilidade afetiva",
    "Aquário": "distanciamento emocional e perspectiva racional",
    "Peixes": "empatia profunda e sensibilidade transcendental"
  };
  
  const phasePrefix = phase === "Cheia" 
    ? "Na Lua Cheia," 
    : phase === "Nova" 
    ? "Na Lua Nova," 
    : "Nesta fase lunar,";
  
  return `${phasePrefix} Lua em ${sign} traz ${baseMessages[sign] || "conexão emocional única"}.`;
}

// Generate daily energy message based on transits
function getDailyEnergyMessage(sunSign: string, moonPhase: string, moonSign: string): string {
  const energyMessages = {
    "Nova": "🌑 Energia de recomeços e intenções. Perfeito para plantar sementes de novos projetos.",
    "Crescente": "🌒 Energia de crescimento e ação. Hora de expandir o que foi iniciado.",
    "Quarto Crescente": "🌓 Energia de desafios e decisões. Momento de superar obstáculos.",
    "Crescente Gibosa": "🌔 Energia de refinamento. Ajuste os detalhes antes da manifestação completa.",
    "Cheia": "🌕 Energia de culminação e celebração. Colha os frutos do que plantou.",
    "Minguante Gibosa": "🌖 Energia de gratidão e compartilhamento. Divida suas conquistas.",
    "Quarto Minguante": "🌗 Energia de liberação e perdão. Deixe ir o que não serve mais.",
    "Minguante": "🌘 Energia de introspecção e descanso. Prepare-se para o novo ciclo.",
  };

  return energyMessages[moonPhase as keyof typeof energyMessages] || energyMessages["Nova"];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    
    // Calculate current transits
    const sunSign = getCurrentZodiacSign(now);
    const moonPhase = getMoonPhase(now);
    const moonSign = getMoonSign(now);
    
    const dailyEnergy = getDailyEnergyMessage(sunSign, moonPhase, moonSign);
    
    // Generate daily advice based on current energies
    const advices = [
      `Com o Sol em ${sunSign}, explore sua autenticidade e propósito interior.`,
      `A Lua em ${moonSign} convida você a sintonizar suas emoções com intuição.`,
      `Na fase ${moonPhase}, ${dailyEnergy.split('.')[1]?.trim() || 'conecte-se com o momento presente'}.`,
    ];

    const transits = {
      date: now.toISOString().split('T')[0],
      sun: {
        sign: sunSign,
        message: getSunMessage(sunSign),
      },
      moon: {
        sign: moonSign,
        phase: moonPhase,
        message: getMoonMessage(moonSign, moonPhase),
      },
      dailyEnergy,
      advices,
      calculatedAt: now.toISOString(),
    };

    return new Response(
      JSON.stringify({ transits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro ao calcular trânsitos:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
