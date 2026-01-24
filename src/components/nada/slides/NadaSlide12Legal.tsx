import { motion } from "framer-motion";
import { Scale, Pill, ShieldAlert, FileWarning } from "lucide-react";
import { DataTable } from "../shared/DataTable";

interface NadaSlide12LegalProps {
  forCapture?: boolean;
}

const legalFrameworks = [
  {
    act: "NDPS Act, 1985",
    targets: "Narcotics/Psychotropics (Cocaine/Heroin)",
    maxPenalty: "20 Years",
    icon: ShieldAlert,
    severity: "critical",
  },
  {
    act: "Drugs & Cosmetics Act, 1940",
    targets: "Steroids/Hormones (Schedule H)",
    maxPenalty: "10 Years",
    icon: Pill,
    severity: "high",
  },
  {
    act: "Food Safety (FSS) Act, 2006",
    targets: "Contaminated/Unsafe Supplements",
    maxPenalty: "₹10 Lakh / 7 Years",
    icon: FileWarning,
    severity: "medium",
  },
  {
    act: "BNS (IPC)",
    targets: "Cheating & Organized Fraud (Section 420)",
    maxPenalty: "7 Years",
    icon: Scale,
    severity: "medium",
  },
];

export const NadaSlide12Legal = ({ forCapture = false }: NadaSlide12LegalProps) => {
  const severityColors = {
    critical: "bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]",
    high: "bg-gradient-to-br from-[hsl(30,90%,50%)] to-[hsl(40,95%,55%)]",
    medium: "bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]",
  };

  const severityBadges = {
    critical: "nada-badge-red",
    high: "nada-badge-orange",
    medium: "nada-badge-blue",
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold nada-gradient-text mb-2">
          Categorization under Indian Statutory Frameworks
        </h2>
        <p className="text-muted-foreground">Legal Mapping of Violations</p>
      </motion.div>

      {/* Legal Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {legalFrameworks.map((framework, index) => (
          <motion.div
            key={framework.act}
            initial={forCapture ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.2 + index * 0.1, duration: 0.5 }}
            className="nada-glass-card rounded-xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${severityColors[framework.severity as keyof typeof severityColors]} flex-shrink-0`}>
                <framework.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-foreground">{framework.act}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{framework.targets}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Maximum Penalty</span>
                  <span className={`${severityBadges[framework.severity as keyof typeof severityBadges]} text-xs`}>
                    {framework.maxPenalty}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Table */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
        className="nada-glass-card rounded-xl overflow-hidden"
      >
        <table className="nada-table">
          <thead>
            <tr>
              <th>Legal Framework</th>
              <th>Target Substances</th>
              <th className="text-right">Max Penalty</th>
            </tr>
          </thead>
          <tbody>
            {legalFrameworks.map((framework, index) => (
              <motion.tr
                key={framework.act}
                initial={forCapture ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.8 + index * 0.08, duration: 0.4 }}
              >
                <td className="font-medium text-foreground">{framework.act}</td>
                <td className="text-muted-foreground">{framework.targets}</td>
                <td className="text-right">
                  <span className={`${severityBadges[framework.severity as keyof typeof severityBadges]} text-xs`}>
                    {framework.maxPenalty}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Note */}
      <motion.p
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 1.2, duration: 0.4 }}
        className="text-center text-sm text-muted-foreground mt-4"
      >
        Multiple legal frameworks provide comprehensive coverage for different types of doping violations
      </motion.p>
    </div>
  );
};
