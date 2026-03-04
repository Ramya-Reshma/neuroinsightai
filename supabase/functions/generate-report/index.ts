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
    const { sessionId, format } = await req.json();
    if (!sessionId || !format) {
      return new Response(JSON.stringify({ error: "sessionId and format required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: session, error } = await supabase
      .from("eeg_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (format === "csv") {
      const rows = [
        ["NeuroInsight AI — EEG Analysis Report"],
        [""],
        ["Field", "Value"],
        ["Session ID", session.id],
        ["Date", new Date(session.created_at).toLocaleString()],
        ["Module", session.module],
        ["Role", session.role],
        ["Person Name", session.person_name],
        ["Age", session.person_age],
        ["Gender", session.gender || "N/A"],
        [""],
        ["--- AI Results ---", ""],
        ["Mental Score", `${session.mental_score}/100`],
        ["Mental State", session.mental_state_label],
        ["Confidence", `${session.confidence}%`],
        ["Stress Probability", `${session.stress_probability}%`],
        ["Depression Risk", `${session.depression_risk}%`],
        ["Cognitive Performance", `${session.cognitive_performance}%`],
        ["Attention Score", `${session.attention_score}%`],
        ["Emotional Stability", `${session.emotional_stability}%`],
        [""],
        ["--- Band Power (µV RMS) ---", ""],
        ["Alpha", session.alpha_power],
        ["Beta", session.beta_power],
        ["Theta", session.theta_power],
        ["Delta", session.delta_power],
        ["Gamma", session.gamma_power],
        [""],
        ["--- AI Summary ---", ""],
        [session.ai_summary || "N/A"],
      ];

      // Add role-specific fields
      if (session.student_id) rows.splice(10, 0, ["Student ID", session.student_id]);
      if (session.class_name) rows.splice(10, 0, ["Class", session.class_name]);
      if (session.institution) rows.splice(10, 0, ["Institution", session.institution]);
      if (session.patient_id) rows.splice(10, 0, ["Patient ID", session.patient_id]);
      if (session.doctor_name) rows.splice(10, 0, ["Doctor", session.doctor_name]);
      if (session.case_id) rows.splice(10, 0, ["Case ID", session.case_id]);
      if (session.suspect_id) rows.splice(10, 0, ["Subject ID", session.suspect_id]);
      if (session.investigation_type) rows.splice(10, 0, ["Investigation Type", session.investigation_type]);

      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

      return new Response(JSON.stringify({ content: csv }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (format === "pdf") {
      // Generate a simple PDF using raw PDF syntax
      const title = "NeuroInsight AI — EEG Analysis Report";
      const lines = [
        title,
        "",
        `Name: ${session.person_name}`,
        `Age: ${session.person_age}  |  Gender: ${session.gender || "N/A"}`,
        `Module: ${session.module}  |  Role: ${session.role}`,
        `Date: ${new Date(session.created_at).toLocaleString()}`,
        `Session ID: ${session.id}`,
        "",
      ];

      // Role specific
      if (session.student_id) lines.push(`Student ID: ${session.student_id}`);
      if (session.class_name) lines.push(`Class: ${session.class_name}`);
      if (session.institution) lines.push(`Institution: ${session.institution}`);
      if (session.patient_id) lines.push(`Patient ID: ${session.patient_id}`);
      if (session.doctor_name) lines.push(`Doctor: ${session.doctor_name}`);
      if (session.case_id) lines.push(`Case ID: ${session.case_id}`);
      if (session.suspect_id) lines.push(`Subject ID: ${session.suspect_id}`);
      if (session.investigation_type) lines.push(`Investigation Type: ${session.investigation_type}`);

      lines.push(
        "",
        "=== AI Analysis Results ===",
        "",
        `Mental Score: ${session.mental_score}/100`,
        `Mental State: ${session.mental_state_label}`,
        `Confidence: ${session.confidence}%`,
        `Stress Probability: ${session.stress_probability}%`,
        `Depression Risk: ${session.depression_risk}%`,
        `Cognitive Performance: ${session.cognitive_performance}%`,
        `Attention Score: ${session.attention_score}%`,
        `Emotional Stability: ${session.emotional_stability}%`,
        "",
        "=== Frequency Band Power (uV RMS) ===",
        "",
        `Alpha: ${session.alpha_power}`,
        `Beta: ${session.beta_power}`,
        `Theta: ${session.theta_power}`,
        `Delta: ${session.delta_power}`,
        `Gamma: ${session.gamma_power}`,
        "",
        "=== AI Summary ===",
        "",
        session.ai_summary || "N/A",
      );

      // Build minimal PDF
      const textContent = lines.join("\n");
      const streamContent = `BT\n/F1 11 Tf\n36 756 Td\n14 TL\n${lines.map(l => `(${l.replace(/[()\\]/g, "\\$&")}) '`).join("\n")}\nET`;
      
      const objects: string[] = [];
      objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");
      objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj");
      objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`);
      objects.push(`4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`);
      objects.push("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj");

      let body = "";
      const offsets: number[] = [];
      const header = "%PDF-1.4\n";
      body = header;
      
      for (let i = 0; i < objects.length; i++) {
        offsets.push(body.length);
        body += objects[i] + "\n";
      }

      const xrefOffset = body.length;
      body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      for (const off of offsets) {
        body += `${String(off).padStart(10, "0")} 00000 n \n`;
      }
      body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

      // Encode to base64
      const encoder = new TextEncoder();
      const uint8 = encoder.encode(body);
      const base64 = btoa(String.fromCharCode(...uint8));

      return new Response(JSON.stringify({ content: base64 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid format. Use 'pdf' or 'csv'." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Report gen error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
