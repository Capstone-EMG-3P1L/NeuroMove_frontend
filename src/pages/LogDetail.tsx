import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { sessionApi, type SessionDetail } from "@/lib/api";


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
    const sessionId = getQuery("sessionId");
    if (!sessionId) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    sessionApi
      .detail(sessionId)
      .then((d) => {
        setDetail(d);
        setUsingFallback(false);
      })
      .catch(() => {
        setDetail(null);
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

  const { session, fsmStates, intentLogs } = detail;

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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <Stat label="EMG" value={session.emgDeviceId} />
          <Stat label="MOTOR" value={session.motorDeviceId} />
          <Stat label="지속 시간" value={`${Math.floor(session.durationSeconds / 60)}분 ${session.durationSeconds % 60}초`} />
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
        {intentLogs.map((i, idx) => (
          <div key={idx} className="px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{i.intent}</span>
              <div className="flex items-center gap-2">
                <Badge className={badgeRisk(i.riskScore)}>
                  risk {(i.riskScore * 100).toFixed(0)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {fmt(i.loggedAt)}
                </span>
              </div>
            </div>
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

function badgeRisk(score: number) {
  const pct = score * 100;
  if (pct >= 65) return "bg-red-50 text-red-600 border-red-200";
  if (pct >= 35) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-green-50 text-green-700 border-green-200";
}
