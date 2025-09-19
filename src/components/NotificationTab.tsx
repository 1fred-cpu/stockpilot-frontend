import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Bell } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
export default function NotificationTab() {
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="mr-10 p-0 border-0 shadow-none bg-transparent">
          <NotificationPanel />
        </PopoverContent>
      </Popover>

      <Badge
        variant="destructive"
        className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
      >
        3
      </Badge>
    </div>
  );
}
