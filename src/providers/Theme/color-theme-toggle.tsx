"use client";

import * as React from "react";
import { Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from ".";

const themes:Array<{name:string,label:string}> = [
  { name: "default", label: "Default" },
  { name: "minimal-red", label: "Minimal Red" },
  { name: "minimal-rose", label: "Minimal Rose" },
  { name: "minimal-orange", label: "Minimal Orange" },
  { name: "minimal-green", label: "Minimal Green" },
  { name: "minimal-blue", label: "Minimal Blue" },
  { name: "minimal-yellow", label: "Minimal Yellow" },
  { name: "minimal-violet", label: "Minimal Violet" },
  { name: "blue", label: "Blue" },
  { name: "purple", label: "Purple" },
];

export function ColorThemeToggle() {
  const { colorTheme, setColorTheme } = useTheme();

  const handleThemeSelect = (themeName: string) => {
    if (themeName === "default") {
      setColorTheme(null); // Remove data-theme attribute for default
    } else {
      setColorTheme(themeName);
    }
  };

  const currentTheme = colorTheme || "default";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle color theme</span>
          <span className="ml-2 hidden sm:inline-block">
            {themes.find((t) => t.name === currentTheme)?.label || "Default"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => handleThemeSelect(theme.name)}
            className={currentTheme === theme.name ? "bg-accent" : ""}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 border-border ${getThemePreviewColor(
                  theme.name
                )}`}
              />
              {theme.label}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getThemePreviewColor(themeName: string): string {
  const colors: Record<string, string> = {
    default: "bg-gray-600",
    'minimal-red': "bg-red-500",
    'minimal-rose': "bg-rose-500",
    'minimal-orange': "bg-orange-500",
    'minimal-green': "bg-green-500",
    'minimal-blue': "bg-blue-500",
    'minimal-yellow': "bg-yellow-500",
    'minimal-violet': "bg-violet-500",
    blue: 'bg-blue-500',
    purple: "bg-violet-500",
  };

  return colors[themeName] || "bg-gray-600";
}
