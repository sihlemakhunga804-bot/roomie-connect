import type { NotificationKind } from "./applications";

export type NotificationChannel = "in_app" | "email" | "push";

export type NotificationPrefs = Record<
  NotificationKind,
  Record<NotificationChannel, boolean>
>;

const KEY = "roomie:notification-prefs:v1";

export const DEFAULT_PREFS: NotificationPrefs = {
  accepted: { in_app: true, email: true, push: true },
  declined: { in_app: true, email: true, push: false },
  reopened: { in_app: true, email: false, push: false },
};

export const KIND_META: Record<
  NotificationKind,
  { label: string; description: string }
> = {
  accepted: {
    label: "Accepted",
    description: "A landlord approves your application.",
  },
  declined: {
    label: "Declined",
    description: "A landlord passes on your application.",
  },
  reopened: {
    label: "Reopened",
    description: "A landlord reopens a decided application.",
  },
};

export const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; description: string }
> = {
  in_app: {
    label: "In-app",
    description: "Toasts and the updates panel on /applications.",
  },
  email: {
    label: "Email",
    description: "Sent to the address on your application.",
  },
  push: {
    label: "Push",
    description: "Browser push (requires permission).",
  },
};

export function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    // merge with defaults so new kinds/channels get sane values
    const merged: NotificationPrefs = { ...DEFAULT_PREFS };
    for (const k of Object.keys(DEFAULT_PREFS) as NotificationKind[]) {
      merged[k] = { ...DEFAULT_PREFS[k], ...(parsed?.[k] ?? {}) };
    }
    return merged;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent("roomie:notification-prefs:changed"));
}

export function isChannelEnabled(
  kind: NotificationKind,
  channel: NotificationChannel,
): boolean {
  return loadPrefs()[kind][channel];
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}
