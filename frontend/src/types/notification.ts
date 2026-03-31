export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}
