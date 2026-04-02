import { motion } from "framer-motion";
import { Waveform } from "@/components/Waveform";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const sessions = [
  { id: 1, name: "세션 1", quality: "30cm", status: "measure" },
  { id: 2, name: "세션 2", quality: "Good", status: "good" },
  { id: 3, name: "세션 3", quality: "Good", status: "good" },
  { id: 4, name: "세션 4", quality: "Normal", status: "normal" },
];

const statusColors: Record<string, string> = {
  good: "bg-green-100 text-green-700 border-green-200",
  normal: "bg-yellow-100 text-yellow-700 border-yellow-200",
  measure: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function LogDetail() {
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">운행 로그 상세</h1>
        <p className="text-sm text-muted-foreground mt-1">세션별 측정 결과</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {sessions.map((session, idx) => (
          <motion.div
            key={session.id}
            className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors border-b border-border last:border-b-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3 }}
            data-testid={`log-detail-row-${session.id}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium text-foreground text-sm">{session.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Waveform />
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5",
                  statusColors[session.status] ?? ""
                )}
                data-testid={`badge-quality-${session.id}`}
              >
                {session.quality}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
