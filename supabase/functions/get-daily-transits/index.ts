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
        message: `O Sol em ${sunSign} ilumina temas de transformação e autenticidade.`,
      },
      moon: {
        sign: moonSign,
        phase: moonPhase,
        message: `A Lua ${moonPhase} em ${moonSign} traz ${dailyEnergy.toLowerCase().split('.')[0]?.replace('🌑', '').replace('🌒', '').replace('🌓', '').replace('🌔', '').replace('🌕', '').replace('🌖', '').replace('🌗', '').replace('🌘', '').trim()}.`,
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
