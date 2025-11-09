"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Sidebar } from "@/components/ui/sidebar"
import { MainContent } from "@/components/analytics/main-content"
import { Analytics } from "@/components/analytics/analytics"
import { DataStats } from "@/components/analytics/data-stats"
import { DataQuality } from "@/components/analytics/data-quality"
import { LandingPage } from "@/components/landing-page"
import { CommandPalette } from "@/components/ui/command-palette"
import { useAnalyticsStore } from "@/lib/store"
import { exportToCSV, exportToJSON, exportToJSONLines, exportToMarkdown, exportToHTML } from "@/lib/export-utils"

export default function Home() {
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Use Zustand store instead of local state
  const {
    tables,
    setTables,
    selectedTable,
    setSelectedTable,
    tableSchemas,
    setTableSchemas,
    queryResults,
    setQueryResults,
    isLoading,
    setIsLoading,
    history,
    addQuery,
    clearHistory,
    queryStats,
    incrementQueryStats,
    setCommandPaletteOpen,
  } = useAnalyticsStore()

  const handleAddQuery = (query: string, cached = false, time = 0, success = true) => {
    addQuery(query)
    incrementQueryStats(cached, time, success)
  }

  const handleBack = () => {
    setShowAnalytics(false)
  }

  // Command Palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleExport = async (format: string) => {
    if (!queryResults || !queryResults.rows || queryResults.rows.length === 0) {
      alert("No results to export")
      return
    }

    try {
      switch (format) {
        case "csv":
          await exportToCSV(queryResults)
          break
        case "json":
          await exportToJSON(queryResults)
          break
        case "jsonl":
          await exportToJSONLines(queryResults)
          break
        case "markdown":
          await exportToMarkdown(queryResults)
          break
        case "html":
          await exportToHTML(queryResults)
          break
        default:
          alert(`Export format "${format}" not yet implemented`)
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export results")
    }
  }

  if (!showAnalytics) {
    return (
      <div>
        <Header />
        <LandingPage onGetStarted={() => setShowAnalytics(true)} />
      </div>
    )
  }

  return (
    <>
      <CommandPalette onExport={handleExport} />
      <div className="min-h-screen bg-background text-foreground">
        <Header showBackButton onBack={handleBack} />

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <Sidebar
            tables={tables}
            onTablesChanged={setTables}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            tableSchemas={tableSchemas}
            onTableSchemas={setTableSchemas}
            history={history}
            onSelectQuery={(query) => {
              const editor = document.getElementById("query-editor") as HTMLTextAreaElement
              if (editor) editor.value = query
            }}
            onClearHistory={clearHistory}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-80 min-w-0">
            <MainContent
              tables={tables}
              selectedTable={selectedTable}
              tableSchemas={tableSchemas}
              queryResults={queryResults}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              onResults={setQueryResults}
              onQuery={handleAddQuery}
              history={history}
            />

            {/* Analytics Dashboard */}
            <div className="border-t border-border">
              <Analytics
                totalQueries={queryStats.total}
                totalTables={tables.length}
                totalRows={queryResults?.rows?.length || 0}
                queryHistory={history}
                avgQueryTime={queryStats.avgTime}
                cacheHitRate={queryStats.total > 0 ? (queryStats.cached / queryStats.total) * 100 : 0}
                successRate={queryStats.total > 0 ? (queryStats.successful / queryStats.total) * 100 : 0}
              />
            </div>

            {/* Data Statistics */}
            {queryResults && queryResults.rows && queryResults.rows.length > 0 && (
              <div className="border-t border-border p-4 lg:p-8">
                <div className="space-y-6">
                  <DataStats
                    data={queryResults.rows}
                    columns={queryResults.columns || Object.keys(queryResults.rows[0] || {})}
                  />
                  <DataQuality
                    data={queryResults.rows}
                    columns={queryResults.columns || Object.keys(queryResults.rows[0] || {})}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
