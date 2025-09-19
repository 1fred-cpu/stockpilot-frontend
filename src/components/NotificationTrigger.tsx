"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { NotificationPanel } from "./NotificationPanel";
import { mockNotifications } from "@/data/notification";

export function NotificationTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <div ref={triggerRef}>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 bg-neutral-50 dark:bg-neutral-800 hover:bg-accent "
          onClick={toggleDropdown}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-90 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          style={{ transformOrigin: "top right" }}
        >
          <NotificationPanel />
        </div>
      )}
    </div>
  );
}
