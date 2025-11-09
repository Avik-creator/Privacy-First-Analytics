"use client"

import { Database } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"

interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
}

export function Header({ showBackButton = false, onBack }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                ←
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-chart-1 via-chart-2 to-chart-3 flex items-center justify-center shadow-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Privacy-First Analytics
                </h1>
                {!showBackButton && (
                  <p className="text-xs text-muted-foreground">
                    Browser-based DuckDB • Zero server involvement
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showBackButton && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                  DuckDB Active
                </div>
                <button
                  onClick={() => {
                    const event = new KeyboardEvent("keydown", {
                      key: "k",
                      metaKey: true,
                      bubbles: true,
                    })
                    window.dispatchEvent(event)
                  }}
                  className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
                  title="Open Command Palette"
                >
                  <span>⌘K</span>
                </button>
              </>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
