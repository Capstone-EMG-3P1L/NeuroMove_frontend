import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { calibrationApi, type CalibrationProfile } from "@/lib/api";

export default function CalibrationResult() {
  const [profile, setProfile] = useState<CalibrationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    calibrationApi
      .profile()
      .then((p) => {
        setProfile(p);
        setUsingFallback(false);
      })
      .catch(() => {
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Calibration 측정 결과</h1>
        <p className="text-sm text-muted-foreground mt-1">
          활성 프로파일 정보입니다
        </p>
      </div>

      {usingFallback && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          서버 응답이 없거나 활성 프로파일이 없습니다.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : !profile ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
          활성 Calibration 프로파일이 없습니다. Calibration을 먼저 진행해주세요.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <motion.div
            className="flex items-center gap-3 px-5 py-4 border-b border-border bg-primary/5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">{profile.profileId}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Signal Quality {(profile.signalQuality * 100).toFixed(1)}%
              </div>
            </div>
            <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-primary text-primary-foreground font-medium">
              적용 중
            </span>
          </motion.div>

          <div className="divide-y divide-border">
            <InfoRow label="업데이트" value={fmtDate(profile.updatedAt)} />
            {profile.activationThreshold != null && (
              <InfoRow label="Activation Threshold" value={profile.activationThreshold.toFixed(4)} />
            )}
            {profile.intentThresholdLeft != null && (
              <InfoRow label="Intent Left" value={profile.intentThresholdLeft.toFixed(4)} />
            )}
            {profile.intentThresholdRight != null && (
              <InfoRow label="Intent Right" value={profile.intentThresholdRight.toFixed(4)} />
            )}
            {profile.intentThresholdForward != null && (
              <InfoRow label="Intent Forward" value={profile.intentThresholdForward.toFixed(4)} />
            )}
            {profile.fatigueBaseline != null && (
              <InfoRow label="Fatigue Baseline" value={profile.fatigueBaseline.toFixed(4)} />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function fmtDate(s?: string) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}
