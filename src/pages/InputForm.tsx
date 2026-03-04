import { useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ROLE_CONFIG: Record<string, { label: string; icon: string; fields: FieldDef[] }> = {
  student: {
    label: "Student",
    icon: "🎓",
    fields: [
      { name: "student_id", label: "Student ID", type: "text", required: true },
      { name: "class_name", label: "Class / Grade", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
    ],
  },
  teacher: {
    label: "Teacher",
    icon: "👨‍🏫",
    fields: [
      { name: "class_name", label: "Class Name", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "student_id", label: "Student ID (of the student being analyzed)", type: "text", required: true },
    ],
  },
  doctor: {
    label: "Doctor",
    icon: "🏥",
    fields: [
      { name: "patient_id", label: "Patient ID", type: "text", required: true },
      { name: "doctor_name", label: "Doctor Name", type: "text", required: true },
      { name: "medical_history", label: "Medical History", type: "textarea" },
      { name: "current_medications", label: "Current Medications", type: "textarea" },
      { name: "diagnosis_notes", label: "Preliminary Notes", type: "textarea" },
    ],
  },
  patient: {
    label: "Patient",
    icon: "🧑‍⚕️",
    fields: [
      { name: "patient_id", label: "Patient ID", type: "text", required: true },
      { name: "medical_history", label: "Medical History (optional)", type: "textarea" },
      { name: "current_medications", label: "Current Medications (optional)", type: "textarea" },
    ],
  },
  investigator: {
    label: "Investigator",
    icon: "🕵️",
    fields: [
      { name: "case_id", label: "Case ID", type: "text", required: true },
      { name: "suspect_id", label: "Subject ID", type: "text", required: true },
      { name: "investigation_type", label: "Investigation Type", type: "select", options: ["Interrogation", "Behavioral Analysis", "Stress Detection", "Lie Detection", "General"] },
      { name: "session_context", label: "Session Context / Notes", type: "textarea" },
    ],
  },
};

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  options?: string[];
}

const EEG_CHANNELS = ["alpha", "beta", "theta", "delta"] as const;
type ChannelName = typeof EEG_CHANNELS[number];

const CHANNEL_META: Record<ChannelName, { label: string; hz: string; color: string }> = {
  alpha: { label: "Alpha", hz: "8–13 Hz", color: "hsl(var(--primary))" },
  beta: { label: "Beta", hz: "13–30 Hz", color: "hsl(var(--glow-secondary))" },
  theta: { label: "Theta", hz: "4–8 Hz", color: "hsl(var(--success))" },
  delta: { label: "Delta", hz: "0.5–4 Hz", color: "hsl(var(--warning))" },
};

function parseNumericList(raw: string): number[] {
  return raw
    .split(/[\s,;\n]+/)
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
}

function parseCSV(text: string): Record<ChannelName, number[]> {
  const lines = text.trim().split("\n");
  const result: Record<string, number[]> = { alpha: [], beta: [], theta: [], delta: [] };

  if (lines.length < 2) return result as Record<ChannelName, number[]>;

  const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const channelIndices: Record<string, number> = {};
  for (const ch of EEG_CHANNELS) {
    const idx = headers.findIndex((h) => h.includes(ch));
    if (idx !== -1) channelIndices[ch] = idx;
  }

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    for (const ch of EEG_CHANNELS) {
      if (channelIndices[ch] !== undefined) {
        const val = parseFloat(cols[channelIndices[ch]]);
        result[ch].push(isNaN(val) ? 0 : val);
      }
    }
  }

  return result as Record<ChannelName, number[]>;
}

