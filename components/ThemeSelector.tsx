"use client"

import * as React from "react"
import { Moon, MoonIcon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

interface ThemeSwitcherBtnProps {
  defaultTheme?: 'light' | 'dark' | 'system'
}


export function ThemeSelector({ defaultTheme }: ThemeSwitcherBtnProps) {
  const { setTheme } = useTheme()


  React.useEffect(() => {
    if (defaultTheme) {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, setTheme])

  
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium">Theme:</div>
        <Button variant="outline" onClick={() => setTheme("light")} aria-label="Set light theme">
          <Sun className="h-4 w-4" /> Light
        </Button>
        <Button variant="outline" onClick={() => setTheme("dark")} aria-label="Set dark theme">
          <Moon className="h-4 w-4" /> Dark
        </Button>
        <Button variant="outline" onClick={() => setTheme("system")} aria-label="Set system theme">
          <Settings className="w-4 h-4" />System
        </Button>
      </div>
    )
}