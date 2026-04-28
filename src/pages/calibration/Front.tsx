import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

function FaceFrontIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-44">
      <ellipse cx="100" cy="85" rx="52" ry="60" stroke="#4A90E2" strokeWidth="3" fill="#E8F0FE" />
      <circle cx="83" cy="78" r="7" fill="#4A90E2" opacity="0.5" />
      <circle cx="117" cy="78" r="7" fill="#4A90E2" opacity="0.5" />
      <circle cx="83" cy="78" r="3" fill="#4A90E2" />
      <circle cx="117" cy="78" r="3" fill="#4A90E2" />
      <path d="M 86 108 Q 100 118 114 108" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 76 70 Q 84 64 92 70" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 108 70 Q 116 64 124 70" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="90" rx="6" ry="4" stroke="#4A90E2" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="100" cy="152" rx="30" ry="16" stroke="#4A90E2" strokeWidth="2.5" fill="#D4E4F5" />
      <rect x="74" y="136" width="52" height="20" fill="#E8F0FE" />
      <path d="M 76 146 Q 100 140 124 146" stroke="#4A90E2" strokeWidth="2" fill="none" />
      <ellipse cx="48" cy="100" rx="10" ry="8" stroke="#4A90E2" strokeWidth="2" fill="#D4E4F5" />
      <ellipse cx="152" cy="100" rx="10" ry="8" stroke="#4A90E2" strokeWidth="2" fill="#D4E4F5" />
    </svg>
  );
}

export default function CalibrationFront() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-sm overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center justify-center p-10 pb-6 gap-6">
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full ${step === 2 ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">방향 확인</h2>
            <p className="text-sm text-muted-foreground mt-1">정면을 바라봐주세요</p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaceFrontIllustration />
          </motion.div>
        </div>

        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={() => setLocation("/calibration/left")}
            data-testid="button-face-front"
          >
            정면을 바라봐주세요
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
