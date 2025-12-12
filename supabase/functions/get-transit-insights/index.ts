import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get sun sign for current date
function getSunSign(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { sign: "Capricórnio", start: [12, 22], end: [1, 19] },
    { sign: "Aquário", start: [1, 20], end: [2, 18] },
    { sign: "Peixes", start: [2, 19], end: [3, 20] },
    { sign: "Áries", start: [3, 21], end: [4, 19] },
    { sign: "Touro", start: [4, 20], end: [5, 20] },
    { sign: "Gêmeos", start: [5, 21], end: [6, 20] },
    { sign: "Câncer", start: [6, 21], end: [7, 22] },
    { sign: "Leão", start: [7, 23], end: [8, 22] },
    { sign: "Virgem", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Escorpião", start: [10, 23], end: [11, 21] },
    { sign: "Sagitário", start: [11, 22], end: [12, 21] },
  ];
  
  for (const s of signs) {
    if ((month === s.start[0] && day >= s.start[1]) || (month === s.end[0] && day <= s.end[1])) {
      return {
        sign: s.sign,
        degree: day % 30,
        startDate: `${date.getFullYear()}-${String(s.start[0]).padStart(2, '0')}-${String(s.start[1]).padStart(2, '0')}`,
        endDate: `${date.getFullYear()}-${String(s.end[0]).padStart(2, '0')}-${String(s.end[1]).padStart(2, '0')}`
      };
    }
  }
  
  return { sign: "Sagitário", degree: 21, startDate: "2025-11-22", endDate: "2025-12-21" };
}

// Get moon sign for current date
function getMoonSign(date: Date) {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const moonCycleDays = 27.3;
  const signIndex = Math.floor((daysSinceEpoch % moonCycleDays) / (moonCycleDays / 12));
  
  // Calculate moon phase
  const lunarCycle = 29.53;
  const dayInCycle = daysSinceEpoch % lunarCycle;
  let phase = "Cheia";
  if (dayInCycle < 3.69) phase = "Nova";
  else if (dayInCycle < 7.38) phase = "Crescente";
  else if (dayInCycle < 11.07) phase = "Quarto Crescente";
  else if (dayInCycle < 14.76) phase = "Crescente Gibosa";
  else if (dayInCycle < 18.45) phase = "Cheia";
  else if (dayInCycle < 22.14) phase = "Minguante Gibosa";
  else if (dayInCycle < 25.83) phase = "Quarto Minguante";
  else phase = "Minguante";
  
  return {
    sign: signs[signIndex % 12],
    degree: Math.floor((daysSinceEpoch % 2.275) * 13),
    phase,
    startDate: date.toISOString().split('T')[0],
    endDate: addDays(date, 2).toISOString().split('T')[0]
  };
}

