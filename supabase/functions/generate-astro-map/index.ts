import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified zodiac sign calculation based on birth date
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

// Simplified moon sign calculation (rotates through signs every ~2.5 days)
function getMoonSign(birthDate: Date): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  // Simple approximation: moon cycles through all signs in ~27 days
  const daysSinceEpoch = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24));
  const moonCycleDays = 27.3;
  const signIndex = Math.floor((daysSinceEpoch % moonCycleDays) / (moonCycleDays / 12));
  
  return signs[signIndex % 12];
}

// Simplified ascendant calculation based on birth time and latitude
function getAscendant(birthTime: string, latitude: number): string {
  const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
                 "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Simple approximation: ascendant changes every 2 hours (~120 minutes)
  const signIndex = Math.floor(totalMinutes / 120) % 12;
  
  // Adjust for latitude (simplified)
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
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
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

    // Calculate signs
    const sunSign = getZodiacSign(month, day);
    const moonSign = getMoonSign(birthDate);
    const ascendantSign = getAscendant(birth_time, birth_latitude || 0);

    // Create astro data structure
    const astroData = {
      sun: { sign: sunSign, house: "Casa " + ((month % 12) + 1) },
      moon: { sign: moonSign, house: "Casa " + (((month + 4) % 12) + 1) },
      ascendant: { sign: ascendantSign, house: "Casa 1" },
      calculatedAt: new Date().toISOString(),
    };

    // Save astro data to profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        sun_sign: sunSign,
        moon_sign: moonSign,
        ascendant_sign: ascendantSign,
        astro_data: astroData,
      })
      .eq('user_id', (await supabaseClient.auth.getUser()).data.user?.id);

    if (updateError) {
      console.error("Erro ao salvar mapa astral:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar mapa astral" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ astroData }),
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
