import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { MentalStateGauge } from "@/components/MentalStateGauge";
import { MetricCard } from "@/components/MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SessionData {
  id: string;
  role: string;
  module: string;
  person_name: string;
  person_age: number;
  gender: string | null;
  mental_score: number | null;
  confidence: number | null;
  stress_probability: number | null;
  depression_risk: number | null;
  cognitive_performance: number | null;
  attention_score: number | null;
  emotional_stability: number | null;
  mental_state_label: string | null;
  ai_summary: string | null;
  alpha_power: number | null;
  beta_power: number | null;
  theta_power: number | null;
  delta_power: number | null;
  gamma_power: number | null;
  stress_timeline: any;
  radar_data: any;
  eeg_channels: any;
  processed: boolean;
  created_at: string;
  // Role-specific
  student_id: string | null;
  class_name: string | null;
  institution: string | null;
  patient_id: string | null;
  doctor_name: string | null;
  case_id: string | null;
  suspect_id: string | null;
  investigation_type: string | null;
}

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("eeg_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !data) {
        toast.error("Session not found");
        navigate("/dashboard");
        return;
      }
      setSession(data as any);
      setLoading(false);
    };
    fetchSession();
  }, [sessionId, navigate]);

  const handleDownload = async (format: "pdf" | "csv") => {
    if (!session) return;
    setDownloading(format);
    try {
      const { data, error } = await supabase.functions.invoke("generate-report", {
        body: { sessionId: session.id, format },
      });
      if (error) throw error;

      if (format === "csv") {
        const blob = new Blob([data.content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `neuroinsight-report-${session.id.slice(0, 8)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF comes as base64
        const byteChars = atob(data.content);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `neuroinsight-report-${session.id.slice(0, 8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`${format.toUpperCase()} report downloaded!`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to generate ${format.toUpperCase()} report`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🧠</div>
          <p className="text-muted-foreground">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.processed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Results are still processing. Please refresh in a moment.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const score = session.mental_score || 0;
  const emoji = score > 75 ? "😊" : score > 65 ? "🙂" : score > 45 ? "😐" : score > 25 ? "😔" : score > 5 ? "😞" : "⚠️";
  const label = session.mental_state_label || "Unknown";

  const radarData = session.radar_data || [
    { metric: "Attention", value: session.attention_score || 0 },
    { metric: "Cognition", value: session.cognitive_performance || 0 },
    { metric: "Stability", value: session.emotional_stability || 0 },
    { metric: "Calm", value: 100 - (session.stress_probability || 0) },
    { metric: "Mood", value: score },
  ];

  const stressTimeline = session.stress_timeline || Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    stress: 30 + Math.sin(i / 3) * 25,
    attention: 50 + Math.cos(i / 4) * 30,
  }));

  const bandPower = [
    { band: "Delta", power: session.delta_power || 0 },
    { band: "Theta", power: session.theta_power || 0 },
    { band: "Alpha", power: session.alpha_power || 0 },
    { band: "Beta", power: session.beta_power || 0 },
    { band: "Gamma", power: session.gamma_power || 0 },
  ];

  const eegChannels = session.eeg_channels || {};
  const eegData = (eegChannels.alpha || []).map((_: number, i: number) => ({
    time: i,
    alpha: eegChannels.alpha?.[i] || 0,
    beta: eegChannels.beta?.[i] || 0,
    theta: eegChannels.theta?.[i] || 0,
    delta: eegChannels.delta?.[i] || 0,
  }));

  const roleIcon = session.role === "student" ? "🎓" : session.role === "teacher" ? "👨‍🏫" : session.role === "doctor" ? "🏥" : session.role === "patient" ? "🧑‍⚕️" : "🕵️";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold text-sm">NeuroInsight <span className="text-primary">AI</span></span>
            </button>
            <span className="text-border">|</span>
            <span className="text-sm font-mono text-muted-foreground">
              {roleIcon} {session.person_name} — {label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownload("csv")}
              disabled={downloading === "csv"}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {downloading === "csv" ? "..." : "📊 Excel/CSV"}
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading === "pdf"}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {downloading === "pdf" ? "..." : "📄 PDF Report"}
            </button>
            <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        {/* Person Info Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card-gradient border border-border rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold">{session.person_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Age: {session.person_age} {session.gender ? `• ${session.gender}` : ""} • {session.module} Module • {session.role}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-mono">
                {session.student_id && <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">Student: {session.student_id}</span>}
                {session.patient_id && <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">Patient: {session.patient_id}</span>}
                {session.case_id && <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">Case: {session.case_id}</span>}
                {session.doctor_name && <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">Dr. {session.doctor_name}</span>}
                {session.investigation_type && <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground">{session.investigation_type}</span>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Mental Score" value={(session.mental_score || 0).toFixed(0)} unit="/100" glowColor="primary" delay={0} />
          <MetricCard title="Confidence" value={(session.confidence || 0).toFixed(1)} unit="%" glowColor="success" delay={0.1} />
          <MetricCard title="Stress Level" value={(session.stress_probability || 0).toFixed(1)} unit="%" glowColor="warning" delay={0.2} />
          <MetricCard title="Depression Risk" value={(session.depression_risk || 0).toFixed(1)} unit="%" glowColor="danger" delay={0.3} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card-gradient border border-border rounded-xl p-6 flex flex-col items-center justify-center">
            <MentalStateGauge score={score} label={label} emoji={emoji} />
            <div className="grid grid-cols-2 gap-4 mt-6 w-full text-center">
              <div>
                <div className="text-xs text-muted-foreground">Attention</div>
                <div className="text-lg font-bold font-mono text-primary">{(session.attention_score || 0).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cognition</div>
                <div className="text-lg font-bold font-mono text-success">{(session.cognitive_performance || 0).toFixed(0)}%</div>
              </div>
            </div>
          </motion.div>

          {/* EEG Waveforms */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card-gradient border border-border rounded-xl p-6">
            <h3 className="font-semibold text-sm mb-4">EEG Channels</h3>
            <div className="space-y-2">
              {[
                { key: "alpha", label: "Alpha", color: "hsl(var(--primary))" },
                { key: "beta", label: "Beta", color: "hsl(var(--glow-secondary))" },
                { key: "theta", label: "Theta", color: "hsl(var(--success))" },
                { key: "delta", label: "Delta", color: "hsl(var(--warning))" },
              ].map((ch) => (
                <div key={ch.key} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-12">{ch.label}</span>
                  <div className="flex-1 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={eegData}>
                        <Line type="monotone" dataKey={ch.key} stroke={ch.color} strokeWidth={1.2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card-gradient border border-border rounded-xl p-6">
            <h3 className="font-semibold text-sm mb-4">Stress & Attention Timeline (24h)</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stressTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Area type="monotone" dataKey="stress" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="attention" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-card-gradient border border-border rounded-xl p-6">
            <h3 className="font-semibold text-sm mb-4">Cognitive Profile</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Band Power */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-card-gradient border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm mb-4">Frequency Band Power Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandPower}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="band" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Bar dataKey="power" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="bg-card-gradient border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm mb-3">🤖 AI Analysis Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {session.ai_summary || "No AI summary available."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
