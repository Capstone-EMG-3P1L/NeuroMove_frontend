import { createContext, useContext, useState, ReactNode } from "react";
import { sessionApi } from "./api";
import { getUser, updateUser } from "./userStore";

interface SessionContextValue {
  isActive: boolean;
  sessionId: string | null;
  handleToggleActive: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    getUser()?.activeSessionId ?? null
  );

  const handleToggleActive = async () => {
    if (isActive) {
      if (sessionId) {
        try {
          await sessionApi.end(sessionId, "USER_REQUEST");
        } catch {
          // 실패해도 UI는 종료
        }
        updateUser({ activeSessionId: undefined });
        setSessionId(null);
      }
      setIsActive(false);
    } else {
      const user = getUser();
      const profileId = user?.profileId;
      const emgDeviceId = user?.emgDeviceId;
      const motorDeviceId = user?.motorDeviceId;

      if (!profileId || !emgDeviceId || !motorDeviceId) {
        alert("캘리브레이션이 완료되지 않았습니다. 먼저 캘리브레이션을 진행해주세요.");
        return;
      }
      try {
        const res = await sessionApi.start(profileId, emgDeviceId, motorDeviceId);
        setSessionId(res.sessionId);
        updateUser({ activeSessionId: res.sessionId });
      } catch (e) {
        alert(`세션 시작 실패: ${e instanceof Error ? e.message : "서버 연결 오류"}`);
        return;
      }
      setIsActive(true);
    }
  };

  return (
    <SessionContext.Provider value={{ isActive, sessionId, handleToggleActive }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
