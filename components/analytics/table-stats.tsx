"use client"

import { useMemo } from "react"

interface TableStatsProps {
  tableName: string
  columns: Array<{ name: string; type: string }>
}

export function TableStats({ tableName, columns }: TableStatsProps) {
  const stats = useMemo(() => {
    const numericColumns = columns.filter((col) => col.type.includes("INT") || col.type.includes("DOUBLE"))
    const stringColumns = columns.filter((col) => col.type.includes("VARCHAR"))

    return {
      totalColumns: columns.length,
      numericColumns: numericColumns.length,
      stringColumns: stringColumns.length,
    }
  }, [columns])

  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="p-2 bg-muted rounded text-center">
        <div className="font-mono text-xs font-semibold">{stats.totalColumns}</div>
        <div className="text-muted-foreground text-xs mt-0.5">Columns</div>
      </div>
      <div className="p-2 bg-muted rounded text-center">
        <div className="font-mono text-xs font-semibold">{stats.numericColumns}</div>
        <div className="text-muted-foreground text-xs mt-0.5">Numeric</div>
      </div>
      <div className="p-2 bg-muted rounded text-center">
        <div className="font-mono text-xs font-semibold">{stats.stringColumns}</div>
        <div className="text-muted-foreground text-xs mt-0.5">Text</div>
      </div>
    </div>
  )
}
