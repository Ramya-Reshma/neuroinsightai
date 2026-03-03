import { motion } from "framer-motion";
import { ROLES, type RoleId } from "@/lib/eeg-data";

export function RoleSelector({ onSelect }: { onSelect: (role: RoleId) => void }) {
  const modules = [...new Set(ROLES.map(r => r.module))];

  return (
    <div className="space-y-8">
      {modules.map((mod) => (
        <div key={mod}>
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4">{mod} Module</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.filter(r => r.module === mod).map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSelect(role.id)}
                className="group bg-card-gradient border border-border rounded-lg p-5 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.15)]"
              >
                <div className="text-3xl mb-3">{role.icon}</div>
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{role.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
