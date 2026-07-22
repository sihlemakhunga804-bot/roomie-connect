import { z } from "zod";

export type UserRole = "tenant" | "landlord";

export type User = {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  rememberMe: boolean;
  createdAt: string;
};

export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Enter a valid phone number" })
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, { message: "Digits, spaces, +, -, () only" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

const AUTH_KEY = "roomie:auth:v1";
const REMEMBER_ME_KEY = "roomie:remember-me:v1";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    return user;
  } catch {
    return null;
  }
}

export function login(phone: string, password: string, rememberMe: boolean): User | null {
  if (typeof window === "undefined") return null;

  try {
    const usersRaw = window.localStorage.getItem("roomie:users:v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};

    const user = users[phone];
    if (!user || user.password !== password) {
      return null; // Invalid credentials
    }

    const loggedInUser: User = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      rememberMe,
      createdAt: user.createdAt,
    };

    window.localStorage.setItem(AUTH_KEY, JSON.stringify(loggedInUser));
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_ME_KEY, phone);
    } else {
      window.localStorage.removeItem(REMEMBER_ME_KEY);
    }
    window.dispatchEvent(new CustomEvent("roomie:auth:changed"));

    return loggedInUser;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(REMEMBER_ME_KEY);
  window.dispatchEvent(new CustomEvent("roomie:auth:changed"));
}

export function getRememberedPhone(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REMEMBER_ME_KEY);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function getUserRole(): UserRole | null {
  const user = getCurrentUser();
  return user?.role ?? null;
}
