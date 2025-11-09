"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Download, Search, ArrowUpDown, Copy, Info, FileDown } from "lucide-react"
import { AdvancedChart } from "@/components/analytics/advanced-chart"
import { ChartCustomizer, type ChartConfig } from "@/components/analytics/chart-customizer"
import { ColumnStatsTooltip } from "@/components/ui/column-stats-tooltip"
import { exportToCSV, exportToJSON, exportToMarkdown, exportToHTML, exportToJSONLines } from "@/lib/export-utils"
import type { QueryResults as QueryResultsType } from "@/lib/types"

interface QueryResultsProps {
  results: QueryResultsType
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function QueryResults({ results }: QueryResultsProps) {
  const [chartType, setChartType] = useState<"table" | "bar" | "line" | "pie" | "scatter" | "advanced">("table")
  const [currentPage, setCurrentPage] = useState(0)
  const [advancedChartType, setAdvancedChartType] = useState<"area" | "stacked-bar" | "multi-line" | "radar" | "combo">(
    "area",
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [copiedCell, setCopiedCell] = useState<string | null>(null)
  const [hoveredColumn, setHoveredColumn] = useState<{
    name: string
    position: { x: number; y: number }
  } | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const itemsPerPage = 50

  const columns = results.columns || (results.rows[0] ? Object.keys(results.rows[0]) : [])
  const numericColumns = useMemo(
    () => columns.filter((col) => results.rows.some((row) => typeof row[col] === "number")),
    [columns, results],
  )

  const categoricalColumns = useMemo(
    () => columns.filter((col) => results.rows.some((row) => typeof row[col] === "string")),
    [columns, results],
  )

  const chartData = useMemo(() => {
    if (chartType === "pie" && categoricalColumns.length > 0 && numericColumns.length > 0) {
      const grouped: Record<string, number> = {}
      results.rows.forEach((row) => {
        const key = String(row[categoricalColumns[0]])
        grouped[key] = (grouped[key] || 0) + (Number(row[numericColumns[0]]) || 1)
      })
      return Object.entries(grouped).map(([name, value]) => ({ name, value }))
    }

    if (chartType === "scatter" && numericColumns.length >= 2) {
      return results.rows.slice(0, 100).map((row, idx: number) => ({
        x: Number(row[numericColumns[0]]) || 0,
        y: Number(row[numericColumns[1]]) || 0,
        name: `Item ${idx}`,
      }))
    }

    return results.rows.slice(0, 20).map((row, idx: number) => ({
      name: columns[0] ? String(row[columns[0]]) : `Item ${idx}`,
      value: numericColumns.length > 0 ? Number(row[numericColumns[0]]) : 0,
      ...(numericColumns.length > 1 && { value2: Number(row[numericColumns[1]]) }),
    }))
  }, [results, columns, numericColumns, categoricalColumns, chartType])

  // Filter and sort rows
  const filteredAndSortedRows = useMemo(() => {
    let filtered = results.rows

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((col) =>
          String(row[col] ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]

        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        const comparison = aVal < bVal ? -1 : 1
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [results.rows, searchTerm, sortColumn, sortDirection, columns])

  const paginatedRows = useMemo(() => {
    const start = currentPage * itemsPerPage
    return filteredAndSortedRows.slice(start, start + itemsPerPage)
  }, [filteredAndSortedRows, currentPage])

  const totalPages = Math.ceil(filteredAndSortedRows.length / itemsPerPage)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setCurrentPage(0)
  }

  const handleCopyCell = (value: unknown) => {
    const text = String(value ?? "")
    navigator.clipboard.writeText(text)
    setCopiedCell(text)
    setTimeout(() => setCopiedCell(null), 2000)
  }

  // Quick stats
  const quickStats = useMemo(() => {
    return {
      totalRows: results.rows.length,
      filteredRows: filteredAndSortedRows.length,
      columns: columns.length,
      numericCols: numericColumns.length,
    }
  }, [results.rows.length, filteredAndSortedRows.length, columns.length, numericColumns.length])

  const handleExport = useCallback(async (format: "csv" | "json" | "jsonl" | "markdown" | "html") => {
    try {
      switch (format) {
        case "csv":
          await exportToCSV(results)
          break
        case "json":
          await exportToJSON(results)
          break
        case "jsonl":
          await exportToJSONLines(results)
          break
        case "markdown":
          await exportToMarkdown(results)
          break
        case "html":
          await exportToHTML(results)
          break
      }
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export error:", error)
    }
  }, [results])

  const handleCustomize = (config: ChartConfig) => {
    setAdvancedChartType(config.chartType)
  }

  if (!results || !results.rows || results.rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No results to display</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {hoveredColumn && (
        <ColumnStatsTooltip
          columnName={hoveredColumn.name}
          data={results.rows}
          position={hoveredColumn.position}
        />
      )}
      {chartType === "advanced" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCustomizer
            numericColumns={numericColumns}
            categoricalColumns={categoricalColumns}
            onCustomize={handleCustomize}
          />
          <div className="lg:col-span-2">
            <AdvancedChart
              data={results.rows}
              columns={columns}
              chartType={advancedChartType}
              numericColumns={numericColumns}
              categoricalColumns={categoricalColumns}
            />
          </div>
        </div>
      )}

      {chartType !== "advanced" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Results
                  {copiedCell && (
                    <span className="text-xs font-normal text-chart-1 bg-chart-1/10 px-2 py-1 rounded">
                      ✓ Copied!
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span>
                    {quickStats.filteredRows} row{quickStats.filteredRows !== 1 ? "s" : ""}
                    {quickStats.filteredRows !== quickStats.totalRows &&
                      ` (filtered from ${quickStats.totalRows})`}
                  </span>
                  <span className="text-xs">•</span>
                  <span>{quickStats.columns} columns</span>
                  {quickStats.numericCols > 0 && (
                    <>
                      <span className="text-xs">•</span>
                      <span>{quickStats.numericCols} numeric</span>
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setChartType("table")}
                  className={`px-3 py-1.5 text-sm rounded border transition ${chartType === "table"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                    }`}
                >
                  Table
                </button>
                {numericColumns.length > 0 && (
                  <>
                    <button
                      onClick={() => setChartType("bar")}
                      className={`px-3 py-1.5 text-sm rounded border transition ${chartType === "bar"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                        }`}
                    >
                      Bar
                    </button>
                    <button
                      onClick={() => setChartType("line")}
                      className={`px-3 py-1.5 text-sm rounded border transition ${chartType === "line"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                        }`}
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType("advanced")}
                      className="px-3 py-1.5 text-sm rounded border transition border-border hover:bg-accent"
                    >
                      Advanced
                    </button>
                    {categoricalColumns.length > 0 && (
                      <button
                        onClick={() => setChartType("pie")}
                        className={`px-3 py-1.5 text-sm rounded border transition ${chartType === "pie"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                          }`}
                      >
                        Pie
                      </button>
                    )}
                    {numericColumns.length >= 2 && (
                      <button
                        onClick={() => setChartType("scatter")}
                        className={`px-3 py-1.5 text-sm rounded border transition ${chartType === "scatter"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                          }`}
                      >
                        Scatter
                      </button>
                    )}
                  </>
                )}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => handleExport("csv")}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          CSV Format
                        </button>
                        <button
                          onClick={() => handleExport("json")}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          JSON Format
                        </button>
                        <button
                          onClick={() => handleExport("jsonl")}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          JSON Lines
                        </button>
                        <button
                          onClick={() => handleExport("markdown")}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          Markdown Table
                        </button>
                        <button
                          onClick={() => handleExport("html")}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                        >
                          HTML Table
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartType === "table" ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search in results..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(0)
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span>Click column headers to sort • Click cells to copy</span>
                  </div>
                </div>

                {/* Table with fixed height and sticky header */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                    <table className="w-full text-sm border-collapse">
                      <thead className="sticky top-0 z-10 bg-muted">
                        <tr className="border-b border-border">
                          {columns.map((col) => (
                            <th
                              key={col}
                              onClick={() => handleSort(col)}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setHoveredColumn({
                                  name: col,
                                  position: { x: rect.left + rect.width / 2 - 128, y: rect.top },
                                })
                              }}
                              onMouseLeave={() => setHoveredColumn(null)}
                              className="text-left p-3 font-semibold text-foreground cursor-pointer hover:bg-accent transition-colors group relative min-w-[120px] max-w-[250px]"
                            >
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="truncate" title={col}>{col}</span>
                                <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                {sortColumn === col && (
                                  <span className="text-primary flex-shrink-0">
                                    {sortDirection === "asc" ? "↑" : "↓"}
                                  </span>
                                )}
                                <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground flex-shrink-0" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((row, idx: number) => (
                          <tr key={idx} className="border-b border-border hover:bg-accent/50 transition-colors">
                            {columns.map((col) => (
                              <td
                                key={col}
                                onClick={() => handleCopyCell(row[col])}
                                className="p-3 text-xs cursor-pointer hover:bg-accent group relative min-w-[120px] max-w-[250px]"
                                title={`${col}: ${typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")} (click to copy)`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="truncate block">
                                    {typeof row[col] === "object"
                                      ? JSON.stringify(row[col])
                                      : String(row[col] ?? "")}
                                  </span>
                                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground flex-shrink-0" />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                      Showing {currentPage * itemsPerPage + 1} to{" "}
                      {Math.min((currentPage + 1) * itemsPerPage, filteredAndSortedRows.length)} of{" "}
                      {filteredAndSortedRows.length} rows
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(0)}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm px-3 py-1 bg-muted rounded">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(totalPages - 1)}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : chartType === "bar" ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Bar dataKey="value" fill="var(--color-chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            ) : chartType === "line" ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : chartType === "pie" ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {chartData.map((_entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" dataKey="x" tick={{ fontSize: 12 }} />
                  <YAxis type="number" dataKey="y" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Scatter data={chartData} fill="var(--color-chart-1)" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
