import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EEGWaveform } from "@/components/EEGWaveform";
import heroBrain from "@/assets/hero-brain.jpg";

const features = [
  { icon: "🧠", title: "Neural Analysis", desc: "Real-time EEG signal processing with ML-powered classification" },
  { icon: "📊", title: "Mental Scoring", desc: "0-100 mental state scoring with confidence metrics" },
  { icon: "⚡", title: "Real-time Streaming", desc: "WebSocket-based live brainwave monitoring" },
  { icon: "🔒", title: "Role-Based Access", desc: "Dedicated workflows for education, healthcare & investigation" },
  { icon: "📈", title: "Predictive Analytics", desc: "Depression risk, stress probability & cognitive performance" },
  { icon: "📄", title: "Report Generation", desc: "Downloadable PDF & CSV reports with AI summaries" },
];

const stats = [
  { value: "99.2%", label: "Classification Accuracy" },
  { value: "<50ms", label: "Processing Latency" },
  { value: "5", label: "Brain Wave Channels" },
  { value: "6", label: "AI Models" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-bold text-lg text-foreground">NeuroInsight <span className="text-primary">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pipeline" className="hover:text-foreground transition-colors">Pipeline</a>
            <a href="#roles" className="hover:text-foreground transition-colors">Roles</a>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background z-10" />
          <img src={heroBrain} alt="" className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] opacity-30" />
        </div>

        <div className="container relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered EEG Analysis Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-foreground">Decode the</span>
              <br />
              <span className="text-gradient-primary">Human Mind</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Enterprise-grade neural signal analysis platform. Real-time EEG processing,
              mental state classification, and predictive diagnostics powered by deep learning.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 transition-all shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)]"
              >
                Open Dashboard
              </button>
              <a
                href="#features"
                className="px-8 py-3 rounded-lg border border-border text-foreground font-medium text-base hover:bg-secondary transition-all"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* EEG Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="bg-card-gradient border border-border rounded-xl p-6 glow-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="text-xs font-mono text-muted-foreground ml-2">live_eeg_stream.session</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Alpha (8-13 Hz)", color: "hsl(var(--primary))", freq: 10 },
                  { label: "Beta (13-30 Hz)", color: "hsl(var(--glow-secondary))", freq: 20 },
                  { label: "Theta (4-8 Hz)", color: "hsl(var(--success))", freq: 6 },
                  { label: "Delta (0.5-4 Hz)", color: "hsl(var(--warning))", freq: 2 },
                ].map((ch) => (
                  <div key={ch.label}>
                    <span className="text-xs font-mono text-muted-foreground">{ch.label}</span>
                    <EEGWaveform color={ch.color} frequency={ch.freq} amplitude={25} className="h-16" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold font-mono text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">End-to-end neural signal analysis from raw EEG input to actionable mental health insights.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card-gradient border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" className="py-20 px-4 bg-neural-gradient">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">AI Processing Pipeline</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
            {["EEG Input", "Preprocessing", "Feature Extraction", "AI Classification", "Score Thresholds", "Result Display"].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="px-5 py-3 rounded-lg border border-border bg-card font-mono text-sm whitespace-nowrap">
                  <span className="text-primary mr-2">{String(i + 1).padStart(2, "0")}</span>
                  {step}
                </div>
                {i < 5 && <span className="text-muted-foreground hidden md:inline">→</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-20 px-4">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Role-Based Dashboards</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-14">Tailored workflows for education, healthcare, and investigation professionals.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "🎓", title: "Student", desc: "Personal cognitive performance tracking" },
              { icon: "👨‍🏫", title: "Teacher", desc: "Class-wide mental health analytics" },
              { icon: "🏥", title: "Doctor", desc: "Clinical diagnostic assessments" },
              { icon: "🧑‍⚕️", title: "Patient", desc: "Daily mental health monitoring" },
              { icon: "🕵️", title: "Investigator", desc: "Real-time behavioral analysis" },
            ].map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card-gradient border border-border rounded-lg p-6 hover:border-primary/30 transition-all"
              >
                <div className="text-4xl mb-3">{r.icon}</div>
                <h3 className="font-semibold text-lg">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <span className="font-bold text-foreground">NeuroInsight <span className="text-primary">AI</span></span>
          </div>
          <p className="text-sm text-muted-foreground">Enterprise-grade EEG analysis platform powered by deep learning.</p>
        </div>
      </footer>
    </div>
  );
}