export default function InputForm() {
  const { module, role } = useParams<{ module: string; role: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [eegInput, setEegInput] = useState<"numeric" | "csv">("numeric");
  const [channelData, setChannelData] = useState<Record<ChannelName, string>>({
    alpha: "",
    beta: "",
    theta: "",
    delta: "",
  });
  const [csvText, setCsvText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const config = ROLE_CONFIG[role || ""];

  // Build EEG channels from input
  const eegChannels = useMemo((): Record<ChannelName, number[]> | null => {
    if (eegInput === "csv" && csvText.trim()) {
      return parseCSV(csvText);
    }
    if (eegInput === "numeric") {
      const parsed: Record<string, number[]> = {};
      let hasData = false;
      for (const ch of EEG_CHANNELS) {
        parsed[ch] = parseNumericList(channelData[ch]);
        if (parsed[ch].length > 0) hasData = true;
      }
      return hasData ? (parsed as Record<ChannelName, number[]>) : null;
    }
    return null;
  }, [eegInput, channelData, csvText]);

  // Preview chart data
  const previewData = useMemo(() => {
    if (!eegChannels) return null;
    const maxLen = Math.max(...EEG_CHANNELS.map((ch) => eegChannels[ch].length));
    if (maxLen === 0) return null;
    return Array.from({ length: maxLen }, (_, i) => ({
      time: i,
      alpha: eegChannels.alpha[i] ?? 0,
      beta: eegChannels.beta[i] ?? 0,
      theta: eegChannels.theta[i] ?? 0,
      delta: eegChannels.delta[i] ?? 0,
    }));
  }, [eegChannels]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setEegInput("csv");
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }, []);

  if (!config || !module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Invalid role or module.</p>
      </div>
    );
  }

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.person_name?.trim();
    const age = parseInt(form.person_age || "0");
    if (!name || !age || age < 1 || age > 150) {
      toast.error("Please enter a valid name and age.");
      return;
    }

    for (const f of config.fields) {
      if (f.required && !form[f.name]?.trim()) {
        toast.error(`Please fill in ${f.label}.`);
        return;
      }
    }

    if (!eegChannels || EEG_CHANNELS.every((ch) => eegChannels[ch].length === 0)) {
      toast.error("Please provide EEG data for at least one channel.");
      return;
    }

    setLoading(true);
    try {
      const moduleFormatted = module.charAt(0).toUpperCase() + module.slice(1);

      const insertData: Record<string, unknown> = {
        role: role,
        module: moduleFormatted,
        person_name: name,
        person_age: age,
        gender: form.gender || null,
        eeg_channels: eegChannels,
        session_type: eegInput === "csv" ? "csv_upload" : "manual_numeric",
      };

      for (const f of config.fields) {
        if (form[f.name]?.trim()) {
          insertData[f.name] = form[f.name].trim();
        }
      }

      const { data, error } = await supabase
        .from("eeg_sessions")
        .insert(insertData as any)
        .select("id")
        .single();

      if (error) throw error;

      toast.info("Processing EEG through AI pipeline...");

      const { error: fnError } = await supabase.functions.invoke("process-eeg", {
        body: { sessionId: data.id },
      });

      if (fnError) {
        console.error("Pipeline error:", fnError);
        toast.warning("Session saved but AI processing had an issue. Viewing results...");
      } else {
        toast.success("Analysis complete!");
      }

      navigate(`/results/${data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-bold text-lg">NeuroInsight <span className="text-primary">AI</span></span>
          </button>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Modules
          </button>
        </div>
      </nav>

      <div className="container py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <span className="text-4xl block mb-3">{config.icon}</span>
            <h1 className="text-2xl font-bold">{config.label} — EEG Analysis Input</h1>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{module} Module</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="bg-card-gradient border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">Person Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="person_name">Full Name *</Label>
                  <Input id="person_name" placeholder="Enter full name" value={form.person_name || ""} onChange={(e) => set("person_name", e.target.value)} maxLength={100} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person_age">Age *</Label>
                  <Input id="person_age" type="number" placeholder="Age" min={1} max={150} value={form.person_age || ""} onChange={(e) => set("person_age", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender (optional)</Label>
                <Select value={form.gender || ""} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Role-Specific Fields */}
            <div className="bg-card-gradient border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">{config.label} Details</h3>
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label} {field.required && "*"}</Label>
                  {field.type === "text" && (
                    <Input id={field.name} placeholder={field.label} value={form[field.name] || ""} onChange={(e) => set(field.name, e.target.value)} maxLength={200} required={field.required} />
                  )}
                  {field.type === "textarea" && (
                    <Textarea id={field.name} placeholder={field.label} value={form[field.name] || ""} onChange={(e) => set(field.name, e.target.value)} maxLength={1000} rows={3} />
                  )}
                  {field.type === "select" && field.options && (
                    <Select value={form[field.name] || ""} onValueChange={(v) => set(field.name, v)}>
                      <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>

            {/* EEG Data Input */}
            <div className="bg-card-gradient border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-primary uppercase tracking-wider">EEG Signal Data *</h3>
              <p className="text-xs text-muted-foreground">
                Provide your EEG readings. Enter numeric values per channel or upload a CSV file with columns: alpha, beta, theta, delta.
              </p>

              <Tabs value={eegInput} onValueChange={(v) => setEegInput(v as "numeric" | "csv")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="numeric">📊 Numeric Input</TabsTrigger>
                  <TabsTrigger value="csv">📁 CSV Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="numeric" className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Enter comma or space separated numeric values for each EEG channel (e.g. <code className="font-mono text-primary">12.5, -3.2, 8.1, 15.0, -7.3</code>)
                  </p>
                  {EEG_CHANNELS.map((ch) => (
                    <div key={ch} className="space-y-1.5">
                      <Label className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: CHANNEL_META[ch].color }} />
                        {CHANNEL_META[ch].label} <span className="text-xs text-muted-foreground font-mono">({CHANNEL_META[ch].hz})</span>
                      </Label>
                      <Textarea
                        placeholder={`Enter ${CHANNEL_META[ch].label} channel values...`}
                        value={channelData[ch]}
                        onChange={(e) => setChannelData((p) => ({ ...p, [ch]: e.target.value }))}
                        rows={2}
                        className="font-mono text-xs"
                      />
                      {channelData[ch] && (
                        <p className="text-xs text-muted-foreground">
                          {parseNumericList(channelData[ch]).length} data points parsed
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="csv" className="space-y-4 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Upload a CSV file with column headers: <code className="font-mono text-primary">alpha, beta, theta, delta</code>. Each row is a time sample.
                  </p>
                  <div className="flex gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
                    >
                      📁 Choose CSV File
                    </button>
                    {csvText && (
                      <span className="text-xs text-muted-foreground self-center">
                        {csvText.split("\n").length - 1} rows loaded
                      </span>
                    )}
                  </div>
                  {csvText && (
                    <Textarea
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      rows={6}
                      className="font-mono text-xs"
                      placeholder="CSV content..."
                    />
                  )}
                  {!csvText && (
                    <div className="border border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-xs text-muted-foreground">Or paste CSV content directly:</p>
                      <Textarea
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        rows={6}
                        className="font-mono text-xs mt-3"
                        placeholder={"alpha,beta,theta,delta\n12.5,8.3,15.2,20.1\n-3.1,5.7,12.8,18.4\n..."}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Live Preview Graph */}
              {previewData && previewData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border border-border rounded-lg p-4 mt-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">📈 Live Preview</h4>
                    <span className="text-xs font-mono text-muted-foreground">{previewData.length} samples</span>
                  </div>
                  <div className="space-y-1">
                    {EEG_CHANNELS.map((ch) => {
                      const hasData = eegChannels && eegChannels[ch].length > 0;
                      if (!hasData) return null;
                      return (
                        <div key={ch} className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-12">{CHANNEL_META[ch].label}</span>
                          <div className="flex-1 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={previewData}>
                                <YAxis hide domain={["auto", "auto"]} />
                                <Line type="monotone" dataKey={ch} stroke={CHANNEL_META[ch].color} strokeWidth={1.2} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 transition-all shadow-[0_0_30px_hsl(var(--glow-primary)/0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "🧠 Run AI Analysis"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
