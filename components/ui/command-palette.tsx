"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Database, FileUp, Play, History, BookOpen, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnalyticsStore } from "@/lib/store"

interface Command {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  category: "query" | "data" | "export" | "navigation"
}

interface CommandPaletteProps {
  onExecuteQuery?: () => void
  onUploadFile?: () => void
  onExport?: (format: string) => void
}

export function CommandPalette({
  onExecuteQuery,
  onUploadFile,
  onExport,
}: CommandPaletteProps) {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveTab } = useAnalyticsStore()
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleClose = () => setCommandPaletteOpen(false)

  const commands: Command[] = [
    {
      id: "execute-query",
      title: "Execute Query",
      description: "Run the current SQL query (Ctrl+Enter)",
      icon: <Play className="w-4 h-4" />,
      action: () => {
        onExecuteQuery?.()
        handleClose()
      },
      category: "query",
    },
    {
      id: "upload-csv",
      title: "Upload CSV File",
      description: "Import data from CSV",
      icon: <FileUp className="w-4 h-4" />,
      action: () => {
        onUploadFile?.()
        handleClose()
      },
      category: "data",
    },
    {
      id: "nav-query",
      title: "Go to Query Editor",
      description: "Navigate to query tab",
      icon: <Database className="w-4 h-4" />,
      action: () => {
        setActiveTab("query")
        handleClose()
      },
      category: "navigation",
    },
    {
      id: "nav-builder",
      title: "Go to Query Builder",
      description: "Navigate to builder tab",
      icon: <Database className="w-4 h-4" />,
      action: () => {
        setActiveTab("builder")
        handleClose()
      },
      category: "navigation",
    },
    {
      id: "nav-templates",
      title: "Go to Templates",
      description: "Browse query templates",
      icon: <BookOpen className="w-4 h-4" />,
      action: () => {
        setActiveTab("templates")
        handleClose()
      },
      category: "navigation",
    },
    {
      id: "nav-results",
      title: "Go to Results",
      description: "View query results",
      icon: <Database className="w-4 h-4" />,
      action: () => {
        setActiveTab("results")
        handleClose()
      },
      category: "navigation",
    },
    {
      id: "nav-saved",
      title: "Go to Saved Queries",
      description: "View saved queries",
      icon: <History className="w-4 h-4" />,
      action: () => {
        setActiveTab("saved")
        handleClose()
      },
      category: "navigation",
    },
    {
      id: "export-csv",
      title: "Export as CSV",
      description: "Download results as CSV",
      icon: <Download className="w-4 h-4" />,
      action: () => {
        onExport?.("csv")
        handleClose()
      },
      category: "export",
    },
    {
      id: "export-json",
      title: "Export as JSON",
      description: "Download results as JSON",
      icon: <Download className="w-4 h-4" />,
      action: () => {
        onExport?.("json")
        handleClose()
      },
      category: "export",
    },
    {
      id: "export-markdown",
      title: "Export as Markdown",
      description: "Download results as Markdown table",
      icon: <Download className="w-4 h-4" />,
      action: () => {
        onExport?.("markdown")
        handleClose()
      },
      category: "export",
    },
  ]

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return

      if (e.key === "Escape") {
        handleClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
      }
    },
    [commandPaletteOpen, filteredCommands, selectedIndex, handleClose]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch("")
      setSelectedIndex(0)
    }
  }, [commandPaletteOpen])

  if (!commandPaletteOpen) return null

  const categoryLabels = {
    query: "Query",
    data: "Data",
    export: "Export",
    navigation: "Navigation",
  }

  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = []
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, Command[]>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-base"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Commands List */}
        <div className="max-h-[500px] overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </div>
              {cmds.map((cmd, index) => {
                const globalIndex = filteredCommands.indexOf(cmd)
                const isSelected = globalIndex === selectedIndex
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isSelected ? "bg-accent" : "hover:bg-accent/50"
                      }`}
                  >
                    <div className={`${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{cmd.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

