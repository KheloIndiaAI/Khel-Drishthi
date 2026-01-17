import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Building2 } from "lucide-react";

// Generate calendar days from Feb 12 to March 9, 2026
interface CalendarDay {
  date: number;
  month: string;
  isHighlighted: boolean;
  highlightColor?: string;
  festival?: string;
  festivalColor?: string;
}

const generateCalendarWeeks = (): CalendarDay[][] => {
  const weeks: CalendarDay[][] = [];
  
  // Week 1: Feb 12-15 (Thu-Sun)
  weeks.push([
    { date: 12, month: "Feb", isHighlighted: false },
    { date: 13, month: "Feb", isHighlighted: false },
    { date: 14, month: "Feb", isHighlighted: false },
    { date: 15, month: "Feb", isHighlighted: false, festival: "Maha Shivaratri", festivalColor: "#6B21A8" },
  ]);
  
  // Week 2: Feb 16-22 (Mon-Sun)
  weeks.push([
    { date: 16, month: "Feb", isHighlighted: false },
    { date: 17, month: "Feb", isHighlighted: false },
    { date: 18, month: "Feb", isHighlighted: false },
    { date: 19, month: "Feb", isHighlighted: true, highlightColor: "#FF9933" },
    { date: 20, month: "Feb", isHighlighted: true, highlightColor: "#FF9933" },
    { date: 21, month: "Feb", isHighlighted: true, highlightColor: "#FF9933" },
    { date: 22, month: "Feb", isHighlighted: true, highlightColor: "#FF9933" },
  ]);
  
  // Week 3: Feb 23-Mar 1 (Mon-Sun)
  weeks.push([
    { date: 23, month: "Feb", isHighlighted: false },
    { date: 24, month: "Feb", isHighlighted: false },
    { date: 25, month: "Feb", isHighlighted: false },
    { date: 26, month: "Feb", isHighlighted: true, highlightColor: "#138808" },
    { date: 27, month: "Feb", isHighlighted: true, highlightColor: "#138808" },
    { date: 28, month: "Feb", isHighlighted: true, highlightColor: "#138808" },
    { date: 1, month: "Mar", isHighlighted: true, highlightColor: "#138808" },
  ]);
  
  // Week 4: Mar 2-8 (Mon-Sun)
  weeks.push([
    { date: 2, month: "Mar", isHighlighted: false },
    { date: 3, month: "Mar", isHighlighted: false },
    { date: 4, month: "Mar", isHighlighted: false, festival: "Holi", festivalColor: "#EC4899" },
    { date: 5, month: "Mar", isHighlighted: true, highlightColor: "#000080" },
    { date: 6, month: "Mar", isHighlighted: true, highlightColor: "#000080" },
    { date: 7, month: "Mar", isHighlighted: true, highlightColor: "#000080" },
    { date: 8, month: "Mar", isHighlighted: true, highlightColor: "#000080" },
  ]);
  
  // Week 5: Mar 9 (Mon)
  weeks.push([
    { date: 9, month: "Mar", isHighlighted: false },
  ]);
  
  return weeks;
};

const calendarWeeks = generateCalendarWeeks();

export const Slide6Timing = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header with Date Motion */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Strategic Timing
        </h2>
        
        {/* Animated Date Range */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF9933]/20 via-white to-[#138808]/20 border border-white/40 shadow-lg"
        >
          <motion.span
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-[#FF9933]"
          >
            12 Feb
          </motion.span>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="w-8 md:w-16 h-0.5 bg-[#000080]/40"
          />
          <motion.span
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-[#138808]"
          >
            09 Mar
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg text-[#000080] font-medium"
          >
            2026
          </motion.span>
        </motion.div>

        {/* Parliament Break Context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#000080]/10"
        >
          <Building2 className="w-4 h-4 text-[#000080]" />
          <span className="text-sm font-medium text-[#000080]">
            Parliament Budget Session Break
          </span>
        </motion.div>
      </motion.div>

      {/* Full Calendar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <GlassmorphicCard className="p-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-xs font-semibold text-[#000080]/70 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Weeks */}
          <div className="space-y-2">
            {calendarWeeks.map((week, weekIndex) => (
              <motion.div
                key={weekIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + weekIndex * 0.1 }}
                className="grid grid-cols-7 gap-2"
              >
                {/* Add empty cells for first week alignment (starts Thursday) */}
                {weekIndex === 0 && [0, 1, 2].map((i) => (
                  <div key={`empty-start-${i}`} className="h-12" />
                ))}
                
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${day.month}-${day.date}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + weekIndex * 0.1 + dayIndex * 0.03 }}
                    className={`h-14 md:h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-300 relative ${
                      day.isHighlighted
                        ? "text-white shadow-lg transform hover:scale-105"
                        : day.festival
                        ? "shadow-md transform hover:scale-105"
                        : "bg-white/50 text-foreground hover:bg-white/70"
                    }`}
                    style={{
                      backgroundColor: day.isHighlighted 
                        ? day.highlightColor 
                        : day.festival 
                        ? day.festivalColor 
                        : undefined,
                    }}
                  >
                    <span className={`text-lg md:text-xl font-bold ${day.festival ? 'text-white' : ''}`}>
                      {day.date}
                    </span>
                    {day.festival ? (
                      <span className="text-[8px] md:text-[10px] text-white/90 font-medium">
                        {day.festival}
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-70">{day.month}</span>
                    )}
                  </motion.div>
                ))}
                
                {/* Add empty cells for last week (ends Monday) */}
                {weekIndex === 4 && [0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={`empty-end-${i}`} className="h-12" />
                ))}
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 flex flex-wrap justify-center gap-4 pt-4 border-t border-white/40"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#FF9933]" />
              <span className="text-xs text-foreground/70">19-22 Feb (Option A)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#138808]" />
              <span className="text-xs text-foreground/70">26 Feb - 1 Mar (Option B)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#000080]" />
              <span className="text-xs text-foreground/70">5-8 Mar (Option C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#6B21A8]" />
              <span className="text-xs text-foreground/70">Maha Shivaratri (15 Feb)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#EC4899]" />
              <span className="text-xs text-foreground/70">Holi (4 Mar)</span>
            </div>
          </motion.div>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};
