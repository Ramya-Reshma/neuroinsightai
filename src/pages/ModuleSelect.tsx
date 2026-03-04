import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MODULES = [
  {
    id: "Education",
    icon: "🎓",
    title: "Education Module",
    desc: "Track student cognitive performance and classroom mental health analytics",
    roles: [
      { id: "student", label: "Student", icon: "🎓", desc: "Personal cognitive tracking" },
      { id: "teacher", label: "Teacher", icon: "👨‍🏫", desc: "Class-wide analytics" },
    ],
  },
  {
    id: "Healthcare",
    icon: "🏥",
    title: "Healthcare Module",
    desc: "Clinical mental health diagnostics and patient monitoring",
    roles: [
      { id: "doctor", label: "Doctor", icon: "🏥", desc: "Clinical diagnostics" },
      { id: "patient", label: "Patient", icon: "🧑‍⚕️", desc: "Personal health tracking" },
    ],
  },
  {
    id: "Investigation",
    icon: "🕵️",
    title: "Investigation Module",
    desc: "Real-time behavioral analysis and stress detection",
    roles: [
      { id: "investigator", label: "Investigator", icon: "🕵️", desc: "Behavioral analysis" },
    ],
  },
];

export default function ModuleSelect() {
  const navigate = useNavigate();

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

      <div className="container py-16 max-w-5xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Select Module & Role</h1>
          <p className="text-muted-foreground">Choose your module to begin EEG analysis</p>
        </motion.div>

        <div className="space-y-10">
          {MODULES.map((mod, mi) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.15 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{mod.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{mod.title}</h2>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mod.roles.map((role, ri) => (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: mi * 0.15 + ri * 0.08 }}
                    onClick={() => navigate(`/input/${mod.id.toLowerCase()}/${role.id}`)}
                    className="group bg-card-gradient border border-border rounded-lg p-5 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.15)]"
                  >
                    <div className="text-3xl mb-3">{role.icon}</div>
                    <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{role.label}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{role.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
