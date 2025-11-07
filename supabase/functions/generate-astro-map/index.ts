import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback: Simplified zodiac sign calculation
function getZodiacSign(month: number, day: number): string {
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

// Fallback: Simplified moon sign calculation
function getMoonSign(birthDate: Date): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const daysSinceEpoch = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24));
  const moonCycleDays = 27.3;
  const signIndex = Math.floor((daysSinceEpoch % moonCycleDays) / (moonCycleDays / 12));
  
  return signs[signIndex % 12];
}

// Fallback: Simplified ascendant calculation
function getAscendant(birthTime: string, latitude: number): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  const signIndex = Math.floor(totalMinutes / 120) % 12;
  const latitudeAdjustment = Math.floor(Math.abs(latitude) / 30);
  const adjustedIndex = (signIndex + latitudeAdjustment) % 12;
  
  return signs[adjustedIndex];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user's profile data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('birth_date, birth_time, birth_latitude, birth_longitude')
      .single();

    if (profileError || !profile) {
      console.error("Erro ao buscar perfil:", profileError);
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { birth_date, birth_time, birth_latitude, birth_longitude } = profile;

    if (!birth_date || !birth_time) {
      return new Response(
        JSON.stringify({ error: "Dados de nascimento incompletos" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse birth date
    const birthDate = new Date(birth_date);
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const [hours, minutes] = birth_time.split(':').map(Number);

    let astroData;
    let isApproximation = false;

    // Try FreeAstrologyAPI.com first
    try {
      console.log("Tentando FreeAstrologyAPI.com...");
      
      const apiResponse = await fetch('https://json.freeastrologyapi.com/western/natal-wheel-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: birthDate.getFullYear(),
          month: month,
          date: day,
          hour: hours,
          minute: minutes,
          latitude: birth_latitude || 0,
          longitude: birth_longitude || 0,
          timezone: -3.0,
          house_system: "Placidus"
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`API retornou status ${apiResponse.status}`);
      }

      const apiData = await apiResponse.json();
      console.log("Resposta FreeAstrologyAPI:", JSON.stringify(apiData).substring(0, 500));

      // Parse API response
      const planets = apiData.output?.planet_positions || {};
      const houses = apiData.output?.houses || [];
      const aspects = apiData.output?.aspects || [];
      const ascendant = apiData.output?.ascendant || {};

      astroData = {
        sun: {
          sign: planets.sun?.sign || getZodiacSign(month, day),
          degree: planets.sun?.degree || 0,
          house: planets.sun?.house || 1
        },
        moon: {
          sign: planets.moon?.sign || getMoonSign(birthDate),
          degree: planets.moon?.degree || 0,
          house: planets.moon?.house || 1
        },
        ascendant: {
          sign: ascendant.sign || getAscendant(birth_time, birth_latitude || 0),
          degree: ascendant.degree || 0
        },
        mercury: planets.mercury ? { sign: planets.mercury.sign, degree: planets.mercury.degree, house: planets.mercury.house } : null,
        venus: planets.venus ? { sign: planets.venus.sign, degree: planets.venus.degree, house: planets.venus.house } : null,
        mars: planets.mars ? { sign: planets.mars.sign, degree: planets.mars.degree, house: planets.mars.house } : null,
        jupiter: planets.jupiter ? { sign: planets.jupiter.sign, degree: planets.jupiter.degree, house: planets.jupiter.house } : null,
        saturn: planets.saturn ? { sign: planets.saturn.sign, degree: planets.saturn.degree, house: planets.saturn.house } : null,
        uranus: planets.uranus ? { sign: planets.uranus.sign, degree: planets.uranus.degree, house: planets.uranus.house } : null,
        neptune: planets.neptune ? { sign: planets.neptune.sign, degree: planets.neptune.degree, house: planets.neptune.house } : null,
        pluto: planets.pluto ? { sign: planets.pluto.sign, degree: planets.pluto.degree, house: planets.pluto.house } : null,
        houses: houses,
        aspects: aspects,
        calculatedAt: new Date().toISOString(),
        isApproximation: false
      };

      console.log("✅ FreeAstrologyAPI funcionou!");

    } catch (apiError) {
      console.error("FreeAstrologyAPI falhou, usando fallback:", apiError);
      isApproximation = true;

      // Fallback to simplified calculations
      const sunSign = getZodiacSign(month, day);
      const moonSign = getMoonSign(birthDate);
      const ascendantSign = getAscendant(birth_time, birth_latitude || 0);

      astroData = {
        sun: { sign: sunSign, house: 1, degree: 0 },
        moon: { sign: moonSign, house: ((month + 4) % 12) + 1, degree: 0 },
        ascendant: { sign: ascendantSign, degree: 0 },
        calculatedAt: new Date().toISOString(),
        isApproximation: true
      };

      console.log("⚠️ Usando cálculo aproximado");
    }

    // Save astro data to profile
    const updateData: any = {
      sun_sign: astroData.sun.sign,
      moon_sign: astroData.moon.sign,
      ascendant_sign: astroData.ascendant.sign,
      astro_data: astroData,
    };

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('user_id', (await supabaseClient.auth.getUser()).data.user?.id);

    if (updateError) {
      console.error("Erro ao salvar mapa astral:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar mapa astral" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ astroData, isApproximation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
