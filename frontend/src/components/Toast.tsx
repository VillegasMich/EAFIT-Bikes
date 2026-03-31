import type { Notification } from "../types/notification";

const variantClasses: Record<Notification["type"], string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

function Toast({ notification, onClose }: ToastProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-lg ${variantClasses[notification.type]}`}
      role="alert"
    >
      <span className="text-sm font-medium">{notification.message}</span>
      <button
        onClick={() => onClose(notification.id)}
        className="shrink-0 rounded p-0.5 hover:bg-white/20"
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

export default Toast;
