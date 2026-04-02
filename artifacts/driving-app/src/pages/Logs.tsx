import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

const logs = [
  {
    id: 1,
    name: "세션 1",
    startDate: "2021-04-01",
    endDate: "2021-05-01 10:30",
  },
  {
    id: 2,
    name: "세션 2",
    startDate: "2021-04-01",
    endDate: "2021-05-01 10:45",
  },
  {
    id: 3,
    name: "세션 3",
    startDate: "2021-05-01",
    endDate: "2021-05-01 11:00",
  },
  {
    id: 4,
    name: "세션 4",
    startDate: "2021-05-01",
    endDate: "2021-05-01 11:05",
  },
];

export default function Logs() {
  const [, setLocation] = useLocation();

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">운행 로그</h1>
        <p className="text-sm text-muted-foreground mt-1">운행 기록 목록</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {logs.map((log, idx) => (
          <motion.div
            key={log.id}
            className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border last:border-b-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3 }}
            onClick={() => setLocation("/logs/detail")}
            data-testid={`log-row-${log.id}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium text-foreground text-sm">{log.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{log.startDate}</div>
                <div className="text-xs font-medium text-foreground">{log.endDate}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
