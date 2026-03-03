import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { generateEEGData } from "@/lib/eeg-data";
import { useMemo } from "react";

export function EEGWaveform({ color = "hsl(var(--primary))", frequency = 8, amplitude = 30, className = "" }: {
  color?: string;
  frequency?: number;
  amplitude?: number;
  className?: string;
}) {
  const data = useMemo(() => generateEEGData(150, frequency, amplitude, 8), [frequency, amplitude]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
