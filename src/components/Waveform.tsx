import { motion } from "framer-motion";

export function Waveform({ className = "" }: { className?: string }) {
  // Simple sine wave representation
  const path = "M 0 10 Q 5 0, 10 10 T 20 10 T 30 10 T 40 10 T 50 10 T 60 10 T 70 10 T 80 10 T 90 10 T 100 10";
  
  return (
    <div className={`w-24 h-6 overflow-hidden flex items-center ${className}`}>
      <svg viewBox="0 0 100 20" className="w-full h-full stroke-primary fill-none stroke-[2px]">
        <motion.path
          d={path}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            pathOffset: [0, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear"
          }}
        />
      </svg>
    </div>
  );
}
