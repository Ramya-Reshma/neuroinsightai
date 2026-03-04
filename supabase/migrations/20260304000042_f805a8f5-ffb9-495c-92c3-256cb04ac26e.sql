
-- Create EEG sessions table to store each analysis session
CREATE TABLE public.eeg_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'doctor', 'patient', 'investigator')),
  module TEXT NOT NULL CHECK (module IN ('Education', 'Healthcare', 'Investigation')),
  
  -- Common person details
  person_name TEXT NOT NULL,
  person_age INTEGER NOT NULL,
  gender TEXT,
  
  -- Role-specific fields (nullable based on role)
  -- Education
  student_id TEXT,
  class_name TEXT,
  institution TEXT,
  
  -- Healthcare
  patient_id TEXT,
  medical_history TEXT,
  current_medications TEXT,
  doctor_name TEXT,
  diagnosis_notes TEXT,
  
  -- Investigation
  case_id TEXT,
  suspect_id TEXT,
  investigation_type TEXT,
  session_context TEXT,
  
  -- EEG Input data
  eeg_channels JSONB NOT NULL DEFAULT '{}',
  session_type TEXT NOT NULL DEFAULT 'manual',
  device_id TEXT,
  
  -- AI Results
  mental_score NUMERIC,
  confidence NUMERIC,
  stress_probability NUMERIC,
  depression_risk NUMERIC,
  cognitive_performance NUMERIC,
  attention_score NUMERIC,
  emotional_stability NUMERIC,
  mental_state_label TEXT,
  ai_summary TEXT,
  
  -- Band power results
  alpha_power NUMERIC,
  beta_power NUMERIC,
  theta_power NUMERIC,
  delta_power NUMERIC,
  gamma_power NUMERIC,
  
  -- Stress timeline data
  stress_timeline JSONB,
  radar_data JSONB,
  
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eeg_sessions ENABLE ROW LEVEL SECURITY;

-- Public insert policy (no auth required for now)
CREATE POLICY "Anyone can create sessions"
  ON public.eeg_sessions FOR INSERT
  WITH CHECK (true);

-- Public select policy
CREATE POLICY "Anyone can view sessions"
  ON public.eeg_sessions FOR SELECT
  USING (true);

-- Public update policy
CREATE POLICY "Anyone can update sessions"
  ON public.eeg_sessions FOR UPDATE
  USING (true);
