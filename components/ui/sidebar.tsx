"use client"

import { useState, useMemo } from "react"
import { FileUpload } from "@/components/analytics/file-upload"
import { QueryHistory } from "@/components/analytics/query-history"
import { TableSchemas } from "@/components/analytics/table-schemas"
import { TableStats } from "@/components/analytics/table-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, ChevronDown, Database } from "lucide-react"
import type { TableSchemas as TableSchemasType, QueryHistory as QueryHistoryType } from "@/lib/types"

interface SidebarProps {
  tables: string[]
  onTablesChanged: (tables: string[]) => void
  selectedTable: string | null
  onSelectTable: (table: string | null) => void
  tableSchemas: TableSchemasType
  onTableSchemas: (schemas: TableSchemasType) => void
  history: QueryHistoryType[]
  onSelectQuery: (query: string) => void
  onClearHistory: () => void
}

export function Sidebar({
  tables,
  onTablesChanged,
  selectedTable,
  onSelectTable,
  tableSchemas,
  onTableSchemas,
  history,
  onSelectQuery,
  onClearHistory,
}: SidebarProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tables: true,
    history: true,
  })

  const filteredTables = useMemo(
    () =>
      tables.filter(
        (table) =>
          table.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tableSchemas[table]?.some((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [tables, searchQuery, tableSchemas],
  )

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <aside className="w-full lg:w-80 border-r border-border bg-sidebar min-h-screen lg:overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* File Upload */}
        <FileUpload onTablesChanged={onTablesChanged} onTableSchemas={onTableSchemas} existingSchemas={tableSchemas} />

        {/* Tables Section with Search */}
        {tables.length > 0 && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Tables List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <div>
                      <CardTitle className="text-base">Tables</CardTitle>
                      <CardDescription>{filteredTables.length} table(s)</CardDescription>
                    </div>
                  </div>
                  <button onClick={() => toggleSection("tables")} className="p-1 hover:bg-accent rounded transition">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedSections.tables ? "" : "-rotate-90"}`}
                    />
                  </button>
                </div>
              </CardHeader>

              {expandedSections.tables && (
                <CardContent className="space-y-2">
                  {filteredTables.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No tables found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredTables.map((table) => (
                        <div key={table} className="space-y-1">
                          <button
                            onClick={() => {
                              onSelectTable(table)
                              setExpandedTable(expandedTable === table ? null : table)
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition ${selectedTable === table
                              ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary"
                              : "border-sidebar-border hover:bg-sidebar-accent"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-sm">{table}</div>
                                {tableSchemas[table] && (
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {tableSchemas[table].length} columns
                                  </div>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${expandedTable === table ? "" : "-rotate-90"}`}
                              />
                            </div>
                          </button>

                          {/* Expanded Table Details */}
                          {expandedTable === table && tableSchemas[table] && (
                            <div className="pl-3 space-y-2">
                              <TableStats tableName={table} columns={tableSchemas[table]} />
                              <TableSchemas tableName={table} columns={tableSchemas[table]} compact />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Query History Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">History</CardTitle>
                <CardDescription>{history.length} queries</CardDescription>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleSection("history")} className="p-1 hover:bg-accent rounded transition">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.history ? "" : "-rotate-90"}`}
                  />
                </button>
              </div>
            </div>
          </CardHeader>

          {expandedSections.history && (
            <CardContent>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No query history</p>
              ) : (
                <div className="space-y-2">
                  <QueryHistory history={history} onSelectQuery={onSelectQuery} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearHistory}
                    className="w-full text-xs bg-transparent"
                  >
                    Clear History
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </aside>
  )
}
