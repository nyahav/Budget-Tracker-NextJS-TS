"use client"

import * as React from "react"
import { Moon, MoonIcon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface ThemeSwitcherBtnProps {
  defaultTheme?: 'light' | 'dark' | 'system'
    variant?: 'dropdown' | 'buttons'
}


export function ThemeSwitcherBtn({ defaultTheme, variant = 'dropdown' }: ThemeSwitcherBtnProps) {
  const { setTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (defaultTheme) {
      setTheme(defaultTheme)
    }
  }, [defaultTheme, setTheme])

  if (variant === 'buttons') {
    // Side-by-side buttons layout
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
          System
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"  onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
         <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Settings className="h-4 w-4"/>  System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
