import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { RoleSelector } from "@/components/RoleSelector";
import { MetricCard } from "@/components/MetricCard";
import { MentalStateGauge } from "@/components/MentalStateGauge";
import { EEGWaveform } from "@/components/EEGWaveform";
import { generateMultiChannelEEG, classifyMentalState, ROLES, type RoleId } from "@/lib/eeg-data";

export default function Dashboard() {
  const [role, setRole] = useState<RoleId | null>(null);
  const navigate = useNavigate();

  const eegData = useMemo(() => generateMultiChannelEEG(200), []);
  const mentalScore = useMemo(() => classifyMentalState(72), []);

  const stressTimeline = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      stress: 30 + Math.sin(i / 3) * 25 + (Math.random() - 0.5) * 10,
      attention: 50 + Math.cos(i / 4) * 30 + (Math.random() - 0.5) * 8,
    })), []);

  const radarData = useMemo(() => [
    { metric: "Attention", value: mentalScore.attentionScore },
    { metric: "Cognition", value: mentalScore.cognitivePerformance },
    { metric: "Stability", value: mentalScore.emotionalStability },
    { metric: "Calm", value: 100 - mentalScore.stressProbability },
    { metric: "Mood", value: mentalScore.score },
  ], [mentalScore]);

  const bandPower = useMemo(() => [
    { band: "Delta", power: 35 + Math.random() * 15 },
    { band: "Theta", power: 25 + Math.random() * 15 },
    { band: "Alpha", power: 40 + Math.random() * 20 },
    { band: "Beta", power: 30 + Math.random() * 20 },
    { band: "Gamma", power: 15 + Math.random() * 10 },
  ], []);

  if (!role) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-bold text-lg">NeuroInsight <span className="text-primary">AI</span></span>
            </button>
          </div>
        </nav>
        <div className="container py-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Select Your Role</h1>
            <p className="text-muted-foreground">Choose your dashboard to begin EEG analysis</p>
          </motion.div>
          <RoleSelector onSelect={setRole} />
        </div>
      </div>
    );
  }

  const currentRole = ROLES.find(r => r.id === role)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold text-sm">NeuroInsight <span className="text-primary">AI</span></span>
            </button>
            <span className="text-border">|</span>
            <span className="text-sm font-mono text-muted-foreground">
              {currentRole.icon} {currentRole.label} Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">Session Active</span>
            </div>
            <button onClick={() => setRole(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Switch Role
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">{currentRole.icon} {currentRole.label} Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentRole.description}</p>
        </motion.div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Mental Score" value={mentalScore.score.toFixed(0)} unit="/100" glowColor="primary" delay={0} />
          <MetricCard title="Confidence" value={mentalScore.confidence.toFixed(1)} unit="%" glowColor="success" delay={0.1} />
          <MetricCard title="Stress Level" value={mentalScore.stressProbability.toFixed(1)} unit="%" glowColor="warning" delay={0.2} />
          <MetricCard title="Depression Risk" value={mentalScore.depressionRisk.toFixed(1)} unit="%" glowColor="danger" delay={0.3} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card-gradient border border-border rounded-xl p-6 flex flex-col items-center justify-center"
          >
            <MentalStateGauge score={mentalScore.score} label={mentalScore.label} emoji={mentalScore.emoji} />
            <div className="grid grid-cols-2 gap-4 mt-6 w-full text-center">
              <div>
                <div className="text-xs text-muted-foreground">Attention</div>
                <div className="text-lg font-bold font-mono text-primary">{mentalScore.attentionScore.toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cognition</div>
                <div className="text-lg font-bold font-mono text-success">{mentalScore.cognitivePerformance.toFixed(0)}%</div>
              </div>
            </div>
          </motion.div>

          {/* EEG Waveforms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card-gradient border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Live EEG Channels</h3>
              <span className="flex items-center gap-1.5 text-xs font-mono text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Streaming
              </span>
            </div>
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
          {/* Stress Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card-gradient border border-border rounded-xl p-6"
          >
            <h3 className="font-semibold text-sm mb-4">Stress & Attention Timeline (24h)</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stressTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={3} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="stress" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="attention" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Radar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card-gradient border border-border rounded-xl p-6"
          >
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card-gradient border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-sm mb-4">Frequency Band Power Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandPower}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="band" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(222 40% 9%)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                />
                <Bar dataKey="power" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-card-gradient border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-sm mb-3">🤖 AI Analysis Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The EEG analysis indicates a <span className="text-primary font-medium">normal mental state</span> with a score of {mentalScore.score}/100.
            Alpha wave activity is within healthy range, suggesting adequate relaxation levels. Beta activity shows
            moderate cognitive engagement. The stress probability of {mentalScore.stressProbability.toFixed(1)}% is within acceptable
            parameters. Cognitive performance index at {mentalScore.cognitivePerformance.toFixed(0)}% indicates good executive function.
            Emotional stability gauge reads {mentalScore.emotionalStability.toFixed(0)}%, suggesting balanced emotional regulation.
            {role === "doctor" && " Recommend continued monitoring with follow-up assessment in 2 weeks."}
            {role === "investigator" && " No anomalous stress patterns detected during session."}
            {role === "teacher" && " Student engagement levels are within optimal learning range."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
