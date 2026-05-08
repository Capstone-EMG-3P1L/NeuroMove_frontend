import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { calibrationApi, deviceApi, onboardingApi } from "@/lib/api";
import { getUser, updateUser } from "@/lib/userStore";

function HandTapIllustration() {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-52">
      <ellipse cx="100" cy="200" rx="60" ry="12" fill="#E8F0FE" />
      <rect x="58" y="100" width="22" height="70" rx="11" fill="#BFCFEA" />
      <rect x="84" y="80" width="22" height="90" rx="11" fill="#BFCFEA" />
      <rect x="110" y="85" width="22" height="85" rx="11" fill="#BFCFEA" />
      <rect x="136" y="95" width="20" height="75" rx="10" fill="#BFCFEA" />
      <rect x="55" y="128" width="110" height="42" rx="14" fill="#4A90E2" />
      <rect x="58" y="100" width="22" height="70" rx="11" fill="#4A90E2" />
      <rect x="84" y="80" width="22" height="90" rx="11" fill="#4A90E2" />
      <rect x="110" y="85" width="22" height="85" rx="11" fill="#4A90E2" />
      <rect x="136" y="95" width="20" height="75" rx="10" fill="#4A90E2" />
      <ellipse cx="96" cy="60" rx="16" ry="16" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.4" />
      <ellipse cx="96" cy="60" rx="8" ry="8" stroke="#4A90E2" strokeWidth="2.5" fill="none" opacity="0.6" />
      <circle cx="96" cy="60" r="3" fill="#4A90E2" opacity="0.8" />
    </svg>
  );
}

export default function CalibrationStart() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getUser();
      const onboardingId = user?.onboardingId;
      let emgDeviceId = user?.emgDeviceId;

      if (onboardingId) {
        // 온보딩 모드: 온보딩 전용 calibration start
        if (!emgDeviceId) {
          setError("EMG 디바이스 정보가 없습니다. 디바이스 등록을 먼저 진행해주세요.");
          return;
        }
        const res = await onboardingApi.startCalibration({ onboardingId, emgDeviceId });
        updateUser({ calibrationSessionId: res.calibrationSessionId });
      } else {
        // 일반 재측정 모드: 기존 DB 기반 flow
        if (!emgDeviceId) {
          try {
            const list = await deviceApi.listEmg();
            if (list.devices.length > 0) {
              emgDeviceId = list.devices[0].emgDeviceId;
              updateUser({ emgDeviceId });
            } else {
              const reg = await deviceApi.registerEmg("내 EMG 보드");
              emgDeviceId = reg.emgDeviceId;
              updateUser({ emgDeviceId });
            }
          } catch {
            setError("EMG 디바이스 정보를 불러오지 못했습니다.");
            return;
          }
        }
        const res = await calibrationApi.start(emgDeviceId);
        updateUser({ calibrationSessionId: res.calibrationSessionId });
      }

      setLocation("/calibration/step2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calibration 시작에 실패했습니다.");
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
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-foreground">Calibration 준비</h2>
            <p className="text-sm text-muted-foreground mt-1">화면을 탭하여 시작하세요</p>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <HandTapIllustration />
          </motion.div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>

        <div className="px-6 pb-6">
          <Button
            className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base"
            onClick={handleStart}
            disabled={loading}
            data-testid="button-calibration-start"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calibration 시작하기"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