// Get deities for a sign
function getDeities(sign: string, luminary: "sun" | "moon"): { pantheon: string; deity: string }[] {
  const sunDeities: Record<string, { pantheon: string; deity: string }[]> = {
    "Áries": [
      { pantheon: "Africano", deity: "Ogum" },
      { pantheon: "Grego", deity: "Ares" },
      { pantheon: "Egípcio", deity: "Horus" },
      { pantheon: "Hindu", deity: "Agni" },
      { pantheon: "Nórdico", deity: "Thor" }
    ],
    "Touro": [
      { pantheon: "Africano", deity: "Oxum" },
      { pantheon: "Grego", deity: "Afrodite" },
      { pantheon: "Egípcio", deity: "Hathor" },
      { pantheon: "Hindu", deity: "Lakshmi" },
      { pantheon: "Nórdico", deity: "Freyja" }
    ],
    "Gêmeos": [
      { pantheon: "Africano", deity: "Exu" },
      { pantheon: "Grego", deity: "Hermes" },
      { pantheon: "Egípcio", deity: "Thoth" },
      { pantheon: "Hindu", deity: "Saraswati" },
      { pantheon: "Nórdico", deity: "Loki" }
    ],
    "Câncer": [
      { pantheon: "Africano", deity: "Iemanjá" },
      { pantheon: "Grego", deity: "Ártemis" },
      { pantheon: "Egípcio", deity: "Ísis" },
      { pantheon: "Hindu", deity: "Chandra" },
      { pantheon: "Nórdico", deity: "Frigg" }
    ],
    "Leão": [
      { pantheon: "Africano", deity: "Xangô" },
      { pantheon: "Grego", deity: "Apolo" },
      { pantheon: "Egípcio", deity: "Rá" },
      { pantheon: "Hindu", deity: "Surya" },
      { pantheon: "Nórdico", deity: "Balder" }
    ],
    "Virgem": [
      { pantheon: "Africano", deity: "Omolú" },
      { pantheon: "Grego", deity: "Deméter" },
      { pantheon: "Egípcio", deity: "Neftis" },
      { pantheon: "Hindu", deity: "Vishnu" },
      { pantheon: "Nórdico", deity: "Eir" }
    ],
    "Libra": [
      { pantheon: "Africano", deity: "Oxum" },
      { pantheon: "Grego", deity: "Afrodite" },
      { pantheon: "Egípcio", deity: "Maat" },
      { pantheon: "Hindu", deity: "Lakshmi" },
      { pantheon: "Nórdico", deity: "Freyja" }
    ],
    "Escorpião": [
      { pantheon: "Africano", deity: "Obaluaiê" },
      { pantheon: "Grego", deity: "Hades" },
      { pantheon: "Egípcio", deity: "Anúbis" },
      { pantheon: "Hindu", deity: "Shiva" },
      { pantheon: "Nórdico", deity: "Hel" }
    ],
    "Sagitário": [
      { pantheon: "Africano", deity: "Oxóssi" },
      { pantheon: "Grego", deity: "Zeus" },
      { pantheon: "Egípcio", deity: "Rá" },
      { pantheon: "Hindu", deity: "Vishnu" },
      { pantheon: "Nórdico", deity: "Odin" }
    ],
    "Capricórnio": [
      { pantheon: "Africano", deity: "Tempo" },
      { pantheon: "Grego", deity: "Cronos" },
      { pantheon: "Egípcio", deity: "Ptah" },
      { pantheon: "Hindu", deity: "Shani" },
      { pantheon: "Nórdico", deity: "Njord" }
    ],
    "Aquário": [
      { pantheon: "Africano", deity: "Iansã" },
      { pantheon: "Grego", deity: "Urano" },
      { pantheon: "Egípcio", deity: "Nut" },
      { pantheon: "Hindu", deity: "Varuna" },
      { pantheon: "Nórdico", deity: "Odin" }
    ],
    "Peixes": [
      { pantheon: "Africano", deity: "Iemanjá" },
      { pantheon: "Grego", deity: "Poseidon" },
      { pantheon: "Egípcio", deity: "Ísis" },
      { pantheon: "Hindu", deity: "Vishnu" },
      { pantheon: "Nórdico", deity: "Ran" }
    ]
  };
  
  const moonDeities: Record<string, { pantheon: string; deity: string }[]> = {
    "Áries": [
      { pantheon: "Africano", deity: "Iansã" },
      { pantheon: "Grego", deity: "Selene" },
      { pantheon: "Egípcio", deity: "Sekhmet" },
      { pantheon: "Hindu", deity: "Durga" },
      { pantheon: "Nórdico", deity: "Sif" }
    ],
    "Touro": [
      { pantheon: "Africano", deity: "Oxum" },
      { pantheon: "Grego", deity: "Ártemis" },
      { pantheon: "Egípcio", deity: "Hathor" },
      { pantheon: "Hindu", deity: "Parvati" },
      { pantheon: "Nórdico", deity: "Freyja" }
    ],
    "Gêmeos": [
      { pantheon: "Africano", deity: "Ibeji" },
      { pantheon: "Grego", deity: "Hécate" },
      { pantheon: "Egípcio", deity: "Thoth" },
      { pantheon: "Hindu", deity: "Budha" },
      { pantheon: "Nórdico", deity: "Máni" }
    ],
    "Câncer": [
      { pantheon: "Africano", deity: "Iemanjá" },
      { pantheon: "Grego", deity: "Selene" },
      { pantheon: "Egípcio", deity: "Ísis" },
      { pantheon: "Hindu", deity: "Chandra" },
      { pantheon: "Nórdico", deity: "Máni" }
    ],
    "Leão": [
      { pantheon: "Africano", deity: "Logunedé" },
      { pantheon: "Grego", deity: "Ártemis" },
      { pantheon: "Egípcio", deity: "Bastet" },
      { pantheon: "Hindu", deity: "Soma" },
      { pantheon: "Nórdico", deity: "Sól" }
    ],
    "Virgem": [
      { pantheon: "Africano", deity: "Nanã" },
      { pantheon: "Grego", deity: "Perséfone" },
      { pantheon: "Egípcio", deity: "Neftis" },
      { pantheon: "Hindu", deity: "Saraswati" },
      { pantheon: "Nórdico", deity: "Eir" }
    ],
    "Libra": [
      { pantheon: "Africano", deity: "Oxum" },
      { pantheon: "Grego", deity: "Ártemis" },
      { pantheon: "Egípcio", deity: "Maat" },
      { pantheon: "Hindu", deity: "Lakshmi" },
      { pantheon: "Nórdico", deity: "Freyja" }
    ],
    "Escorpião": [
      { pantheon: "Africano", deity: "Nanã" },
      { pantheon: "Grego", deity: "Hécate" },
      { pantheon: "Egípcio", deity: "Selket" },
      { pantheon: "Hindu", deity: "Kali" },
      { pantheon: "Nórdico", deity: "Hel" }
    ],
    "Sagitário": [
      { pantheon: "Africano", deity: "Oxóssi" },
      { pantheon: "Grego", deity: "Ártemis" },
      { pantheon: "Egípcio", deity: "Khonsu" },
      { pantheon: "Hindu", deity: "Chandra" },
      { pantheon: "Nórdico", deity: "Skadi" }
    ],
    "Capricórnio": [
      { pantheon: "Africano", deity: "Omolú" },
      { pantheon: "Grego", deity: "Hécate" },
      { pantheon: "Egípcio", deity: "Khnum" },
      { pantheon: "Hindu", deity: "Shani" },
      { pantheon: "Nórdico", deity: "Frigg" }
    ],
    "Aquário": [
      { pantheon: "Africano", deity: "Iansã" },
      { pantheon: "Grego", deity: "Hécate" },
      { pantheon: "Egípcio", deity: "Nut" },
      { pantheon: "Hindu", deity: "Varuna" },
      { pantheon: "Nórdico", deity: "Máni" }
    ],
    "Peixes": [
      { pantheon: "Africano", deity: "Iemanjá" },
      { pantheon: "Grego", deity: "Selene" },
      { pantheon: "Egípcio", deity: "Ísis" },
      { pantheon: "Hindu", deity: "Chandra" },
      { pantheon: "Nórdico", deity: "Freyja" }
    ]
  };
  
  const deities = luminary === "sun" ? sunDeities : moonDeities;
  return deities[sign] || deities["Sagitário"];
}

