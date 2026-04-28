import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CalibrationStep5() {
  const [, setLocation] = useLocation();
  const [going, setGoing] = useState(false);

  const handleDone = () => {
    setGoing(true);
    // 회원가입 흐름: Calibration 완료 → 디바이스 등록 → 홈
    setTimeout(() => setLocation("/signup/devices"), 600);
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
                className="w-2 h-2 rounded-full bg-primary/40"
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">모든 방향 감지 완료</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-28 h-28 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-base font-semibold text-foreground">Calibration이 완료되었습니다</p>
            <p className="text-xs text-muted-foreground text-center">
              마지막 단계로 사용할 디바이스를 등록할게요
            </p>
          </motion.div>
        </div>
        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={handleDone}
            disabled={going}
            data-testid="button-step5-done"
          >
            디바이스 등록하기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
