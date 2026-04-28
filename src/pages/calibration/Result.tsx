import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { getUser } from "@/lib/userStore";

const measurements = [
  { id: 1, label: "측정 1", date: "2021-05-01 10:30", score: "정확도 92%" },
  { id: 2, label: "측정 2", date: "2021-05-01 10:46", score: "정확도 88%" },
  { id: 3, label: "측정 3", date: "2021-05-01 11:00", score: "정확도 95%" },
  { id: 4, label: "측정 4", date: "2021-05-01 11:06", score: "정확도 91%" },
];

export default function CalibrationResult() {
  const user = getUser();
  const [applied, setApplied] = useState<number | null>(null);

  const handleApply = (id: number) => {
    setApplied(id);
  };

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
          측정값을 선택하면 운행에 적용됩니다
        </p>
      </div>

      {applied !== null && (
        <motion.div
          className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-sm text-green-700 font-medium"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          측정 {applied}이(가) 운행에 적용되었습니다
        </motion.div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {measurements.map((m, idx) => (
          <motion.div
            key={m.id}
            className={`flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0 transition-colors ${
              applied === m.id ? "bg-primary/5" : "hover:bg-muted/30"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.3 }}
            data-testid={`measurement-row-${m.id}`}
          >
            <div className="flex items-center gap-4">
              {applied === m.id ? (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-border shrink-0" />
              )}
              <div>
                <div className="text-sm font-medium text-foreground">{m.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">{m.score}</span>
              <Button
                size="sm"
                variant={applied === m.id ? "default" : "outline"}
                className={`text-xs h-8 px-3 ${applied === m.id ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => handleApply(m.id)}
                data-testid={`button-apply-${m.id}`}
              >
                {applied === m.id ? "적용됨" : "적용"}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
