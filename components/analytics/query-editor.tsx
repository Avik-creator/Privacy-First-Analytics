"use client"

import { useState, useRef, useEffect } from "react"
import { executeQuery } from "@/lib/duckdb"
import { queryCache } from "@/lib/query-cache"
import { handleError } from "@/lib/error-handler"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Copy, Play, RotateCcw } from "lucide-react"
import type { QueryResults, QueryHistory, TableSchemas } from "@/lib/types"

interface QueryEditorProps {
  tables: string[]
  selectedTable: string | null
  tableSchemas: TableSchemas
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onResults: (results: QueryResults | null) => void
  onQuery: (query: string, cached?: boolean, time?: number, success?: boolean) => void
  history: QueryHistory[]
  initialQuery?: string
}

export function QueryEditor({
  tables,
  selectedTable,
  tableSchemas,
  isLoading,
  setIsLoading,
  onResults,
  onQuery,
  history,
  initialQuery,
}: QueryEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cacheHit, setCacheHit] = useState(false)

  // Update editor when initialQuery changes
  useEffect(() => {
    if (initialQuery && editorRef.current) {
      editorRef.current.value = initialQuery
    }
  }, [initialQuery])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleExecute()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const handleExecute = async () => {
    const query = editorRef.current?.value
    if (!query?.trim()) return

    setIsLoading(true)
    setError(null)
    setCacheHit(false)
    const startTime = performance.now()

    try {
      // Check cache first
      const cached = queryCache.get(query)
      if (cached) {
        setExecutionTime(0)
        setCacheHit(true)
        onResults(cached.results)
        onQuery(query, true, 0, true) // cached, 0ms, success
        setIsLoading(false)
        return
      }

      const results = await executeQuery(query)
      const endTime = performance.now()
      const time = endTime - startTime

      setExecutionTime(time)
      queryCache.set(query, results, time)
      onResults(results)
      onQuery(query, false, time, true) // not cached, execution time, success
    } catch (err: unknown) {
      const errorContext = handleError(err)
      setError(errorContext.message)
      onResults(null)
      onQuery(query, false, 0, false) // not cached, 0ms, failed
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    const query = editorRef.current?.value
    if (!query) return

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(query))
    element.setAttribute("download", `query-${Date.now()}.sql`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopy = () => {
    const query = editorRef.current?.value
    if (query) {
      navigator.clipboard.writeText(query)
    }
  }

  const getSuggestions = () => {
    const query = editorRef.current?.value || ""
    const words = query.split(/\s+/)
    const lastWord = words[words.length - 1]?.toLowerCase() || ""

    const tableSuggestions = tables.filter((t) => t.toLowerCase().includes(lastWord))
    const columnSuggestions =
      selectedTable && tableSchemas[selectedTable]
        ? tableSchemas[selectedTable].map((col) => col.name).filter((name) => name.toLowerCase().includes(lastWord))
        : []

    return [...tableSuggestions, ...columnSuggestions]
  }

  const suggestions = showSuggestions ? getSuggestions() : []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SQL Query</CardTitle>
            <CardDescription>
              {tables.length === 0 ? "Upload a CSV file to start querying" : `Ready to query ${tables.length} table(s)`}
            </CardDescription>
          </div>
          <div className="text-right">
            {cacheHit && <div className="text-xs font-mono text-chart-1 mb-1">Cached result</div>}
            {executionTime !== null && (
              <div className="text-xs font-mono text-muted-foreground">{executionTime.toFixed(0)}ms</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <textarea
            id="query-editor"
            ref={editorRef}
            placeholder={`SELECT * FROM ${selectedTable || "table"} LIMIT 10;`}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            className="w-full h-40 p-3 font-mono text-sm border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={selectedTable ? `SELECT * FROM ${selectedTable} LIMIT 10;` : ""}
            title="Press Ctrl+Enter to execute"
          />

          {suggestions.length > 0 && showSuggestions && (
            <div className="absolute top-full left-3 mt-1 z-10 bg-card border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.value =
                        editorRef.current.value.slice(0, -editorRef.current.value.split(/\s+/).pop()!.length) +
                        suggestion
                      editorRef.current.focus()
                      setShowSuggestions(false)
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent font-mono"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <div>{error}</div>
              <div className="text-xs mt-1">Use Ctrl+Enter or click Execute to run the query</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExecute} disabled={isLoading || tables.length === 0} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? "Executing..." : "Execute"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copy query (Ctrl+C)">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport} title="Export query">
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              queryCache.clear()
              setExecutionTime(null)
              setCacheHit(false)
            }}
            title="Clear cache"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          Keyboard shortcut: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to execute query
        </div>
      </CardContent>
    </Card>
  )
}
