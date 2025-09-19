"use client";
import React, { ReactNode, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Moon, Laptop, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeMode() {
  const { setTheme, theme } = useTheme();
  const [themeIcon, setThemeIcon] = useState<ReactNode>(
    theme === "system" ? (
      <Laptop className="w-4 h-4" />
    ) : theme === "light" ? (
      <Sun className="w-4 h-4" />
    ) : (
      <Moon className="w-4 h-4" />
    )
  );

  function handleThemeChange(theme: "system" | "light" | "dark") {
    setTheme(theme);
    switch (theme) {
      case "system":
        setThemeIcon(<Laptop className="w-4 h-4" />);
        break;
      case "dark":
        setThemeIcon(<Moon className="w-4 h-4" />);
        break;
      case "light":
        setThemeIcon(<Sun className="w-4 h-4" />);
        break;
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10  bg-neutral-50 dark:bg-neutral-800 hover:bg-accent "
        >
          {themeIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit " align="end" forceMount>
        <DropdownMenuItem
          className="border-0 cursor-pointer"
          onClick={() => handleThemeChange("system")}
        >
          <Laptop className=" h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="border-0 cursor-pointer"
          onClick={() => handleThemeChange("light")}
        >
          <Sun className=" h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="border-0 cursor-pointer"
          onClick={() => handleThemeChange("dark")}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
