import { z } from "zod";

export type SignupRole = "tenant" | "landlord";

export type SignupStep = "welcome" | "basic-info" | "verification" | "profile-setup" | "complete";

export type SignupData = {
  role: SignupRole;
  name: string;
  phone: string;
  password: string;
  verificationCode?: string;
  profileData?: {
    landlord?: {
      propertyName?: string;
      propertyPhoto?: string;
    };
    tenant?: {
      preferredLocation?: string;
      budget?: string;
    };
  };
};

// Validation schemas for each step
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be under 100 characters" }),
  phone: z
    .string()
    .min(10, { message: "Enter a valid phone number" })
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, { message: "Digits, spaces, +, -, () only" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const verificationSchema = z.object({
  code: z
    .string()
    .length(4, { message: "Code must be 4 digits" })
    .regex(/^\d+$/, { message: "Code must contain only digits" }),
});

export const profileSetupSchema = z.object({
  propertyName: z.string().optional(),
  preferredLocation: z.string().optional(),
  budget: z.string().optional(),
});

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;

// Session storage for signup flow
const SIGNUP_SESSION_KEY = "roomie:signup-session:v1";

export function getSignupSession(): Partial<SignupData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<SignupData>;
  } catch {
    return null;
  }
}

export function setSignupSession(data: Partial<SignupData>): void {
  if (typeof window === "undefined") return;
  const current = getSignupSession() || {};
  const updated = { ...current, ...data };
  window.sessionStorage.setItem(SIGNUP_SESSION_KEY, JSON.stringify(updated));
}

export function clearSignupSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SIGNUP_SESSION_KEY);
}

// Mock SMS verification - in production, this would call a backend service
export function sendVerificationCode(phone: string): string {
  // Generate a mock 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  if (typeof window !== "undefined") {
    // Store the code in sessionStorage for demo purposes
    window.sessionStorage.setItem("roomie:verification-code:temp", code);
    console.info(`[roomie:sms] Verification code sent to ${phone}: ${code}`);
  }
  
  return code;
}

export function verifyCode(enteredCode: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const storedCode = window.sessionStorage.getItem("roomie:verification-code:temp");
    return storedCode === enteredCode;
  } catch {
    return false;
  }
}

// Complete signup and create user account
export function completeSignup(data: SignupData): boolean {
  if (typeof window === "undefined") {
    console.error("[roomie:signup] Window is undefined");
    return false;
  }

  try {
    // Validate required fields
    if (!data.role || !data.name || !data.phone || !data.password) {
      console.error("[roomie:signup] Missing required fields:", {
        role: !!data.role,
        name: !!data.name,
        phone: !!data.phone,
        password: !!data.password,
      });
      return false;
    }

    // In a real app, this would call a backend API
    const usersRaw = window.localStorage.getItem("roomie:users:v1");
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    
    if (users[data.phone]) {
      console.warn(`[roomie:signup] User with phone ${data.phone} already exists`);
      return false; // User already exists
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      password: data.password,
      role: data.role,
      profileData: data.profileData,
      createdAt: new Date().toISOString(),
    };

    users[data.phone] = newUser;
    window.localStorage.setItem("roomie:users:v1", JSON.stringify(users));
    console.info(`[roomie:signup] Account created successfully for ${data.role}: ${data.phone}`);
    clearSignupSession();
    return true;
  } catch (error) {
    console.error("[roomie:signup] Error during account creation:", error);
    return false;
  }
}
