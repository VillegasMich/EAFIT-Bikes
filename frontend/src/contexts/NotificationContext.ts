import { createContext } from "react";
import type { NotificationType } from "../types/notification";

export interface NotificationContextValue {
  addNotification: (message: string, type: NotificationType) => void;
}

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);
