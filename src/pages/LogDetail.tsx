import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { sessionApi, type SessionDetail } from "@/lib/api";

const SAMPLE_DETAIL: SessionDetail = {
  session: {
    sessionId: "sess-002",
    emgDeviceId: "emg-esp32-A12F",
    motorDeviceId: "motor-esp32-C01",
    status: "ENDED",
    startedAt: "2026-04-04T14:40:00",
    endedAt: "2026-04-04T14:48:20",
    durationSeconds: 500,
    maxRiskScore: 0.78,
  },
  fsmStates: [
    {
      fromState: "READY",
      toState: "DRIVING",
      reason: "SESSION_STARTED",
      transitionedAt: "2026-04-04T14:40:02",
    },
    {
      fromState: "DRIVING",
      toState: "FATIGUE_COMPENSATING",
      reason: "FATIGUE",
      transitionedAt: "2026-04-04T14:45:10",
    },
  ],
  intentLogs: [
    {
      intentId: "intent-001",
      intent: "FORWARD",
      confidence: 0.89,
      fatigueScore: 0.23,
      signalQuality: 0.94,
      riskScore: 0.31,
      fatigueComponent: 0.1,
      stabilityComponent: 0.07,
      durationComponent: 0.08,
      accepted: true,
      emgTimestamp: 1775288400123,
      receivedAt: "2026-04-04T14:40:03",
    },
  ],
  commands: [
    {
      commandId: "cmd-001",
      intentId: "intent-001",
      command: "FORWARD",
      speedLevel: 3,
      riskScore: 0.31,
      isFetched: true,
      issuedAt: "2026-04-04T14:40:03",
      fetchedAt: "2026-04-04T14:40:04",
    },
  ],
};

function getQuery(name: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function LogDetail() {
  const [, setLocation] = useLocation();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const sessionId = getQuery("sessionId") ?? "sess-002";
    setLoading(true);
    sessionApi
      .detail(sessionId)
      .then((d) => {
        setDetail(d);
        setUsingFallback(false);
      })
      .catch(() => {
        setDetail(SAMPLE_DETAIL);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        세션 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const { session, fsmStates, intentLogs, commands } = detail;

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/logs")}
        className="text-xs h-8 mb-3"
      >
        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
        목록으로
      </Button>

      {usingFallback && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          서버 응답이 없어 샘플 데이터를 표시 중입니다.
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {session.sessionId}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {fmt(session.startedAt)} ~ {fmt(session.endedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {session.status}
            </Badge>
            <Badge className={badgeRisk(session.maxRiskScore)}>
              MAX RISK {(session.maxRiskScore * 100).toFixed(0)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Stat label="EMG" value={session.emgDeviceId} />
          <Stat label="MOTOR" value={session.motorDeviceId} />
          <Stat label="지속 시간" value={`${Math.floor(session.durationSeconds / 60)}분 ${session.durationSeconds % 60}초`} />
          <Stat
            label="평균 신뢰도"
            value={`${(avg(intentLogs.map((i) => i.confidence)) * 100).toFixed(0)}%`}
          />
        </div>
      </div>

      <Card title="FSM 상태 전이" empty="FSM 전이 기록 없음" count={fsmStates.length}>
        {fsmStates.map((s, i) => (
          <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{fmt(s.transitionedAt)}</span>
              <span className="font-medium">{s.fromState}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium text-primary">{s.toState}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{s.reason}</span>
          </div>
        ))}
      </Card>

      <Card title="Intent 로그" empty="Intent 기록 없음" count={intentLogs.length} className="mt-4">
        {intentLogs.map((i) => (
          <div key={i.intentId} className="px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{i.intent}</span>
              <span className="text-xs text-muted-foreground">
                {fmt(i.receivedAt)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-[11px] text-muted-foreground">
              <span>conf {(i.confidence * 100).toFixed(0)}%</span>
              <span>fatigue {(i.fatigueScore * 100).toFixed(0)}%</span>
              <span>quality {(i.signalQuality * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </Card>

      <Card title="커맨드" empty="발행 커맨드 없음" count={commands.length} className="mt-4">
        {commands.map((c) => (
          <div key={c.commandId} className="px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <div className="font-medium">{c.command}</div>
              <div className="text-[11px] text-muted-foreground">
                speed lv {c.speedLevel} · {fmt(c.issuedAt)}
              </div>
            </div>
            <Badge className={badgeRisk(c.riskScore)}>
              {(c.riskScore * 100).toFixed(0)}
            </Badge>
          </div>
        ))}
      </Card>
    </motion.div>
  );
}

function Card({
  title,
  count,
  empty,
  className,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-card border border-border rounded-2xl shadow-sm overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-[11px] text-muted-foreground">{count}건</span>
      </div>
      {count === 0 ? (
        <div className="px-5 py-6 text-center text-xs text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="divide-y divide-border">{children}</div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground truncate">
        {value}
      </div>
    </div>
  );
}

function fmt(s?: string) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return s;
  }
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function badgeRisk(score: number) {
  const pct = score * 100;
  if (pct >= 65) return "bg-red-50 text-red-600 border-red-200";
  if (pct >= 35) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-green-50 text-green-700 border-green-200";
}
