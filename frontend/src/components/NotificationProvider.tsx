import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Notification, NotificationType } from "../types/notification";
import { NotificationContext } from "../contexts/NotificationContext";
import Toast from "./Toast";

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback(
    (message: string, type: NotificationType) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const notification: Notification = {
        id,
        message,
        type,
        timestamp: Date.now(),
      };

      setNotifications((prev) => {
        const next = [...prev, notification];
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });

      if (type !== "error") {
        const timer = setTimeout(() => {
          removeNotification(id);
        }, AUTO_DISMISS_MS);
        timersRef.current.set(id, timer);
      }
    },
    [removeNotification],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value = useMemo(
    () => ({ addNotification }),
    [addNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <Toast
                notification={notification}
                onClose={removeNotification}
              />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </NotificationContext.Provider>
  );
}
