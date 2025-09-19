import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-md ">
          <Avatar className="h-10 w-10 rounded-md ">
            <AvatarImage src="/avatars/01.png" alt="@johndoe" />
            <AvatarFallback className="rounded-md bg-neutral-50 dark:bg-neutral-800 hover:bg-accent transition-colors">
              JD
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <Link href="/dashboard/settings/#profile-settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
