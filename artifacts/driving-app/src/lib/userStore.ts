export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  id: string;
}

let currentUser: UserProfile | null = null;

export function setUser(user: UserProfile) {
  currentUser = user;
}

export function getUser(): UserProfile | null {
  return currentUser;
}

export function clearUser() {
  currentUser = null;
}
