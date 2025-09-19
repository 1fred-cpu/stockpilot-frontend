"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import NotificationItem from "@/components/NotificationItem";
import { Notification, mockNotifications } from "@/data/notification";

export function NotificationPanel() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<"inbox" | "unread">("inbox");

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const displayedNotifications =
    activeTab === "unread" ? unreadNotifications : notifications;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  return (
    <div className="w-full bg-white rounded-lg">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-auto p-1 font-normal"
          >
            Mark all as read
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "inbox" | "unread")}
        >
          <TabsList className="grid w-full grid-cols-2  gap-3 bg-transparent p-0 pb-2 h-auto">
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:rounded-sm data-[state=active]:border-primary data-[state=active]:text-primary  border border-transparent font-medium pb-2 cursor-pointer hover:bg-accent/50 transition-colors rounded-sm"
            >
              Inbox
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:rounded-sm data-[state=active]:border-primary data-[state=active]:text-primary border border-transparent font-medium pb-2 cursor-pointer hover:bg-accent/50 transition-colors rounded-sm"
            >
              Unread
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-0">
        <Tabs value={activeTab}>
          <TabsContent value="inbox" className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              {displayedNotifications.length > 0 ? (
                displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              {displayedNotifications.length > 0 ? (
                displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No unread notifications
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {displayedNotifications.length > 0 && (
          <div className="border-t p-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-auto p-1 font-normal"
            >
              View all notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
