import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Target } from "lucide-react";
import { TimelineItem } from "../shared/TimelineItem";

interface NadaSlide14RoadmapProps { forCapture?: boolean; }

const milestones = [
  { date: "January 2026", title: "Administrative Setup", description: "Finalize PMU engagement; Issue DO letters to CBI, FSSAI, and NCRB", variant: "blue" as const },
  { date: "February 2026 (Week 1-2)", title: "International Compliance", description: "UNESCO Compliance Meeting with FSSAI as a special invitee", variant: "cyan" as const },
  { date: "Ongoing", title: "Continuous Implementation", description: "Implementation of regional education modules and recruitment-based dope testing", variant: "teal" as const },
];

const deliverables = ["PMU operational with performance metrics", "Inter-agency MOUs signed", "Regional education modules launched", "Recruitment testing protocols established"];

export const NadaSlide14Roadmap = ({ forCapture = false }: NadaSlide14RoadmapProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <span className="nada-badge-blue mb-4"><Calendar className="w-5 h-5" />Q1 2026</span>
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3 mt-4">Strategic Roadmap</h2>
        <p className="text-xl text-muted-foreground">Immediate Deadlines & Milestones</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
        <div>
          {milestones.map((milestone, index) => (
            <TimelineItem key={milestone.title} date={milestone.date} title={milestone.title} description={milestone.description} isLast={index === milestones.length - 1} forCapture={forCapture} delay={0.1 + index * 0.1} variant={milestone.variant} />
          ))}
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Key Deliverables</h3>
          {deliverables.map((deliverable, index) => (
            <motion.div key={deliverable} initial={forCapture ? false : { opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.2 + index * 0.08, duration: 0.4 }} className="flex items-center gap-4 p-5 rounded-xl nada-glass-card">
              <CheckCircle2 className="w-6 h-6 text-[hsl(145,70%,35%)] flex-shrink-0" />
              <span className="text-lg text-muted-foreground">{deliverable}</span>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};
