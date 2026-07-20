import { z } from "zod";

export type UserRole = "tenant" | "landlord";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rememberMe: boolean;
  createdAt: string;
};

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

const AUTH_KEY = "roomie:auth:v1";
const REMEMBER_ME_KEY = "roomie:remember-me:v1";

// Mock user database for demo purposes
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "tenant@example.com": {
    password: "password123",
    user: {
      id: "user_tenant_1",
      email: "tenant@example.com",
      name: "Sarah Johnson",
      role: "tenant",
      rememberMe: false,
      createdAt: new Date().toISOString(),
    },
  },
  "landlord@example.com": {
    password: "password123",
    user: {
      id: "user_landlord_1",
      email: "landlord@example.com",
      name: "John Smith",
      role: "landlord",
      rememberMe: false,
      createdAt: new Date().toISOString(),
    },
  },
};

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

export function login(email: string, password: string, rememberMe: boolean): User | null {
  const mockEntry = MOCK_USERS[email];
  if (!mockEntry || mockEntry.password !== password) {
    return null; // Invalid credentials
  }

  const user: User = {
    ...mockEntry.user,
    rememberMe,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_ME_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBER_ME_KEY);
    }
    window.dispatchEvent(new CustomEvent("roomie:auth:changed"));
  }

  return user;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(REMEMBER_ME_KEY);
  window.dispatchEvent(new CustomEvent("roomie:auth:changed"));
}

export function getRememberedEmail(): string | null {
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
