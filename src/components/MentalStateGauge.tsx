import { motion } from "framer-motion";

export function MentalStateGauge({ score, label, emoji, size = 180 }: {
  score: number;
  label: string;
  emoji: string;
  size?: number;
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius * 0.75; // 270 degrees
  const progress = (score / 100) * circumference;
  const rotation = 135; // start angle

  const getColor = () => {
    if (score > 75) return "hsl(var(--success))";
    if (score > 65) return "hsl(var(--primary))";
    if (score > 45) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring" }}
      className="flex flex-col items-center"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeDasharray={`${circumference} ${2 * Math.PI * radius - circumference}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeDasharray={`${progress} ${2 * Math.PI * radius - progress}`}
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${2 * Math.PI * radius}` }}
          animate={{ strokeDasharray: `${progress} ${2 * Math.PI * radius - progress}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${getColor()})` }}
        />
        {/* Center text */}
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" className="fill-foreground text-3xl font-bold font-mono">
          {score}
        </text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" className="fill-muted-foreground text-xs">
          Mental Score
        </text>
      </svg>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-lg font-semibold" style={{ color: getColor() }}>{label}</span>
      </div>
    </motion.div>
  );
}
