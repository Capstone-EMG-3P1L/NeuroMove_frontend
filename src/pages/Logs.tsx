import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { userApi, type SessionLogItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";


export default function Logs() {
  const [, setLocation] = useLocation();
  const [logs, setLogs] = useState<SessionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    setLoading(true);
    userApi
      .myLogs()
      .then((res) => {
        setLogs(res.logs);
        setUsingFallback(false);
      })
      .catch(() => {
        setLogs([]);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">운행 로그</h1>
        <p className="text-sm text-muted-foreground mt-1">운행 기록 목록</p>
      </div>

      {usingFallback && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
          서버 응답이 없어 샘플 데이터를 표시 중입니다.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {logs.length === 0 && (
            <div className="px-5 py-6 text-center text-xs text-muted-foreground">
              운행 기록이 없습니다
            </div>
          )}
          {logs.map((log, idx) => (
            <motion.button
              key={log.sessionId}
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors text-left border-b border-border last:border-b-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              onClick={() =>
                setLocation(`/logs/detail?sessionId=${log.sessionId}`)
              }
              data-testid={`log-row-${log.sessionId}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <span className="font-medium text-foreground text-sm">
                    {log.sessionId}
                  </span>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {fmt(log.startedAt)} · {Math.floor(log.durationSeconds / 60)}분 {log.durationSeconds % 60}초
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={riskClass(log.maxRiskScore)}>
                  Risk {(log.maxRiskScore * 100).toFixed(0)}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function fmt(s: string) {
  try {
    return new Date(s).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function riskClass(score: number) {
  const pct = score * 100;
  if (pct >= 65) return "bg-red-50 text-red-600 border-red-200";
  if (pct >= 35) return "bg-yellow-50 text-yellow-700 border-yellow-200";
  return "bg-green-50 text-green-700 border-green-200";
}
