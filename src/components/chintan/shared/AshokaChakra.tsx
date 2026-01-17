import { motion } from "framer-motion";

interface AshokaChakraProps {
  className?: string;
}

export const AshokaChakra = ({ className = "" }: AshokaChakraProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      className={`pointer-events-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer Circle */}
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke="#000080"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Inner Circle (Hub) */}
        <circle cx="100" cy="100" r="20" fill="#000080" />
        
        {/* 24 Spokes */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const x1 = 100 + 20 * Math.cos(angle);
          const y1 = 100 + 20 * Math.sin(angle);
          const x2 = 100 + 90 * Math.cos(angle);
          const y2 = 100 + 90 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#000080"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Decorative dots between spokes */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = ((i * 15 + 7.5) * Math.PI) / 180;
          const cx = 100 + 60 * Math.cos(angle);
          const cy = 100 + 60 * Math.sin(angle);
          return <circle key={`dot-${i}`} cx={cx} cy={cy} r="3" fill="#000080" />;
        })}
      </svg>
    </motion.div>
  );
};
