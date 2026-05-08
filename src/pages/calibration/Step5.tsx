import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { calibrationApi, onboardingApi } from "@/lib/api";
import { getUser, setUser, updateUser } from "@/lib/userStore";

export default function CalibrationStep5() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleDone = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const calibrationSessionId = user?.calibrationSessionId;
      const onboardingId = user?.onboardingId;

      if (onboardingId && calibrationSessionId) {
        // 온보딩 모드: STOP → calibration end → onboarding complete (JWT 수령)
        await onboardingApi.updateCalibrationStep({ onboardingId, calibrationSessionId, step: "STOP" }).catch(() => {});
        await onboardingApi.endCalibration({ onboardingId, calibrationSessionId });
        const complete = await onboardingApi.complete(onboardingId);
        setUser({
          name: complete.user.name,
          id: complete.user.username,
          userId: complete.user.userId,
          token: complete.accessToken,
        });
      } else if (calibrationSessionId) {
        // 일반 재측정 모드
        await calibrationApi.updateStep(calibrationSessionId, "STOP").catch(() => {});
        const res = await calibrationApi.end(calibrationSessionId);
        updateUser({ profileId: res.profileId });
      }

      setLocation("/main");
    } catch (err) {
      // 에러가 발생해도 /main으로 진행
      console.error("Calibration 완료 처리 중 오류:", err);
      setLocation("/main");
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
              홈 화면으로 이동합니다
            </p>
          </motion.div>
        </div>
        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={handleDone}
            disabled={loading}
            data-testid="button-step5-done"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "홈으로 이동"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
