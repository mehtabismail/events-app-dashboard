"use client";
// ThemeSwitcher component for toggling light/dark mode
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const localTheme = localStorage.getItem("theme");
      setTheme(
        localTheme ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light")
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Button
      variant='outline'
      onClick={toggleTheme}
      className='fixed top-4 right-4 z-50'
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
