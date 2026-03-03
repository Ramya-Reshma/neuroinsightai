import { useMemo } from "react";

// Generate mock EEG-like waveform data
export function generateEEGData(points: number = 200, frequency: number = 1, amplitude: number = 50, noise: number = 10) {
  return Array.from({ length: points }, (_, i) => {
    const t = i / points * Math.PI * 2 * frequency;
    return {
      time: i,
      value: Math.sin(t) * amplitude + Math.sin(t * 3.7) * (amplitude * 0.3) + (Math.random() - 0.5) * noise,
    };
  });
}

export function generateMultiChannelEEG(points: number = 200) {
  return Array.from({ length: points }, (_, i) => {
    const t = i / points * Math.PI * 2;
    return {
      time: i,
      alpha: Math.sin(t * 10) * 30 + (Math.random() - 0.5) * 8,
      beta: Math.sin(t * 20) * 20 + (Math.random() - 0.5) * 12,
      theta: Math.sin(t * 5) * 40 + (Math.random() - 0.5) * 6,
      delta: Math.sin(t * 2) * 50 + (Math.random() - 0.5) * 4,
    };
  });
}

export function useEEGData(points?: number) {
  return useMemo(() => generateMultiChannelEEG(points), [points]);
}

export interface MentalScore {
  score: number;
  label: string;
  emoji: string;
  color: string;
  confidence: number;
  stressProbability: number;
  depressionRisk: number;
  cognitivePerformance: number;
  attentionScore: number;
  emotionalStability: number;
}

export function classifyMentalState(score: number): MentalScore {
  let label: string, emoji: string, color: string;

  if (score > 75) { label = "Happy"; emoji = "😊"; color = "hsl(var(--success))"; }
  else if (score > 65) { label = "Normal"; emoji = "🙂"; color = "hsl(var(--primary))"; }
  else if (score > 45) { label = "Slightly Low"; emoji = "😐"; color = "hsl(var(--warning))"; }
  else if (score > 25) { label = "Sad"; emoji = "😔"; color = "hsl(var(--glow-warning))"; }
  else if (score > 5) { label = "Depressed"; emoji = "😞"; color = "hsl(var(--destructive))"; }
  else { label = "Severe Risk"; emoji = "⚠️"; color = "hsl(var(--destructive))"; }

  return {
    score,
    label,
    emoji,
    color,
    confidence: 85 + Math.random() * 12,
    stressProbability: Math.max(0, 100 - score + (Math.random() - 0.5) * 20),
    depressionRisk: Math.max(0, Math.min(100, 80 - score + (Math.random() - 0.5) * 15)),
    cognitivePerformance: Math.min(100, score + (Math.random() - 0.5) * 10),
    attentionScore: Math.min(100, score * 0.9 + Math.random() * 15),
    emotionalStability: Math.min(100, score * 0.85 + Math.random() * 20),
  };
}

export const ROLES = [
  { id: "student", label: "Student", icon: "🎓", module: "Education", description: "Track your mental performance and cognitive insights" },
  { id: "teacher", label: "Teacher", icon: "👨‍🏫", module: "Education", description: "Monitor class-wide mental health and attention analytics" },
  { id: "doctor", label: "Doctor", icon: "🏥", module: "Healthcare", description: "Clinical mental health risk assessment and diagnostics" },
  { id: "patient", label: "Patient", icon: "🧑‍⚕️", module: "Healthcare", description: "Personal mental health tracking and AI recommendations" },
  { id: "investigator", label: "Investigator", icon: "🕵️", module: "Investigation", description: "Real-time EEG monitoring and behavioral analysis" },
] as const;

export type RoleId = typeof ROLES[number]["id"];
