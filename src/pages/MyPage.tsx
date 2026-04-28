import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  ChevronRight,
  ClipboardList,
  Sparkles,
  User as UserIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deviceApi,
  userApi,
  type EmgDeviceItem,
  type MotorDeviceItem,
  type UserStatus,
  type SessionLogItem,
} from "@/lib/api";
import { getUser } from "@/lib/userStore";

const SAMPLE_USER: UserStatus = {
  userId: "user-001",
  username: "soobin123",
  name: "박수빈",
  registeredEmgDevice: {
    emgDeviceId: "emg-esp32-A12F",
    name: "내 EMG 보드",
    isActive: true,
  },
  registeredMotorDevice: {
    motorDeviceId: "motor-esp32-C01",
    name: "RC카 1번 모터 보드",
    isActive: true,
    connectionStatus: "CONNECTED",
  },
  activeCalibrationProfile: {
    profileId: "profile-001",
    signalQuality: 0.93,
    updatedAt: "2026-04-04T14:35:00",
  },
  activeSession: null,
};

const SAMPLE_LOGS: SessionLogItem[] = [
  {
    sessionId: "sess-001",
    emgDeviceId: "emg-esp32-A12F",
    motorDeviceId: "motor-esp32-C01",
    startedAt: "2026-04-03T10:00:00",
    endedAt: "2026-04-03T10:12:10",
    durationSeconds: 730,
    maxRiskScore: 0.66,
    status: "ENDED",
  },
  {
    sessionId: "sess-002",
    emgDeviceId: "emg-esp32-A12F",
    motorDeviceId: "motor-esp32-C01",
    startedAt: "2026-04-04T14:40:00",
    endedAt: "2026-04-04T14:48:20",
    durationSeconds: 500,
    maxRiskScore: 0.78,
    status: "ENDED",
  },
];

const SAMPLE_EMG_DEVICES: EmgDeviceItem[] = [
  {
    emgDeviceId: "emg-esp32-A12F",
    name: "내 EMG 보드",
    isActive: true,
  },
];

const SAMPLE_MOTOR_DEVICES: MotorDeviceItem[] = [
  {
    motorDeviceId: "motor-esp32-C01",
    name: "RC카 1번 모터 보드",
    isActive: true,
    connectionStatus: "CONNECTED",
  },
];

