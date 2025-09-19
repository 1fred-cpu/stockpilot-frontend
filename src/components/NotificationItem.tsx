import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { Notification } from "@/data/notification";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the parent click handler from firing
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer group ${
        !notification.isRead ? "bg-blue-50/30" : ""
      }`}
      onClick={handleClick}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={notification.user.avatar} />
        <AvatarFallback className="bg-orange-500 text-white text-xs">
          {notification.user.initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-1 mb-1">
          <span className="font-medium text-gray-900 text-sm">
            {notification.user.name}
          </span>
          <span className="text-gray-600 text-sm">{notification.action}</span>
          <span className="font-medium text-gray-900 text-sm">
            {notification.project}
          </span>
        </div>

        {notification.message && (
          <p className="text-gray-600 text-sm mb-2 leading-relaxed">
            {notification.message}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {notification.timestamp}
          </span>
          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-6 px-2 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark as read
              </Button>
            )}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
