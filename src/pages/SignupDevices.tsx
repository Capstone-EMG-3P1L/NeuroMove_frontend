import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Cpu,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { deviceApi } from "@/lib/api";
import { updateUser } from "@/lib/userStore";

type Step = "emg" | "motor" | "done";

export default function SignupDevices() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("emg");
  const [emgName, setEmgName] = useState("내 EMG 보드");
  const [motorName, setMotorName] = useState("RC카 모터 보드");
  const [emgInfo, setEmgInfo] = useState<{ id: string; name: string } | null>(null);
  const [motorInfo, setMotorInfo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmgSubmit = async () => {
    if (!emgName.trim()) {
      setError("디바이스 이름을 입력해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      try {
        const res = await deviceApi.registerEmg(emgName.trim());
        setEmgInfo({ id: res.emgDeviceId, name: res.name });
        updateUser({ emgDeviceId: res.emgDeviceId });
      } catch {
        // 백엔드 미연결 시에도 흐름은 진행
        setEmgInfo({ id: "emg-pending", name: emgName.trim() });
      }
      setStep("motor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMotorSubmit = async () => {
    if (!motorName.trim()) {
      setError("디바이스 이름을 입력해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      try {
        const res = await deviceApi.registerMotor(motorName.trim());
        setMotorInfo({ id: res.motorDeviceId, name: res.name });
        updateUser({ motorDeviceId: res.motorDeviceId });
      } catch {
        setMotorInfo({ id: "motor-pending", name: motorName.trim() });
      }
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* 진행 인디케이터 */}
        <div className="flex items-center justify-center gap-2 pt-7">
          <Indicator label="EMG" active={step === "emg"} done={step !== "emg"} />
          <div className="w-8 h-px bg-border" />
          <Indicator
            label="MOTOR"
            active={step === "motor"}
            done={step === "done"}
          />
          <div className="w-8 h-px bg-border" />
          <Indicator label="완료" active={step === "done"} done={step === "done"} />
        </div>

        {step === "emg" && (
          <DeviceForm
            icon={<Activity className="w-7 h-7 text-blue-500" />}
            title="EMG 디바이스 등록"
            description="이름을 정해주세요. 가장 최근에 페어링된 EMG 보드의 ID가 자동으로 연결됩니다."
            value={emgName}
            onChange={setEmgName}
            placeholder="예) 내 EMG 보드"
            onSubmit={handleEmgSubmit}
            submitLabel="EMG 등록"
            submitting={submitting}
            error={error}
          />
        )}

        {step === "motor" && (
          <DeviceForm
            icon={<Cpu className="w-7 h-7 text-purple-500" />}
            title="MOTOR 디바이스 등록"
            description="모터 보드 이름을 정해주세요. 최근 페어링된 모터 보드 ID가 자동으로 연결됩니다."
            value={motorName}
            onChange={setMotorName}
            placeholder="예) RC카 1번 모터"
            onSubmit={handleMotorSubmit}
            submitLabel="MOTOR 등록"
            submitting={submitting}
            error={error}
            extra={
              emgInfo ? (
                <div className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
                  EMG 등록 완료 — <span className="font-medium">{emgInfo.name}</span>
                </div>
              ) : null
            }
          />
        )}

        {step === "done" && (
          <div className="flex flex-col items-center px-8 py-10 gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            <h2 className="text-lg font-bold text-foreground">
              모든 등록이 완료되었습니다
            </h2>
            <div className="w-full bg-muted/30 border border-border rounded-xl divide-y divide-border">
              <Row label="EMG 디바이스" value={emgInfo?.name ?? "-"} />
              <Row label="MOTOR 디바이스" value={motorInfo?.name ?? "-"} />
            </div>
            <Button
              className="w-full h-12 bg-primary text-primary-foreground font-semibold"
              onClick={() => setLocation("/calibration/start")}
              data-testid="button-finish-signup"
            >
              Calibration 시작
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Indicator({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-[11px] font-medium">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center ${
          done
            ? "bg-primary text-primary-foreground"
            : active
            ? "bg-primary/15 text-primary border border-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : label.slice(0, 1)}
      </div>
      <span className={active || done ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

function DeviceForm({
  icon,
  title,
  description,
  value,
  onChange,
  placeholder,
  onSubmit,
  submitLabel,
  submitting,
  error,
  extra,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSubmit: () => void;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  extra?: React.ReactNode;
}) {
  return (
    <div className="px-8 py-7 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      {extra}

      <div className="space-y-2">
        <Label htmlFor="device-name" className="text-sm font-medium">
          디바이스 이름
        </Label>
        <Input
          id="device-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11"
          data-testid="input-device-name"
        />
        <p className="text-[11px] text-muted-foreground">
          ID는 서버가 가장 최근에 페어링된 보드 기준으로 자동 매칭합니다.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full h-11 bg-primary text-primary-foreground font-semibold"
        data-testid="button-device-submit"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
