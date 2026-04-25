/**
 * NeuroMove backend API client.
 * Backend: http://43.201.220.50:8080
 */
import { getToken } from "./userStore";

export const API_BASE_URL = "http://43.201.220.50:8080";

export interface ApiSuccess<T> {
  success: true;
  code: string;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  code: string;
  message: string;
  data?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // non-json
  }

  if (!res.ok || !json || json.success === false) {
    const message =
      (json && "message" in json && json.message) ||
      `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  return json.data;
}

// ---------------- Auth ----------------
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
}
export interface RegisterResponse {
  userId: string;
  username: string;
  name: string;
  token?: string;
}
export const authApi = {
  register: (body: RegisterRequest) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { username: string; password: string }) =>
    request<{ userId: string; username: string; name: string; token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
};

// ---------------- Devices ----------------
export interface EmgDeviceItem {
  emgDeviceId: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}
export interface MotorDeviceItem {
  motorDeviceId: string;
  name: string;
  isActive: boolean;
  connectionStatus?: string;
  createdAt?: string;
}
export const deviceApi = {
  registerEmg: (name: string) =>
    request<EmgDeviceItem>("/api/emg-devices", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  registerMotor: (name: string) =>
    request<MotorDeviceItem>("/api/motor-devices", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  listEmg: () =>
    request<{ devices: EmgDeviceItem[] }>("/api/emg-devices"),
  listMotor: () =>
    request<{ devices: MotorDeviceItem[] }>("/api/motor-devices"),
};

// ---------------- User ----------------
export interface UserStatus {
  userId: string;
  username: string;
  name: string;
  registeredEmgDevice?: {
    emgDeviceId: string;
    name: string;
    isActive: boolean;
  } | null;
  registeredMotorDevice?: {
    motorDeviceId: string;
    name: string;
    isActive: boolean;
    connectionStatus?: string;
  } | null;
  activeCalibrationProfile?: {
    profileId: string;
    signalQuality: number;
    updatedAt: string;
  } | null;
  activeSession?: unknown | null;
}
export interface SessionLogItem {
  sessionId: string;
  emgDeviceId: string;
  motorDeviceId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  maxRiskScore: number;
  status: string;
}
export const userApi = {
  me: () => request<UserStatus>("/api/users/me"),
  myLogs: () =>
    request<{ logs: SessionLogItem[] }>("/api/users/me/logs"),
};

// ---------------- Sessions ----------------
export interface SessionDetail {
  session: {
    sessionId: string;
    emgDeviceId: string;
    motorDeviceId: string;
    status: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    maxRiskScore: number;
  };
  fsmStates: Array<{
    fromState: string;
    toState: string;
    reason: string;
    transitionedAt: string;
  }>;
  intentLogs: Array<{
    intentId: string;
    intent: string;
    confidence: number;
    fatigueScore: number;
    signalQuality: number;
    riskScore: number;
    fatigueComponent: number;
    stabilityComponent: number;
    durationComponent: number;
    accepted: boolean;
    emgTimestamp: number;
    receivedAt: string;
  }>;
  commands: Array<{
    commandId: string;
    intentId: string;
    command: string;
    speedLevel: number;
    riskScore: number;
    isFetched: boolean;
    issuedAt: string;
    fetchedAt: string;
  }>;
}
export const sessionApi = {
  detail: (sessionId: string) =>
    request<SessionDetail>(`/api/sessions/${sessionId}/detail`),
};

// ---------------- Calibration ----------------
export interface CalibrationProfile {
  profileId: string;
  signalQuality: number;
  updatedAt: string;
  isActive?: boolean;
}
export const calibrationApi = {
  profile: () =>
    request<CalibrationProfile>("/api/calibration/profile"),
};
