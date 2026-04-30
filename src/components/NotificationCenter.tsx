import React from "react";
import { useNotificationStore } from "../lib/store";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      default:
        return "text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 max-w-sm space-y-2 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg flex gap-3 animate-in fade-in slide-in-from-right-4 duration-200 ${getBgColor(
            notification.type
          )}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <p className={`flex-1 text-sm font-medium ${getTextColor(notification.type)}`}>
            {notification.message}
          </p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
