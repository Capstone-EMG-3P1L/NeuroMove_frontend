import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { calibrationApi, deviceApi } from "@/lib/api";
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
      // emgDeviceId 확보: userStore에 있으면 사용, 없으면 목록 조회 후 자동 등록
      let emgDeviceId = getUser()?.emgDeviceId;
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
          // 백엔드 미연결 시 임시 ID로 진행
          emgDeviceId = "emg-pending";
        }
      }

      try {
        const res = await calibrationApi.start(emgDeviceId);
        updateUser({ calibrationSessionId: res.calibrationSessionId });
      } catch {
        // 백엔드 미연결 시에도 흐름 진행
      }

      setLocation("/calibration/step2");
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
