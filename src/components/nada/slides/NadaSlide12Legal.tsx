import { motion } from "framer-motion";
import { Scale, Pill, ShieldAlert, FileWarning } from "lucide-react";

interface NadaSlide12LegalProps { forCapture?: boolean; }

const legalFrameworks = [
  { act: "NDPS Act, 1985", targets: "Narcotics/Psychotropics (Cocaine/Heroin)", maxPenalty: "20 Years", icon: ShieldAlert, severity: "critical" },
  { act: "Drugs & Cosmetics Act, 1940", targets: "Steroids/Hormones (Schedule H)", maxPenalty: "10 Years", icon: Pill, severity: "high" },
  { act: "Food Safety (FSS) Act, 2006", targets: "Contaminated/Unsafe Supplements", maxPenalty: "₹10 Lakh / 7 Years", icon: FileWarning, severity: "medium" },
  { act: "BNS (IPC)", targets: "Cheating & Organized Fraud (Section 420)", maxPenalty: "7 Years", icon: Scale, severity: "medium" },
];

const severityColors = { critical: "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]", high: "from-[hsl(30,90%,50%)] to-[hsl(40,95%,55%)]", medium: "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]" };
const severityBadges = { critical: "nada-badge-red", high: "nada-badge-orange", medium: "nada-badge-blue" };

export const NadaSlide12Legal = ({ forCapture = false }: NadaSlide12LegalProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Categorization under Indian Statutory Frameworks</h2>
        <p className="text-xl text-muted-foreground">Legal Mapping of Violations</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {legalFrameworks.map((framework, index) => (
          <motion.div key={framework.act} initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.1 + index * 0.08, duration: 0.4 }} className="nada-glass-card rounded-xl p-6">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${severityColors[framework.severity as keyof typeof severityColors]} flex-shrink-0`}>
                <framework.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">{framework.act}</h3>
                <p className="text-lg text-muted-foreground mb-4">{framework.targets}</p>
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">Maximum Penalty</span>
                  <span className={`${severityBadges[framework.severity as keyof typeof severityBadges]}`}>{framework.maxPenalty}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }} className="nada-glass-card rounded-xl overflow-hidden">
        <table className="nada-table">
          <thead><tr><th className="text-base">Legal Framework</th><th className="text-base">Target Substances</th><th className="text-base text-right">Max Penalty</th></tr></thead>
          <tbody>
            {legalFrameworks.map((framework) => (
              <tr key={framework.act}>
                <td className="text-base font-semibold text-foreground">{framework.act}</td>
                <td className="text-base text-muted-foreground">{framework.targets}</td>
                <td className="text-right"><span className={`${severityBadges[framework.severity as keyof typeof severityBadges]}`}>{framework.maxPenalty}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
