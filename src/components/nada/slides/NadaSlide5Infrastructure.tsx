import { motion } from "framer-motion";
import { Building2, Megaphone, Server, CheckCircle2, ArrowRight } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide5InfrastructureProps {
  forCapture?: boolean;
}

const initiatives = [
  {
    icon: Building2,
    title: "Project Management Unit (PMU)",
    description: "Adopting the NSDF model for administrative efficiency with penalty-linked deliverables.",
    features: ["NSDF Model Adoption", "Performance Metrics", "Penalty-Linked KPIs"],
    badge: "Administrative",
    variant: "blue" as const,
  },
  {
    icon: Megaphone,
    title: "Communication Surge",
    description: "Engaging a specialized agency via the Central Bureau of Communication (CBC) for pan-India media blitzes.",
    features: ["CBC Partnership", "Pan-India Reach", "Media Campaigns"],
    badge: "Outreach",
    variant: "cyan" as const,
  },
  {
    icon: Server,
    title: "Strategic Vendor",
    description: "Leveraging empanelled vendors of the National e-Governance Division for technological support.",
    features: ["NeGD Vendors", "Tech Integration", "Digital Platform"],
    badge: "Technology",
    variant: "teal" as const,
  },
];

export const NadaSlide5Infrastructure = ({ forCapture = false }: NadaSlide5InfrastructureProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.4 }}
        className="text-center mb-8"
      >
        <span className="nada-badge-blue mb-4">NADA 2.0</span>
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3 mt-4">
          Modernizing Operations & Communications
        </h2>
        <p className="text-xl text-muted-foreground">Infrastructure Upgrade Initiative</p>
      </motion.div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {initiatives.map((initiative, index) => (
          <NadaGlassmorphicCard
            key={initiative.title}
            forCapture={forCapture}
            delay={0.1 + index * 0.1}
            className="p-8 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${
                initiative.variant === "blue" 
                  ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]"
                  : initiative.variant === "cyan"
                  ? "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]"
                  : "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]"
              }`}>
                <initiative.icon className="w-8 h-8 text-white" />
              </div>
              <span className={`${
                initiative.variant === "blue" ? "nada-badge-blue" 
                : initiative.variant === "cyan" ? "nada-badge-cyan"
                : "nada-badge-teal"
              }`}>
                {initiative.badge}
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl font-bold text-foreground mb-3">{initiative.title}</h3>
            <p className="text-lg text-muted-foreground mb-6 flex-grow leading-relaxed">{initiative.description}</p>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t-2 border-border/30">
              {initiative.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature}
                  initial={forCapture ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={forCapture ? { duration: 0 } : { delay: 0.25 + index * 0.08 + featureIndex * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[hsl(145,70%,35%)]" />
                  <span className="text-base text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Integration Flow */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
        className="nada-glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <span className="text-xl font-bold text-foreground">PMU</span>
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
          <span className="text-xl font-bold text-foreground">CBC Media</span>
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
          <span className="text-xl font-bold text-foreground">NeGD Tech</span>
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
          <span className="nada-badge-green">
            <CheckCircle2 className="w-5 h-5" />
            Integrated NADA 2.0
          </span>
        </div>
      </motion.div>
    </div>
  );
};
