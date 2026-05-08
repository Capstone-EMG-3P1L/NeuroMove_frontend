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
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: {
    userId: string;
    username: string;
    name: string;
  };
}
export const authApi = {
  login: (body: { username: string; password: string }) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------------- Onboarding ----------------
export interface OnboardingStartResult {
  onboardingId: string;
}
export interface OnboardingCompleteResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: {
    userId: string;
    username: string;
    name: string;
  };
}
export interface EmgDeviceRegisterResult {
  emgDeviceId: string;
  userId: string | null;
  name: string;
  isActive: boolean;
  createdAt: string | null;
}
export interface MotorDeviceRegisterResult {
  motorDeviceId: string;
  userId: string | null;
  name: string;
  isActive: boolean;
  connectionStatus: string;
  createdAt: string | null;
}
export const onboardingApi = {
  start: (body: { username: string; password: string; name: string }) =>
    request<OnboardingStartResult>("/api/auth/onboarding/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerEmgDevice: (body: { onboardingId: string; name: string }) =>
    request<EmgDeviceRegisterResult>("/api/auth/onboarding/emg-devices", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerMotorDevice: (body: { onboardingId: string; name: string }) =>
    request<MotorDeviceRegisterResult>("/api/auth/onboarding/motor-devices", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  startCalibration: (body: { onboardingId: string; emgDeviceId: string }) =>
    request<CalibrationStartResult>("/api/auth/onboarding/calibration/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCalibrationStep: (body: { onboardingId: string; calibrationSessionId: string; step: "REST" | "LEFT" | "RIGHT" | "STOP" }) =>
    request<CalibrationStepResult>("/api/auth/onboarding/calibration", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  endCalibration: (body: { onboardingId: string; calibrationSessionId: string }) =>
    request<CalibrationEndResult>("/api/auth/onboarding/calibration/end", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  complete: (onboardingId: string) =>
    request<OnboardingCompleteResult>("/api/auth/onboarding/complete", {
      method: "POST",
      body: JSON.stringify({ onboardingId }),
    }),
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
  activeSession?: {
    sessionId: string;
    status: string;
    startedAt: string;
  } | null;
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
export interface SessionStartResult {
  sessionId: string;
  userId: string;
  profileId: string;
  emgDeviceId: string;
  motorDeviceId: string;
  status: string;
  startedAt: string;
}
export interface SessionEndResult {
  sessionId: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  maxRiskScore: number;
}
export interface SessionStatusResult {
  sessionId: string;
  status: string;
  emgDeviceId: string;
  motorDeviceId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  maxRiskScore?: number;
  latestFsmState?: string;
  latestCommand?: {
    command: string;
    speedLevel: number;
    issuedAt: string;
  } | null;
}
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
    intent: string;
    riskScore: number;
    loggedAt: string;
  }>;
}
export const sessionApi = {
  start: (profileId: string, emgDeviceId: string, motorDeviceId: string) =>
    request<SessionStartResult>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ profileId, emgDeviceId, motorDeviceId }),
    }),
  status: (sessionId: string) =>
    request<SessionStatusResult>(`/api/sessions/${sessionId}/status`),
  end: (sessionId: string, reason: string) =>
    request<SessionEndResult>(`/api/sessions/${sessionId}/end`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  detail: (sessionId: string) =>
    request<SessionDetail>(`/api/sessions/${sessionId}/detail`),
};

// ---------------- Calibration ----------------
export interface CalibrationStartResult {
  calibrationSessionId: string;
  emgDeviceId: string;
  status: string;
  currentStep: string;
  startedAt: string;
}
export interface CalibrationStepResult {
  calibrationSessionId: string;
  currentStep: string;
  nextStep: string | null;
  updatedAt: string;
}
export interface CalibrationEndResult {
  profileId: string;
  calibrationSessionId: string;
  signalQuality: number;
  isActive: boolean;
  createdAt: string;
}
export interface CalibrationProfile {
  profileId: string;
  userId?: string;
  ch1Mean?: number;
  ch1Std?: number;
  ch2Mean?: number;
  ch2Std?: number;
  ch3Mean?: number;
  ch3Std?: number;
  activationThreshold?: number;
  intentThresholdLeft?: number;
  intentThresholdRight?: number;
  intentThresholdForward?: number;
  fatigueBaseline?: number;
  signalQuality: number;
  isActive?: boolean;
  updatedAt: string;
}
export const calibrationApi = {
  start: (emgDeviceId: string) =>
    request<CalibrationStartResult>("/api/calibration", {
      method: "POST",
      body: JSON.stringify({ emgDeviceId }),
    }),
  updateStep: (calibrationSessionId: string, step: "REST" | "LEFT" | "RIGHT" | "STOP") =>
    request<CalibrationStepResult>("/api/calibration", {
      method: "PATCH",
      body: JSON.stringify({ calibrationSessionId, step }),
    }),
  end: (calibrationSessionId: string) =>
    request<CalibrationEndResult>("/api/calibration/end", {
      method: "POST",
      body: JSON.stringify({ calibrationSessionId }),
    }),
  profile: () =>
    request<CalibrationProfile>("/api/calibration/profile"),
};
