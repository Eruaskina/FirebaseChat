import { playMessageReceivedSound } from './sound';

export interface InAppNotification {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderColor?: string;
  channelId: string;
  channelName: string;
  text: string;
  createdAt: string;
}

// Request Desktop Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return Notification.permission;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Dispatch browser desktop notification
export function triggerDesktopNotification(
  title: string,
  body: string,
  onClick?: () => void
): void {
  // Always play audio chime
  playMessageReceivedSound();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFA000'><path d='M3.89 15.672L6.255.472A.538.538 0 017.27.24l2.544 4.792zm15.77 4.148l-1.92-12.01a.539.539 0 00-.916-.27L3.89 15.672l7.518 4.24a1.536 1.536 0 001.488 0l6.764-4.092zM13.23 8.358l-1.91-3.66a.54.54 0 00-.96 0L8.68 8.01l4.55.348z'/></svg>",
        badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FFA000'><circle cx='12' cy='12' r='10'/></svg>",
        silent: true // We already play custom Web Audio synth sound
      });

      notif.onclick = () => {
        window.focus();
        onClick?.();
        notif.close();
      };

      // Auto close notification after 6 seconds
      setTimeout(() => notif.close(), 6000);
    } catch (err) {
      console.warn('Desktop notification failed:', err);
    }
  }
}
