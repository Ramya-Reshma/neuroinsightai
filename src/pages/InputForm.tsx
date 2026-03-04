import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function InputForm() {
  const { module, role } = useParams<{ module: string; role: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const config = ROLE_CONFIG[role || ""];
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

    // Validate required role-specific fields
    for (const f of config.fields) {
      if (f.required && !form[f.name]?.trim()) {
        toast.error(`Please fill in ${f.label}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const moduleFormatted = module.charAt(0).toUpperCase() + module.slice(1);
      
      // Generate simulated EEG channel data (in a real app this would come from a device)
      const eegChannels = {
        alpha: Array.from({ length: 200 }, (_, i) => Math.sin(i / 200 * Math.PI * 2 * 10) * 30 + (Math.random() - 0.5) * 8),
        beta: Array.from({ length: 200 }, (_, i) => Math.sin(i / 200 * Math.PI * 2 * 20) * 20 + (Math.random() - 0.5) * 12),
        theta: Array.from({ length: 200 }, (_, i) => Math.sin(i / 200 * Math.PI * 2 * 5) * 40 + (Math.random() - 0.5) * 6),
        delta: Array.from({ length: 200 }, (_, i) => Math.sin(i / 200 * Math.PI * 2 * 2) * 50 + (Math.random() - 0.5) * 4),
      };

      const insertData: Record<string, unknown> = {
        role: role,
        module: moduleFormatted,
        person_name: name,
        person_age: age,
        gender: form.gender || null,
        eeg_channels: eegChannels,
        session_type: "manual",
      };

      // Add role-specific fields
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

      // Now call the AI pipeline edge function
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

      <div className="container py-12 max-w-2xl">
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
                  <Input
                    id="person_name"
                    placeholder="Enter full name"
                    value={form.person_name || ""}
                    onChange={(e) => set("person_name", e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="person_age">Age *</Label>
                  <Input
                    id="person_age"
                    type="number"
                    placeholder="Age"
                    min={1}
                    max={150}
                    value={form.person_age || ""}
                    onChange={(e) => set("person_age", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender (optional)</Label>
                <Select value={form.gender || ""} onValueChange={(v) => set("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
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
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && "*"}
                  </Label>
                  {field.type === "text" && (
                    <Input
                      id={field.name}
                      placeholder={field.label}
                      value={form[field.name] || ""}
                      onChange={(e) => set(field.name, e.target.value)}
                      maxLength={200}
                      required={field.required}
                    />
                  )}
                  {field.type === "textarea" && (
                    <Textarea
                      id={field.name}
                      placeholder={field.label}
                      value={form[field.name] || ""}
                      onChange={(e) => set(field.name, e.target.value)}
                      maxLength={1000}
                      rows={3}
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select value={form[field.name] || ""} onValueChange={(v) => set(field.name, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
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

            {/* EEG Input Info */}
            <div className="bg-card-gradient border border-border rounded-xl p-6">
              <h3 className="font-semibold text-sm text-primary uppercase tracking-wider mb-3">EEG Signal Input</h3>
              <p className="text-sm text-muted-foreground">
                EEG signal data will be simulated for this session. In production, signals would stream from a connected EEG device (Alpha, Beta, Theta, Delta channels).
              </p>
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
