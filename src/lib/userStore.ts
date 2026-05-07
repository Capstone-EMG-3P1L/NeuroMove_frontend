export interface UserProfile {
  name: string;
  id: string;
  userId?: string;
  token?: string;
  emgDeviceId?: string;
  motorDeviceId?: string;
  calibrationSessionId?: string;
  profileId?: string;
  activeSessionId?: string;
}

const STORAGE_KEY = "nm_user_profile";

function loadFromStorage(): UserProfile | null {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(STORAGE_KEY)
        : null;
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

let currentUser: UserProfile | null = loadFromStorage();

function persist(user: UserProfile | null) {
  try {
    if (typeof window === "undefined") return;
    if (user) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function setUser(user: UserProfile) {
  currentUser = user;
  persist(user);
}

export function updateUser(patch: Partial<UserProfile>) {
  currentUser = {
    ...(currentUser ?? { name: "사용자", id: "" }),
    ...patch,
  };
  persist(currentUser);
}

export function getUser(): UserProfile | null {
  return currentUser;
}

export function getToken(): string | null {
  return currentUser?.token ?? null;
}

export function clearUser() {
  currentUser = null;
  persist(null);
}
