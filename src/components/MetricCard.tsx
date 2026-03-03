import { motion } from "framer-motion";
import { ReactNode } from "react";

export function MetricCard({ title, value, unit, icon, glowColor = "primary", delay = 0 }: {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  glowColor?: "primary" | "success" | "warning" | "danger";
  delay?: number;
}) {
  const glowMap = {
    primary: "hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.2)]",
    success: "hover:shadow-[0_0_30px_hsl(var(--glow-success)/0.2)]",
    warning: "hover:shadow-[0_0_30px_hsl(var(--glow-warning)/0.2)]",
    danger: "hover:shadow-[0_0_30px_hsl(var(--glow-danger)/0.2)]",
  };

  const textMap = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-card-gradient border border-border rounded-lg p-5 transition-shadow duration-300 ${glowMap[glowColor]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold font-mono ${textMap[glowColor]}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}
