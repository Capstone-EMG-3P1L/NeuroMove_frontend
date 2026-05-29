import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { calibrationApi, onboardingApi } from "@/lib/api";
import { getUser } from "@/lib/userStore";

function FaceIcon() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
      <rect x="20" y="20" width="120" height="120" rx="12" fill="#e8f0fe" stroke="#4A90E2" strokeWidth="2" />
      <ellipse cx="80" cy="72" rx="36" ry="42" stroke="#4A90E2" strokeWidth="2.5" fill="#d4e4f5" />
      <circle cx="68" cy="66" r="5" fill="#4A90E2" opacity="0.6" />
      <circle cx="92" cy="66" r="5" fill="#4A90E2" opacity="0.6" />
      <path d="M 68 88 Q 80 96 92 88" stroke="#4A90E2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="116" rx="20" ry="10" fill="#d4e4f5" stroke="#4A90E2" strokeWidth="2" />
      <circle cx="80" cy="52" r="8" stroke="#4A90E2" strokeWidth="2" fill="none" opacity="0.4" strokeDasharray="4 3" />
      <circle cx="80" cy="52" r="3" fill="#4A90E2" opacity="0.7" />
    </svg>
  );
}

export default function CalibrationStep4() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const calibrationSessionId = user?.calibrationSessionId;
      const onboardingId = user?.onboardingId;
      if (calibrationSessionId) {
        if (onboardingId) {
          await onboardingApi.updateCalibrationStep({ onboardingId, calibrationSessionId, step: "RIGHT" }).catch(() => {});
        } else {
          await calibrationApi.updateStep(calibrationSessionId, "RIGHT").catch(() => {});
        }
      }
      setLocation("/calibration/step5");
    } finally {
      setLoading(false);
    }
  };

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
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${step === 4 ? "bg-primary" : step < 4 ? "bg-primary/40" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">방향을 감지하는 중입니다</p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaceIcon />
          </motion.div>
        </div>
        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={handleNext}
            disabled={loading}
            data-testid="button-step4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "오른쪽을 바라봐주세요"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
