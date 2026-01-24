import { motion } from "framer-motion";
import { Calendar, FileText, Users, GraduationCap, CheckCircle2, Target } from "lucide-react";
import { TimelineItem } from "../shared/TimelineItem";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide14RoadmapProps {
  forCapture?: boolean;
}

const milestones = [
  {
    date: "January 2026",
    title: "Administrative Setup",
    description: "Finalize PMU engagement; Issue DO letters to CBI, FSSAI, and NCRB",
    icon: FileText,
    variant: "blue" as const,
  },
  {
    date: "February 2026 (Week 1-2)",
    title: "International Compliance",
    description: "UNESCO Compliance Meeting with FSSAI as a special invitee",
    icon: Users,
    variant: "cyan" as const,
  },
  {
    date: "Ongoing",
    title: "Continuous Implementation",
    description: "Implementation of regional education modules and recruitment-based dope testing",
    icon: GraduationCap,
    variant: "teal" as const,
  },
];

export const NadaSlide14Roadmap = ({ forCapture = false }: NadaSlide14RoadmapProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="nada-badge-blue mb-4">
          <Calendar className="w-4 h-4" />
          Q1 2026
        </span>
        <h2 className="text-3xl md:text-4xl font-bold nada-gradient-text mb-2 mt-3">
          Strategic Roadmap
        </h2>
        <p className="text-muted-foreground">Immediate Deadlines & Milestones</p>
      </motion.div>

      {/* Timeline and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Timeline */}
        <div>
          {milestones.map((milestone, index) => (
            <TimelineItem
              key={milestone.title}
              date={milestone.date}
              title={milestone.title}
              description={milestone.description}
              isLast={index === milestones.length - 1}
              forCapture={forCapture}
              delay={0.2 + index * 0.15}
              variant={milestone.variant}
            />
          ))}
        </div>

        {/* Right: Key Deliverables */}
        <div className="space-y-4">
          <motion.h3
            initial={forCapture ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.4 }}
            className="text-lg font-semibold text-foreground"
          >
            Key Deliverables
          </motion.h3>

          {[
            "PMU operational with performance metrics",
            "Inter-agency MOUs signed",
            "Regional education modules launched",
            "Recruitment testing protocols established",
          ].map((deliverable, index) => (
            <motion.div
              key={deliverable}
              initial={forCapture ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.4 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg nada-glass-card"
            >
              <CheckCircle2 className="w-5 h-5 text-[hsl(145,70%,35%)] flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{deliverable}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conclusion Banner */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.9, duration: 0.6 }}
        className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)] text-white text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Target className="w-8 h-8" />
          <h3 className="text-2xl font-bold">Conclusion</h3>
        </div>
        <p className="text-lg opacity-90">
          Building a cleaner, fairer, and stronger sporting nation.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <span className="px-4 py-1 rounded-full bg-white/20 text-sm">Zero Tolerance</span>
          <span className="px-4 py-1 rounded-full bg-white/20 text-sm">Ecosystem Accountability</span>
          <span className="px-4 py-1 rounded-full bg-white/20 text-sm">Global Standards</span>
        </div>
      </motion.div>
    </div>
  );
};
