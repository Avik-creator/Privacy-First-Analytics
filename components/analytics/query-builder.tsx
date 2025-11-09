"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { TableSchemas } from "@/lib/types"

interface QueryBuilderProps {
  tables: string[]
  tableSchemas: TableSchemas
  selectedTable: string | null
  onBuildQuery: (query: string) => void
}

type Condition = {
  column: string
  operator: string
  value: string
}

export function QueryBuilder({ tables, tableSchemas, selectedTable, onBuildQuery }: QueryBuilderProps) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple")
  const [columns, setColumns] = useState<string[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [orderBy, setOrderBy] = useState<{ column: string; direction: "ASC" | "DESC" } | null>(null)
  const [limit, setLimit] = useState(10)

  const currentSchema = selectedTable ? tableSchemas[selectedTable] : []

  const buildQuery = () => {
    if (!selectedTable) return

    let query = "SELECT "

    // SELECT clause
    if (columns.length === 0) {
      query += "* "
    } else {
      query += columns.join(", ") + " "
    }

    query += `FROM ${selectedTable}`

    // WHERE clause
    if (conditions.length > 0) {
      query += " WHERE "
      query += conditions
        .map((cond) => {
          if (cond.operator === "LIKE") {
            return `${cond.column} ${cond.operator} '%${cond.value}%'`
          }
          return `${cond.column} ${cond.operator} ${isNaN(Number(cond.value)) ? `'${cond.value}'` : cond.value}`
        })
        .join(" AND ")
    }

    // ORDER BY clause
    if (orderBy) {
      query += ` ORDER BY ${orderBy.column} ${orderBy.direction}`
    }

    // LIMIT clause
    query += ` LIMIT ${limit};`

    onBuildQuery(query)
  }

  const addCondition = () => {
    setConditions([...conditions, { column: currentSchema[0]?.name || "", operator: "=", value: "" }])
  }

  const removeCondition = (idx: number) => {
    setConditions(conditions.filter((_, i) => i !== idx))
  }

  const toggleColumn = (colName: string) => {
    setColumns((prev) => (prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]))
  }

  if (!selectedTable) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          Select a table to use the query builder
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Query Builder</CardTitle>
            <CardDescription>Visually construct your SQL query</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("simple")}
              className={`px-3 py-1 text-xs rounded border transition ${mode === "simple"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
                }`}
            >
              Simple
            </button>
            <button
              onClick={() => setMode("advanced")}
              className={`px-3 py-1 text-xs rounded border transition ${mode === "advanced"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
                }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {mode === "simple" ? (
          <div className="space-y-4">
            {/* Column Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Columns</label>
              <div className="grid grid-cols-2 gap-2">
                {currentSchema.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => toggleColumn(col.name)}
                    className={`p-2 text-xs text-left rounded border transition ${columns.includes(col.name)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                      }`}
                  >
                    <div className="font-mono">{col.name}</div>
                    <div className="text-muted-foreground">{col.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Limit Results</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* WHERE Conditions */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Conditions</label>
              <div className="space-y-2">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <select
                      value={cond.column}
                      onChange={(e) => {
                        const newConds = [...conditions]
                        newConds[idx].column = e.target.value
                        setConditions(newConds)
                      }}
                      className="flex-1 px-3 py-2 border border-border rounded bg-background text-sm"
                    >
                      {currentSchema.map((col) => (
                        <option key={col.name} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={cond.operator}
                      onChange={(e) => {
                        const newConds = [...conditions]
                        newConds[idx].operator = e.target.value
                        setConditions(newConds)
                      }}
                      className="px-3 py-2 border border-border rounded bg-background text-sm"
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="LIKE">LIKE</option>
                    </select>
                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => {
                        const newConds = [...conditions]
                        newConds[idx].value = e.target.value
                        setConditions(newConds)
                      }}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border border-border rounded bg-background text-sm"
                    />
                    <button
                      onClick={() => removeCondition(idx)}
                      className="p-2 hover:bg-destructive/10 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addCondition} className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {/* ORDER BY */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Order By</label>
              <div className="flex gap-2">
                <select
                  value={orderBy?.column || ""}
                  onChange={(e) =>
                    setOrderBy(
                      e.target.value ? { column: e.target.value, direction: orderBy?.direction || "ASC" } : null,
                    )
                  }
                  className="flex-1 px-3 py-2 border border-border rounded bg-background text-sm"
                >
                  <option value="">None</option>
                  {currentSchema.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
                {orderBy && (
                  <select
                    value={orderBy.direction}
                    onChange={(e) => setOrderBy({ ...orderBy, direction: e.target.value as "ASC" | "DESC" })}
                    className="px-3 py-2 border border-border rounded bg-background text-sm"
                  >
                    <option value="ASC">ASC</option>
                    <option value="DESC">DESC</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        <Button onClick={buildQuery} className="w-full">
          Generate Query
        </Button>
      </CardContent>
    </Card>
  )
}