// Cálculo de trânsitos planetários atuais
function getCurrentTransits() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  const getElement = (sign: string): string => {
    const elements: Record<string, string> = {
      "Áries": "fogo", "Leão": "fogo", "Sagitário": "fogo",
      "Touro": "terra", "Virgem": "terra", "Capricórnio": "terra",
      "Gêmeos": "ar", "Libra": "ar", "Aquário": "ar",
      "Câncer": "agua", "Escorpião": "agua", "Peixes": "agua"
    };
    return elements[sign] || "fogo";
  };

  const getMercurySign = (day: number): string => {
    const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                   "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    return signs[Math.floor((day / 30) % 12)];
  };

  const getVenusSign = (day: number): string => {
    const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                   "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    return signs[Math.floor((day / 25) % 12)];
  };

  const getMarsSign = (day: number): string => {
    const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                   "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    return signs[Math.floor((day / 45) % 12)];
  };

  return [
    {
      planet: "Mercúrio",
      icon: "☿️",
      sign: getMercurySign(dayOfYear),
      degree: `${(dayOfYear * 3) % 30}°`,
      startDate: now.toISOString().split('T')[0],
      endDate: addDays(now, 20).toISOString().split('T')[0],
      element: getElement(getMercurySign(dayOfYear)),
      lifeArea: "comunicacao"
    },
    {
      planet: "Vênus",
      icon: "♀️",
      sign: getVenusSign(dayOfYear),
      degree: `${(dayOfYear * 2) % 30}°`,
      startDate: now.toISOString().split('T')[0],
      endDate: addDays(now, 25).toISOString().split('T')[0],
      element: getElement(getVenusSign(dayOfYear)),
      lifeArea: "relacionamentos"
    },
    {
      planet: "Marte",
      icon: "♂️",
      sign: getMarsSign(dayOfYear),
      degree: `${(dayOfYear) % 30}°`,
      startDate: now.toISOString().split('T')[0],
      endDate: addDays(now, 45).toISOString().split('T')[0],
      element: getElement(getMarsSign(dayOfYear)),
      lifeArea: "carreira"
    },
    {
      planet: "Júpiter",
      icon: "♃",
      sign: "Gêmeos ℞",
      degree: "18°",
      startDate: addDays(now, -60).toISOString().split('T')[0],
      endDate: addDays(now, 90).toISOString().split('T')[0],
      element: "ar",
      lifeArea: "autoconhecimento"
    },
    {
      planet: "Saturno",
      icon: "♄",
      sign: "Peixes",
      degree: "2°",
      startDate: addDays(now, -90).toISOString().split('T')[0],
      endDate: addDays(now, 120).toISOString().split('T')[0],
      element: "agua",
      lifeArea: "espiritualidade"
    }
  ];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🌟 Gerando insights de trânsitos personalizados...");
    
    const now = new Date();
    const transits = getCurrentTransits();
    const sunData = getSunSign(now);
    const moonData = getMoonSign(now);
    
    // Get user's natal chart for personalized advice
    let natalChart = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('sun_sign, moon_sign, ascendant_sign, astro_data')
          .single();
          
        if (profile) {
          natalChart = {
            sunSign: profile.sun_sign,
            moonSign: profile.moon_sign,
            ascendantSign: profile.ascendant_sign,
            astroData: profile.astro_data
          };
          console.log(`✅ Mapa natal do usuário: Sol em ${natalChart.sunSign}, Lua em ${natalChart.moonSign}`);
        }
      } catch (e) {
        console.log("⚠️ Não foi possível obter mapa natal, usando conselhos genéricos");
      }
    }
    
    // Chamar Lovable AI para gerar conselhos personalizados
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error("❌ LOVABLE_API_KEY não configurada");
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const natalContext = natalChart 
      ? `
MAPA NATAL DO USUÁRIO (use para personalizar os conselhos):
- Sol natal em ${natalChart.sunSign}
- Lua natal em ${natalChart.moonSign}
- Ascendente em ${natalChart.ascendantSign || "desconhecido"}

IMPORTANTE: Conecte cada conselho ao mapa natal do usuário. Por exemplo:
- Se o trânsito de Mercúrio está em Sagitário e o Sol natal do usuário está em Virgem, fale sobre como essa expansão mental pode desafiar a natureza detalhista do virginiano.
- Se Saturno transita em Peixes e a Lua natal está em Câncer, fale sobre como isso afeta as emoções de forma profunda.
`
      : `O usuário não tem mapa natal cadastrado. Dê conselhos gerais mas significativos.`;

    const systemPrompt = `Você é um astrólogo profissional especializado em trânsitos planetários e interpretação personalizada.

${natalContext}

Para cada trânsito, gere:
- message: Contexto astrológico profundo conectando o trânsito à energia do período (25-35 palavras)
- advice: Conselho PRÁTICO e ESPECÍFICO baseado na combinação do trânsito com o mapa natal do usuário (35-50 palavras)

Para o Sol e Lua do dia, gere:
- sunMessage: Significado do Sol de hoje em seu signo atual (30-40 palavras)
- moonMessage: Significado da Lua de hoje considerando signo e fase (30-40 palavras)

Diretrizes:
- Use linguagem inspiradora mas realista
- Seja específico em ações concretas
- Conecte cada conselho ao perfil astrológico do usuário quando disponível
- Evite clichês genéricos

Responda APENAS com JSON válido:
{
  "sunMessage": "...",
  "moonMessage": "...",
  "transits": [
    {
      "planet": "Nome",
      "message": "...",
      "advice": "..."
    }
  ]
}`;

    const userPrompt = `Data: ${now.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}

SOL DE HOJE: ${sunData.sign} (${sunData.degree}°)
LUA DE HOJE: ${moonData.sign} (${moonData.degree}°) - Fase: ${moonData.phase}

TRÂNSITOS PLANETÁRIOS:
${transits.map(t => `- ${t.planet} (${t.icon}) em ${t.sign} (${t.degree})`).join('\n')}

Gere conselhos personalizados e práticos para cada trânsito, conectando com o mapa natal do usuário.`;

    console.log("🤖 Chamando Lovable AI para conselhos personalizados...");
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`❌ Lovable AI erro ${aiResponse.status}: ${errorText}`);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Lovable AI erro: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("✅ Lovable AI respondeu com sucesso");
    
    let aiContent;
    try {
      const content = aiData.choices[0].message.content;
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiContent = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("❌ Erro ao parsear resposta da IA:", parseError);
      console.log("Resposta bruta:", aiData.choices[0].message.content);
      throw new Error("Falha ao processar resposta da IA");
    }

    // Mesclar dados de trânsitos com conselhos da IA
    const finalTransits = transits.map((transit, index) => {
      const aiTransit = aiContent.transits?.[index] || {};
      return {
        ...transit,
        message: aiTransit.message || `${transit.planet} em ${transit.sign} traz energias importantes`,
        advice: aiTransit.advice || "Esteja atento às oportunidades que surgem"
      };
    });

    // Build daily luminaries data
    const daily = {
      sun: {
        sign: sunData.sign,
        degree: sunData.degree,
        startDate: sunData.startDate,
        endDate: sunData.endDate,
        message: aiContent.sunMessage || `O Sol em ${sunData.sign} ilumina seu caminho com energia de expansão e busca por significado.`,
        deities: getDeities(sunData.sign, "sun")
      },
      moon: {
        sign: moonData.sign,
        degree: moonData.degree,
        startDate: moonData.startDate,
        endDate: moonData.endDate,
        phase: moonData.phase,
        message: aiContent.moonMessage || `A Lua em ${moonData.sign} desperta sua intuição e sensibilidade emocional.`,
        deities: getDeities(moonData.sign, "moon")
      }
    };

    console.log(`✅ ${finalTransits.length} trânsitos + Sol/Lua personalizados`);

    return new Response(
      JSON.stringify({ 
        date: now.toISOString(),
        daily,
        transits: finalTransits 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: "Verifique os logs para mais informações"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
