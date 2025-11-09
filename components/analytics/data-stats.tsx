"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DataStatsProps {
  data: Record<string, unknown>[]
  columns: string[]
}

interface ColumnStats {
  name: string
  type: string
  count: number
  nullCount: number
  uniqueCount: number
  min?: number
  max?: number
  avg?: number
  median?: number
}

export function DataStats({ data, columns }: DataStatsProps) {
  const stats = useMemo(() => {
    const columnStats: ColumnStats[] = []

    columns.forEach((col) => {
      const values = data.map((row) => row[col])
      const nullCount = values.filter((v) => v === null || v === undefined).length
      const uniqueValues = new Set(values.filter((v) => v !== null && v !== undefined))

      const colStats: ColumnStats = {
        name: col,
        type: typeof values[0],
        count: data.length,
        nullCount,
        uniqueCount: uniqueValues.size,
      }

      // Calculate stats for numeric columns
      const numericValues = values.filter((v) => typeof v === "number").sort((a, b) => a - b)

      if (numericValues.length > 0) {
        colStats.min = Math.min(...numericValues)
        colStats.max = Math.max(...numericValues)
        colStats.avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        colStats.median =
          numericValues.length % 2 === 0
            ? (numericValues[numericValues.length / 2 - 1] + numericValues[numericValues.length / 2]) / 2
            : numericValues[Math.floor(numericValues.length / 2)]
      }

      columnStats.push(colStats)
    })

    return columnStats
  }, [data, columns])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
          <CardDescription>
            {data.length} rows, {columns.length} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Rows" value={data.length} />
            <StatBox label="Total Columns" value={columns.length} />
            <StatBox label="Numeric Columns" value={stats.filter((s) => s.type === "number").length} />
            <StatBox label="Text Columns" value={stats.filter((s) => s.type === "string").length} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Column Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((col) => (
              <div key={col.name} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{col.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Type: {col.type}</div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{col.uniqueCount} unique</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-muted-foreground">Non-null</div>
                    <div className="font-mono font-semibold">{col.count - col.nullCount}</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-muted-foreground">Null</div>
                    <div className="font-mono font-semibold">{col.nullCount}</div>
                  </div>
                  {col.min !== undefined && (
                    <div className="p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Min</div>
                      <div className="font-mono font-semibold">{col.min.toFixed(2)}</div>
                    </div>
                  )}
                  {col.max !== undefined && (
                    <div className="p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Max</div>
                      <div className="font-mono font-semibold">{col.max.toFixed(2)}</div>
                    </div>
                  )}
                </div>

                {col.avg !== undefined && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-mono font-semibold">{col.avg.toFixed(2)}</div>
                    </div>
                    {col.median !== undefined && (
                      <div className="p-2 bg-muted rounded">
                        <div className="text-muted-foreground">Median</div>
                        <div className="font-mono font-semibold">{col.median.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-muted rounded-lg text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