export default function MyPage() {
  const [, setLocation] = useLocation();
  const localUser = getUser();
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [emgDevices, setEmgDevices] = useState<EmgDeviceItem[]>([]);
  const [motorDevices, setMotorDevices] = useState<MotorDeviceItem[]>([]);
  const [logs, setLogs] = useState<SessionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [me, emg, motor, logsRes] = await Promise.allSettled([
        userApi.me(),
        deviceApi.listEmg(),
        deviceApi.listMotor(),
        userApi.myLogs(),
      ]);

      const allFailed =
        me.status === "rejected" &&
        emg.status === "rejected" &&
        motor.status === "rejected" &&
        logsRes.status === "rejected";

      if (allFailed) {
        setStatus(SAMPLE_USER);
        setEmgDevices(SAMPLE_EMG_DEVICES);
        setMotorDevices(SAMPLE_MOTOR_DEVICES);
        setLogs(SAMPLE_LOGS);
        setUsingFallback(true);
      } else {
        setUsingFallback(false);
        setStatus(me.status === "fulfilled" ? me.value : SAMPLE_USER);
        setEmgDevices(
          emg.status === "fulfilled" ? emg.value.devices : SAMPLE_EMG_DEVICES,
        );
        setMotorDevices(
          motor.status === "fulfilled"
            ? motor.value.devices
            : SAMPLE_MOTOR_DEVICES,
        );
        setLogs(
          logsRes.status === "fulfilled" ? logsRes.value.logs : SAMPLE_LOGS,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">마이페이지</h1>
          <p className="text-sm text-muted-foreground mt-1">
            내 디바이스, 상태, 운행 기록을 한 눈에
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="text-xs h-9"
          data-testid="btn-mypage-refresh"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              새로고침
            </>
          )}
        </Button>
      </div>

      {usingFallback && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          서버 응답이 없어 샘플 데이터를 표시 중입니다. (백엔드 연결 후
          새로고침)
        </div>
      )}

      {/* 사용자 카드 */}
      <SectionCard
        icon={<UserIcon className="w-4 h-4" />}
        title="사용자 상태"
        subtitle={
          status?.name
            ? `${status.name} · @${status.username ?? localUser?.id ?? ""}`
            : "현재 사용자 정보"
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoTile
            label="EMG 디바이스"
            value={status?.registeredEmgDevice?.name ?? "-"}
            sub={status?.registeredEmgDevice?.emgDeviceId ?? "미등록"}
            indicator={
              status?.registeredEmgDevice?.isActive ? "active" : "idle"
            }
          />
          <InfoTile
            label="MOTOR 디바이스"
            value={status?.registeredMotorDevice?.name ?? "-"}
            sub={
              status?.registeredMotorDevice?.connectionStatus
                ? `${status.registeredMotorDevice.motorDeviceId} · ${status.registeredMotorDevice.connectionStatus}`
                : status?.registeredMotorDevice?.motorDeviceId ?? "미등록"
            }
            indicator={
              status?.registeredMotorDevice?.connectionStatus === "CONNECTED"
                ? "active"
                : "idle"
            }
          />
          <InfoTile
            label="활성 Calibration 프로파일"
            value={
              status?.activeCalibrationProfile
                ? `Quality ${(status.activeCalibrationProfile.signalQuality * 100).toFixed(0)}%`
                : "없음"
            }
            sub={
              status?.activeCalibrationProfile
                ? `업데이트 ${formatDateTime(status.activeCalibrationProfile.updatedAt)}`
                : "Calibration을 진행해주세요"
            }
          />
          <InfoTile
            label="현재 세션"
            value={status?.activeSession ? "진행 중" : "대기 중"}
            sub={status?.activeSession ? "운행 중" : "운행 시작 가능"}
            indicator={status?.activeSession ? "active" : "idle"}
          />
        </div>
      </SectionCard>

      {/* 디바이스 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <SectionCard
          icon={<Activity className="w-4 h-4" />}
          title="EMG 디바이스 목록"
          subtitle={`${emgDevices.length}개 등록됨`}
        >
          <div className="divide-y divide-border bg-muted/20 rounded-lg border border-border overflow-hidden">
            {emgDevices.length === 0 && <Empty label="등록된 EMG 디바이스가 없습니다" />}
            {emgDevices.map((d) => (
              <DeviceRow
                key={d.emgDeviceId}
                id={d.emgDeviceId}
                name={d.name}
                active={d.isActive}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={<Cpu className="w-4 h-4" />}
          title="MOTOR 디바이스 목록"
          subtitle={`${motorDevices.length}개 등록됨`}
        >
          <div className="divide-y divide-border bg-muted/20 rounded-lg border border-border overflow-hidden">
            {motorDevices.length === 0 && (
              <Empty label="등록된 MOTOR 디바이스가 없습니다" />
            )}
            {motorDevices.map((d) => (
              <DeviceRow
                key={d.motorDeviceId}
                id={d.motorDeviceId}
                name={d.name}
                active={d.isActive}
                tag={d.connectionStatus}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      {/* 운행 로그 */}
      <SectionCard
        className="mt-5"
        icon={<ClipboardList className="w-4 h-4" />}
        title="운행 로그"
        subtitle={`${logs.length}건의 운행 기록`}
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => setLocation("/logs")}
          >
            전체 보기
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
      >
        <div className="divide-y divide-border bg-muted/20 rounded-lg border border-border overflow-hidden">
          {logs.length === 0 && <Empty label="운행 기록이 없습니다" />}
          {logs.slice(0, 5).map((log) => (
            <button
              key={log.sessionId}
              type="button"
              onClick={() =>
                setLocation(`/logs/detail?sessionId=${log.sessionId}`)
              }
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
              data-testid={`mypage-log-${log.sessionId}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {log.sessionId}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(log.startedAt)} · {formatDuration(log.durationSeconds)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={riskBadge(log.maxRiskScore)}>
                  Risk {(log.maxRiskScore * 100).toFixed(0)}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Calibration 결과 바로가기 */}
      <SectionCard
        className="mt-5"
        icon={<Sparkles className="w-4 h-4" />}
        title="Calibration 측정 결과"
        subtitle="활성 프로파일과 측정 이력을 확인합니다"
        action={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => setLocation("/calibration/result")}
          >
            결과 보기
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
      >
        <div className="bg-muted/20 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">
              {status?.activeCalibrationProfile?.profileId ?? "활성 프로파일 없음"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {status?.activeCalibrationProfile
                ? `Signal Quality ${(status.activeCalibrationProfile.signalQuality * 100).toFixed(0)}%`
                : "Calibration을 다시 진행해보세요"}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => setLocation("/calibration/start")}
            data-testid="btn-recalibrate"
          >
            다시 측정
          </Button>
        </div>
      </SectionCard>
    </motion.div>
  );
}

// ----------------------- helpers / sub-components -----------------------

function SectionCard({
  icon,
  title,
  subtitle,
  action,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-card border border-border rounded-2xl shadow-sm p-5 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function InfoTile({
  label,
  value,
  sub,
  indicator,
}: {
  label: string;
  value: string;
  sub?: string;
  indicator?: "active" | "idle";
}) {
  return (
    <div className="bg-muted/30 border border-border rounded-xl px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      <div className="flex items-center gap-2">
        {indicator && (
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              indicator === "active"
                ? "bg-green-500 animate-pulse"
                : "bg-gray-400"
            }`}
          />
        )}
        <div className="text-sm font-semibold text-foreground truncate">
          {value}
        </div>
      </div>
      {sub && (
        <div className="text-xs text-muted-foreground mt-1 truncate">{sub}</div>
      )}
    </div>
  );
}

function DeviceRow({
  id,
  name,
  active,
  tag,
}: {
  id: string;
  name: string;
  active: boolean;
  tag?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            active ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <div className="min-w-0">
          <div className="font-medium text-foreground truncate">{name}</div>
          <div className="text-xs text-muted-foreground truncate">{id}</div>
        </div>
      </div>
      {tag && (
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {tag}
        </span>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}

function formatDateTime(s?: string) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function formatDuration(seconds: number) {
  if (!seconds) return "0초";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

function riskBadge(score: number) {
  const pct = score * 100;
  if (pct >= 65)
    return "text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200";
  if (pct >= 35)
    return "text-[11px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200";
}
