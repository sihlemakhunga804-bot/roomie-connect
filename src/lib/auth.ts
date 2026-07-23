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

// Password Recovery
const RECOVERY_CODE_KEY = "roomie:recovery-code:temp";
const RECOVERY_PHONE_KEY = "roomie:recovery-phone:temp";

export function sendRecoveryCode(phone: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Check if user exists
    const usersRaw = window.localStorage.getItem("roomie:users:v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};

    if (!users[phone]) {
      console.warn(`[roomie:auth] No account found for phone: ${phone}`);
      return false;
    }

    // Generate a 4-digit recovery code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store the code and phone in sessionStorage for demo purposes
    window.sessionStorage.setItem(RECOVERY_CODE_KEY, code);
    window.sessionStorage.setItem(RECOVERY_PHONE_KEY, phone);

    console.info(`[roomie:auth] Recovery code sent to ${phone}: ${code}`);
    return true;
  } catch (error) {
    console.error("[roomie:auth] Error sending recovery code:", error);
    return false;
  }
}

export function verifyRecoveryCode(code: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const storedCode = window.sessionStorage.getItem(RECOVERY_CODE_KEY);
    return storedCode === code;
  } catch {
    return false;
  }
}

export function resetPassword(phone: string, newPassword: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Verify the recovery phone matches
    const recoveryPhone = window.sessionStorage.getItem(RECOVERY_PHONE_KEY);
    if (recoveryPhone !== phone) {
      console.error("[roomie:auth] Recovery phone mismatch");
      return false;
    }

    // Update the password
    const usersRaw = window.localStorage.getItem("roomie:users:v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};

    if (!users[phone]) {
      console.error("[roomie:auth] User not found");
      return false;
    }

    users[phone].password = newPassword;
    window.localStorage.setItem("roomie:users:v1", JSON.stringify(users));

    // Clear recovery session
    window.sessionStorage.removeItem(RECOVERY_CODE_KEY);
    window.sessionStorage.removeItem(RECOVERY_PHONE_KEY);

    console.info(`[roomie:auth] Password reset successfully for ${phone}`);
    return true;
  } catch (error) {
    console.error("[roomie:auth] Error resetting password:", error);
    return false;
  }
}
