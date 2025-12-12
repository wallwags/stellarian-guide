import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cálculo de trânsitos planetários atuais (simplificado)
function getCurrentTransits() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Posições aproximadas baseadas em movimento médio dos planetas
  const sunSign = getSunSign(now);
  const moonSign = getMoonSign(now);
  
  const getElement = (sign: string): string => {
    const elements: Record<string, string> = {
      "Áries": "fogo", "Leão": "fogo", "Sagitário": "fogo",
      "Touro": "terra", "Virgem": "terra", "Capricórnio": "terra",
      "Gêmeos": "ar", "Libra": "ar", "Aquário": "ar",
      "Câncer": "agua", "Escorpião": "agua", "Peixes": "agua"
    };
    return elements[sign] || "fogo";
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

function getSunSign(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
    { sign: "Capricórnio", start: [12, 22], end: [1, 19], degree: day + 8 },
    { sign: "Aquário", start: [1, 20], end: [2, 18], degree: day },
    { sign: "Peixes", start: [2, 19], end: [3, 20], degree: day },
    { sign: "Áries", start: [3, 21], end: [4, 19], degree: day },
    { sign: "Touro", start: [4, 20], end: [5, 20], degree: day },
    { sign: "Gêmeos", start: [5, 21], end: [6, 20], degree: day },
    { sign: "Câncer", start: [6, 21], end: [7, 22], degree: day },
    { sign: "Leão", start: [7, 23], end: [8, 22], degree: day },
    { sign: "Virgem", start: [8, 23], end: [9, 22], degree: day },
    { sign: "Libra", start: [9, 23], end: [10, 22], degree: day },
    { sign: "Escorpião", start: [10, 23], end: [11, 21], degree: day },
    { sign: "Sagitário", start: [11, 22], end: [12, 21], degree: day },
  ];
  
  for (const s of signs) {
    if ((month === s.start[0] && day >= s.start[1]) || (month === s.end[0] && day <= s.end[1])) {
      return {
        sign: s.sign,
        degree: s.degree % 30,
        startDate: `${date.getFullYear()}-${String(s.start[0]).padStart(2, '0')}-${String(s.start[1]).padStart(2, '0')}`,
        endDate: `${date.getFullYear()}-${String(s.end[0]).padStart(2, '0')}-${String(s.end[1]).padStart(2, '0')}`
      };
    }
  }
  
  return { sign: "Sagitário", degree: 0, startDate: "", endDate: "" };
}

function getMoonSign(date: Date) {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const moonCycleDays = 27.3;
  const signIndex = Math.floor((daysSinceEpoch % moonCycleDays) / (moonCycleDays / 12));
  
  return {
    sign: signs[signIndex % 12],
    degree: Math.floor((daysSinceEpoch % 2.275) * 13),
    startDate: date.toISOString().split('T')[0],
    endDate: addDays(date, 2).toISOString().split('T')[0]
  };
}

function getMercurySign(dayOfYear: number): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  return signs[Math.floor((dayOfYear / 30) % 12)];
}

function getVenusSign(dayOfYear: number): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  return signs[Math.floor((dayOfYear / 25) % 12)];
}

function getMarsSign(dayOfYear: number): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  return signs[Math.floor((dayOfYear / 45) % 12)];
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
    console.log("🌟 Gerando insights de trânsitos...");
    
    const transits = getCurrentTransits();
    
    // Chamar Lovable AI para gerar conselhos personalizados
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error("❌ LOVABLE_API_KEY não configurada");
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = `Você é um astrólogo profissional especializado em trânsitos planetários.
Gere conselhos práticos e inspiradores baseados nos trânsitos astrais atuais.

Para cada trânsito, retorne:
- message: Contexto astrológico profundo e significativo (30-40 palavras)
- advice: Conselho prático, específico e acionável (40-50 palavras)

Diretrizes importantes:
- Use linguagem inspiradora mas realista
- Seja específico em ações concretas que a pessoa pode tomar
- Evite clichês genéricos
- Foque em temas práticos do dia a dia
- Máximo de 80 palavras por conselho total

Responda APENAS com um JSON válido no formato:
{
  "transits": [
    {
      "planet": "Nome do planeta",
      "message": "Contexto astrológico...",
      "advice": "Conselho prático..."
    }
  ]
}`;

    const userPrompt = `Data: ${new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}

Trânsitos planetários atuais:
${transits.map(t => `- ${t.planet} (${t.icon}) em ${t.sign} (${t.degree})`).join('\n')}

Gere conselhos personalizados e práticos para cada trânsito. A pessoa quer orientação para o dia de hoje.`;

    console.log("🤖 Chamando Lovable AI...");
    
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
    
    let enrichedTransits;
    try {
      const content = aiData.choices[0].message.content;
      // Remover markdown code blocks se existirem
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      enrichedTransits = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("❌ Erro ao parsear resposta da IA:", parseError);
      console.log("Resposta bruta:", aiData.choices[0].message.content);
      throw new Error("Falha ao processar resposta da IA");
    }

    // Mesclar dados de trânsitos com conselhos da IA
    const finalTransits = transits.map((transit, index) => {
      const aiTransit = enrichedTransits.transits?.[index] || {};
      return {
        ...transit,
        message: aiTransit.message || `${transit.planet} em ${transit.sign} traz energias importantes`,
        advice: aiTransit.advice || "Esteja atento às oportunidades que surgem"
      };
    });

    console.log(`✅ ${finalTransits.length} trânsitos enriquecidos com conselhos`);

    return new Response(
      JSON.stringify({ 
        date: new Date().toISOString(),
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
