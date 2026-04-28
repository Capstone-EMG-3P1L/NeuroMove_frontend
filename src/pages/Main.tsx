import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import {
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  OctagonX,
  User as UserIcon,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getStompClient } from "@/lib/websocket";

type Direction = "직진" | "왼쪽" | "오른쪽" | "정지";

const DIRECTIONS: Direction[] = ["직진", "왼쪽", "오른쪽", "정지"];

const DIR_CONFIG: Record<Direction, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  직진: {
    icon: <ArrowUp className="w-10 h-10" />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    description: "전방 직진 중",
  },
  왼쪽: {
    icon: <ArrowLeft className="w-10 h-10" />,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    description: "좌회전 감지됨",
  },
  오른쪽: {
    icon: <ArrowRight className="w-10 h-10" />,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    description: "우회전 감지됨",
  },
  정지: {
    icon: <OctagonX className="w-10 h-10" />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    description: "정지 상태",
  },
};

const INTENT_TO_DIRECTION: Record<string, Direction> = {
  FORWARD: "직진",
  LEFT: "왼쪽",
  RIGHT: "오른쪽",
  STOP: "정지",
};

function getRiskColor(score: number) {
  if (score < 35) return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "안전" };
  if (score < 65) return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "주의" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "위험" };
}

function CircularGauge({ score }: { score: number }) {
  const { color, bg, label } = getRiskColor(score);
  const radius = 80;
  const stroke = 10;
  const normalizedR = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedR;
  const arc = circumference * 0.75;
  const offset = arc - (score / 100) * arc;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" className="rotate-[135deg]">
          <circle
            cx="100" cy="100" r={normalizedR}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          <motion.circle
            cx="100" cy="100" r={normalizedR}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arc }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-1">/ 100</span>
        </div>
      </div>
      <motion.div
        key={label}
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: bg, color }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {label}
      </motion.div>
    </div>
  );
}

function DirectionDisplay({ dir }: { dir: Direction }) {
  const cfg = DIR_CONFIG[dir];

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <motion.div
        key={dir}
        className="w-28 h-28 rounded-full flex items-center justify-center shadow-sm border-2"
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          color: cfg.color,
        }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        {cfg.icon}
      </motion.div>

      <div className="text-center">
        <motion.div
          key={dir + "-label"}
          className="text-2xl font-bold"
          style={{ color: cfg.color }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {dir}
        </motion.div>
        <motion.div
          key={dir + "-desc"}
          className="text-xs text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {cfg.description}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-[220px]">
        {DIRECTIONS.map((d) => {
          const c = DIR_CONFIG[d];
          const isActive = d === dir;
          return (
            <div
              key={d}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? c.bg : "transparent",
                borderColor: isActive ? c.border : "#e5e7eb",
                color: isActive ? c.color : "#9ca3af",
              }}
            >
              <span style={{ color: isActive ? c.color : "#d1d5db" }}>
                {d === "직진" && <ArrowUp className="w-3 h-3" />}
                {d === "왼쪽" && <ArrowLeft className="w-3 h-3" />}
                {d === "오른쪽" && <ArrowRight className="w-3 h-3" />}
                {d === "정지" && <OctagonX className="w-3 h-3" />}
              </span>
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Main() {
  const [, setLocation] = useLocation();
  const [riskScore, setRiskScore] = useState(28);
  const [dirIdx, setDirIdx] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [wsState, setWsState] = useState<"idle" | "connecting" | "connected" | "offline">("idle");
  const [sessionId] = useState<string>("sess-002"); // 데모용 세션 ID
  const tickRef = useRef(0);
  const fallbackRef = useRef<number | null>(null);

  // ---- WebSocket(STOMP) 연결 ----
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    setWsState("connecting");

    getStompClient()
      .then((client) => {
        if (cancelled) return;
        setWsState("connected");
        unsubscribe = client.subscribe(`/topic/sessions/${sessionId}`, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (typeof payload.riskScore === "number") {
              setRiskScore(Math.round(payload.riskScore * 100));
            }
            const intent: string | undefined = payload.intent ?? payload.command;
            if (intent && INTENT_TO_DIRECTION[intent]) {
              const target = INTENT_TO_DIRECTION[intent];
              const idx = DIRECTIONS.indexOf(target);
              if (idx >= 0) setDirIdx(idx);
            }
          } catch {
            /* ignore non-JSON */
          }
        });
      })
      .catch(() => {
        if (!cancelled) setWsState("offline");
      });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId]);

  // 데모용 폴백 시뮬레이션 (서버 미연결 시에만)
  useEffect(() => {
    if (wsState === "connected" || !isActive) {
      if (fallbackRef.current) {
        window.clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
      return;
    }
    fallbackRef.current = window.setInterval(() => {
      tickRef.current += 1;
      setRiskScore((prev) => {
        const delta = (Math.random() - 0.48) * 6;
        return Math.min(95, Math.max(5, Math.round(prev + delta)));
      });
      if (tickRef.current % 4 === 0) {
        setDirIdx(Math.floor(Math.random() * DIRECTIONS.length));
      }
    }, 1200);
    return () => {
      if (fallbackRef.current) {
        window.clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
    };
  }, [isActive, wsState]);

  return (
    <motion.div
      className="flex flex-col h-full p-5 gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">실시간 측정</h2>
          <p className="text-xs text-muted-foreground">현재 운행 상태</p>
        </div>
        <div className="flex items-center gap-2">
          <WsBadge state={wsState} />
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isActive
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-muted border-border text-muted-foreground"
            }`}
            onClick={() => setIsActive((v) => !v)}
            data-testid="btn-toggle-live"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {isActive ? "Live" : "일시정지"}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-0">
        <motion.div
          className="bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Risk Score
          </div>
          <CircularGauge score={riskScore} />
          <div className="mt-2 w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>안전</span><span>위험</span>
            </div>
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full opacity-40" />
            <motion.div
              className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-md -mt-[11px]"
              style={{ backgroundColor: getRiskColor(riskScore).color }}
              animate={{ marginLeft: `calc(${riskScore}% - 5px)` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            방향 (Direction)
          </div>
          <DirectionDisplay dir={DIRECTIONS[dirIdx]} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={() => setLocation("/logs")}
          data-testid="button-view-logs"
        >
          운행 로그 다시 보기
        </Button>
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={() => setLocation("/calibration/result")}
          data-testid="button-calibration-result"
        >
          Calibration 결과
        </Button>
        <Button
          className="h-12 text-sm font-medium bg-primary text-primary-foreground"
          onClick={() => setLocation("/mypage")}
          data-testid="button-mypage"
        >
          <UserIcon className="w-4 h-4 mr-1.5" />
          마이페이지
        </Button>
      </div>
    </motion.div>
  );
}

function WsBadge({ state }: { state: "idle" | "connecting" | "connected" | "offline" }) {
  if (state === "connected") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <Wifi className="w-3 h-3" />
        WS 연결됨
      </span>
    );
  }
  if (state === "connecting") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <Wifi className="w-3 h-3 animate-pulse" />
        연결 중
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
      <WifiOff className="w-3 h-3" />
      오프라인
    </span>
  );
}
