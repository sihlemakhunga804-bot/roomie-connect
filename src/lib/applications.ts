import { z } from "zod";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "landlord_contacted"
  | "accepted"
  | "declined";

export type Application = {
  id: string;
  roomId: string;
  roomTitle: string;
  roomImg: string;
  fullName: string;
  email: string;
  phone: string;
  moveInDate: string;
  occupation: string;
  message: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
};

export const applicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Please enter your full name" })
    .max(100, { message: "Name must be under 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address" })
    .max(255),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid phone number" })
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, { message: "Digits, spaces, +, -, () only" }),
  moveInDate: z
    .string()
    .min(1, { message: "Select a move-in date" })
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" }),
  occupation: z
    .string()
    .trim()
    .min(2, { message: "Tell us what you do" })
    .max(80),
  message: z
    .string()
    .trim()
    .min(20, { message: "Say a bit more so the landlord can decide (min 20 chars)" })
    .max(1000, { message: "Keep it under 1,000 characters" }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

const KEY = "roomie:applications:v1";

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Application[]) : [];
  } catch {
    return [];
  }
}

function write(apps: Application[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(apps));
  window.dispatchEvent(new CustomEvent("roomie:applications:changed"));
}

export function listApplications(): Application[] {
  return read().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function getApplicationForRoom(roomId: string): Application | undefined {
  return read().find((a) => a.roomId === roomId);
}

export function submitApplication(
  room: { id: string; title: string; img: string },
  input: ApplicationInput,
): Application {
  const now = new Date().toISOString();
  const app: Application = {
    id: `app_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    roomId: room.id,
    roomTitle: room.title,
    roomImg: room.img,
    ...input,
    status: "submitted",
    submittedAt: now,
    updatedAt: now,
  };
  const existing = read().filter((a) => a.roomId !== room.id);
  write([app, ...existing]);
  // Simulate landlord workflow progression client-side
  scheduleStatusProgression(app.id);
  return app;
}

export function withdrawApplication(id: string) {
  write(read().filter((a) => a.id !== id));
}

export function updateStatus(id: string, status: ApplicationStatus) {
  const current = read();
  const prev = current.find((a) => a.id === id);
  const apps = current.map((a) =>
    a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
  );
  write(apps);
  if (prev && prev.status !== status) {
    const wasDecided = prev.status === "accepted" || prev.status === "declined";
    if (status === "accepted") {
      pushNotification({
        applicationId: id,
        roomId: prev.roomId,
        roomTitle: prev.roomTitle,
        kind: "accepted",
        title: "You're in! 🎉",
        body: `The landlord accepted your application for ${prev.roomTitle}.`,
      });
    } else if (status === "declined") {
      pushNotification({
        applicationId: id,
        roomId: prev.roomId,
        roomTitle: prev.roomTitle,
        kind: "declined",
        title: "Not this time",
        body: `The landlord passed on your application for ${prev.roomTitle}.`,
      });
    } else if (wasDecided) {
      pushNotification({
        applicationId: id,
        roomId: prev.roomId,
        roomTitle: prev.roomTitle,
        kind: "reopened",
        title: "Application reopened",
        body: `The landlord reopened your application for ${prev.roomTitle}.`,
      });
    }
  }
}

// -------- Notifications --------

export type NotificationKind = "accepted" | "declined" | "reopened";

export type AppNotification = {
  id: string;
  applicationId: string;
  roomId: string;
  roomTitle: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const NOTIF_KEY = "roomie:notifications:v1";

function readNotifs(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function writeNotifs(items: AppNotification[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIF_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("roomie:notifications:changed"));
}

function pushNotification(
  n: Omit<AppNotification, "id" | "createdAt" | "read">,
) {
  const item: AppNotification = {
    ...n,
    id: `ntf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  writeNotifs([item, ...readNotifs()].slice(0, 50));
}

export function listNotifications(): AppNotification[] {
  return readNotifs().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function unreadNotificationCount(): number {
  return readNotifs().filter((n) => !n.read).length;
}

export function markNotificationRead(id: string) {
  writeNotifs(readNotifs().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllNotificationsRead() {
  writeNotifs(readNotifs().map((n) => ({ ...n, read: true })));
}

export function clearNotifications() {
  writeNotifs([]);
}

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; description: string; step: number }
> = {
  submitted: {
    label: "Submitted",
    description: "Your application is with the landlord.",
    step: 1,
  },
  under_review: {
    label: "Under review",
    description: "The landlord is reviewing your details.",
    step: 2,
  },
  landlord_contacted: {
    label: "Landlord in touch",
    description: "Check your email — the landlord reached out.",
    step: 3,
  },
  accepted: {
    label: "Accepted",
    description: "You've been accepted. Time to sign the lease.",
    step: 4,
  },
  declined: {
    label: "Not this time",
    description: "The landlord picked a different tenant.",
    step: 4,
  },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "landlord_contacted",
  "accepted",
];

function scheduleStatusProgression(id: string) {
  // Mock landlord activity so the tracker feels alive during the session.
  if (typeof window === "undefined") return;
  window.setTimeout(() => updateStatus(id, "under_review"), 6000);
  window.setTimeout(() => updateStatus(id, "landlord_contacted"), 18000);
}
