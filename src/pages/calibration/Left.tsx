import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

function FaceLeftIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-44">
      <ellipse cx="115" cy="90" rx="52" ry="60" stroke="#4A90E2" strokeWidth="3" fill="#E8F0FE" />
      <ellipse cx="90" cy="90" rx="18" ry="22" stroke="#4A90E2" strokeWidth="2" fill="#D4E4F5" />
      <circle cx="120" cy="80" r="6" fill="#4A90E2" opacity="0.5" />
      <path d="M 102 110 Q 115 118 128 110" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 105 75 Q 118 70 130 75" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="115" cy="152" rx="28" ry="16" stroke="#4A90E2" strokeWidth="2.5" fill="#D4E4F5" />
      <rect x="97" y="136" width="38" height="20" fill="#E8F0FE" />
      <path d="M 97 146 Q 115 140 135 146" stroke="#4A90E2" strokeWidth="2" fill="none" />
      <ellipse cx="165" cy="100" rx="10" ry="8" stroke="#4A90E2" strokeWidth="2" fill="#D4E4F5" />
    </svg>
  );
}

export default function CalibrationLeft() {
  const [, setLocation] = useLocation();
  const [done, setDone] = useState(false);

  const handleComplete = () => {
    setDone(true);
    setTimeout(() => setLocation("/calibration/result"), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-sm overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center justify-center p-10 pb-6 gap-6">
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full ${step === 3 ? "bg-primary" : "bg-primary/40"}`}
              />
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">방향 확인</h2>
            <p className="text-sm text-muted-foreground mt-1">왼쪽을 바라봐주세요</p>
          </div>

          {done ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-20 h-20 text-green-500" />
              <p className="text-sm font-medium text-green-600">Calibration 완료!</p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: [0, -2, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaceLeftIllustration />
            </motion.div>
          )}
        </div>

        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={handleComplete}
            disabled={done}
            data-testid="button-face-left"
          >
            왼쪽을 바라봐주세요
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
