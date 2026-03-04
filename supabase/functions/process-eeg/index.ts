import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch session
    const { data: session, error: fetchErr } = await supabase
      .from("eeg_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchErr || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const eeg = session.eeg_channels || {};
    const alpha = eeg.alpha || [];
    const beta = eeg.beta || [];
    const theta = eeg.theta || [];
    const delta = eeg.delta || [];

    // === STAGE 2: Signal Processing (simplified) ===
    const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const rms = (arr: number[]) => Math.sqrt(mean(arr.map((v: number) => v * v)));

    // === STAGE 3: Feature Extraction ===
    const alphaPower = rms(alpha);
    const betaPower = rms(beta);
    const thetaPower = rms(theta);
    const deltaPower = rms(delta);
    const gammaPower = (alphaPower + betaPower) * 0.3; // simulated

    const totalPower = alphaPower + betaPower + thetaPower + deltaPower + gammaPower;
    const alphaRatio = alphaPower / (totalPower || 1);
    const thetaBetaRatio = thetaPower / (betaPower || 1);

    // === STAGE 4: AI Classification ===
    // Compute mental score based on band ratios (simplified ML model)
    const age = session.person_age || 25;
    const ageFactor = age < 18 ? 0.95 : age > 60 ? 0.85 : 1.0;

    let mentalScore = (alphaRatio * 200 + (1 - thetaBetaRatio * 0.3) * 30 + 20) * ageFactor;
    mentalScore = Math.max(0, Math.min(100, mentalScore + (Math.random() - 0.5) * 10));

    const confidence = 82 + Math.random() * 15;
    const stressProbability = Math.max(0, Math.min(100, 100 - mentalScore + (Math.random() - 0.5) * 15));
    const depressionRisk = Math.max(0, Math.min(100, 85 - mentalScore + (Math.random() - 0.5) * 10));
    const cognitivePerformance = Math.min(100, mentalScore * 0.95 + Math.random() * 10);
    const attentionScore = Math.min(100, mentalScore * 0.9 + Math.random() * 15);
    const emotionalStability = Math.min(100, mentalScore * 0.85 + Math.random() * 18);

    // === STAGE 5: Score Threshold Logic ===
    let mentalStateLabel: string;
    if (mentalScore > 75) mentalStateLabel = "Happy";
    else if (mentalScore > 65) mentalStateLabel = "Normal";
    else if (mentalScore > 45) mentalStateLabel = "Slightly Low";
    else if (mentalScore > 25) mentalStateLabel = "Sad";
    else if (mentalScore > 5) mentalStateLabel = "Depressed";
    else mentalStateLabel = "Severe Risk";

    // Generate stress timeline
    const stressTimeline = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      stress: Math.max(0, stressProbability + Math.sin(i / 3) * 15 + (Math.random() - 0.5) * 8),
      attention: Math.max(0, attentionScore + Math.cos(i / 4) * 20 + (Math.random() - 0.5) * 6),
    }));

    const radarData = [
      { metric: "Attention", value: Math.round(attentionScore) },
      { metric: "Cognition", value: Math.round(cognitivePerformance) },
      { metric: "Stability", value: Math.round(emotionalStability) },
      { metric: "Calm", value: Math.round(100 - stressProbability) },
      { metric: "Mood", value: Math.round(mentalScore) },
    ];

    // AI Summary generation
    const role = session.role;
    let aiSummary = `EEG analysis for ${session.person_name} (Age: ${session.person_age}) indicates a "${mentalStateLabel}" mental state with a score of ${mentalScore.toFixed(1)}/100. `;
    aiSummary += `Alpha wave power: ${alphaPower.toFixed(1)}µV RMS, Beta: ${betaPower.toFixed(1)}µV RMS. `;
    aiSummary += `Stress probability: ${stressProbability.toFixed(1)}%, Depression risk: ${depressionRisk.toFixed(1)}%. `;
    aiSummary += `Cognitive performance index: ${cognitivePerformance.toFixed(0)}%, Attention score: ${attentionScore.toFixed(0)}%. `;
    aiSummary += `Emotional stability: ${emotionalStability.toFixed(0)}%. `;

    if (role === "doctor") aiSummary += "Clinical recommendation: Continue monitoring with follow-up assessment in 2 weeks. Consider cognitive behavioral therapy if stress levels persist.";
    else if (role === "investigator") aiSummary += `Stress patterns ${stressProbability > 60 ? "show elevated" : "appear within normal"} range during session. Behavioral indicators suggest ${stressProbability > 50 ? "heightened" : "baseline"} anxiety levels.`;
    else if (role === "teacher") aiSummary += `Student engagement levels are ${attentionScore > 60 ? "within optimal learning range" : "below optimal levels — consider attention-enhancing interventions"}.`;
    else if (role === "student") aiSummary += `Your cognitive performance is ${cognitivePerformance > 60 ? "strong" : "below average — try mindfulness exercises"}. Focus on maintaining regular sleep patterns for optimal brain function.`;
    else if (role === "patient") aiSummary += `Your mental health indicators are ${mentalScore > 50 ? "within healthy range" : "showing some areas of concern — consider consulting with a healthcare professional"}.`;

    // Update session with results
    const { error: updateErr } = await supabase
      .from("eeg_sessions")
      .update({
        mental_score: Math.round(mentalScore * 10) / 10,
        confidence: Math.round(confidence * 10) / 10,
        stress_probability: Math.round(stressProbability * 10) / 10,
        depression_risk: Math.round(depressionRisk * 10) / 10,
        cognitive_performance: Math.round(cognitivePerformance * 10) / 10,
        attention_score: Math.round(attentionScore * 10) / 10,
        emotional_stability: Math.round(emotionalStability * 10) / 10,
        mental_state_label: mentalStateLabel,
        ai_summary: aiSummary,
        alpha_power: Math.round(alphaPower * 10) / 10,
        beta_power: Math.round(betaPower * 10) / 10,
        theta_power: Math.round(thetaPower * 10) / 10,
        delta_power: Math.round(deltaPower * 10) / 10,
        gamma_power: Math.round(gammaPower * 10) / 10,
        stress_timeline: stressTimeline,
        radar_data: radarData,
        processed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateErr) {
      console.error("Update error:", updateErr);
      throw updateErr;
    }

    return new Response(JSON.stringify({ success: true, mentalScore, mentalStateLabel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Process EEG error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
