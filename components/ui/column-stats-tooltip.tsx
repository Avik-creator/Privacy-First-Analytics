"use client"

import { useMemo } from "react"
import { TrendingUp, Hash, Calendar, Type } from "lucide-react"

interface ColumnStatsTooltipProps {
  columnName: string
  data: Record<string, unknown>[]
  position: { x: number; y: number }
}

export function ColumnStatsTooltip({ columnName, data, position }: ColumnStatsTooltipProps) {
  const stats = useMemo(() => {
    const values = data.map((row) => row[columnName])
    const nonNullValues = values.filter((v) => v !== null && v !== undefined)
    
    const totalCount = values.length
    const nullCount = totalCount - nonNullValues.length
    const uniqueCount = new Set(nonNullValues.map(v => String(v))).size
    
    // Detect type
    const hasNumbers = nonNullValues.some((v) => typeof v === "number")
    const hasStrings = nonNullValues.some((v) => typeof v === "string")
    const hasBooleans = nonNullValues.some((v) => typeof v === "boolean")
    
    let dataType = "Mixed"
    if (hasNumbers && !hasStrings && !hasBooleans) dataType = "Numeric"
    else if (hasStrings && !hasNumbers && !hasBooleans) dataType = "Text"
    else if (hasBooleans && !hasNumbers && !hasStrings) dataType = "Boolean"
    
    // Calculate numeric stats if applicable
    let min: number | null = null
    let max: number | null = null
    let avg: number | null = null
    let median: number | null = null
    
    if (dataType === "Numeric") {
      const numericValues = nonNullValues.filter((v) => typeof v === "number") as number[]
      if (numericValues.length > 0) {
        min = Math.min(...numericValues)
        max = Math.max(...numericValues)
        avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        
        const sorted = [...numericValues].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        median = sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid]
      }
    }
    
    // Calculate text stats if applicable
    let minLength: number | null = null
    let maxLength: number | null = null
    let avgLength: number | null = null
    
    if (dataType === "Text") {
      const stringValues = nonNullValues.filter((v) => typeof v === "string") as string[]
      if (stringValues.length > 0) {
        const lengths = stringValues.map((s) => s.length)
        minLength = Math.min(...lengths)
        maxLength = Math.max(...lengths)
        avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
      }
    }
    
    return {
      totalCount,
      nullCount,
      nonNullCount: nonNullValues.length,
      uniqueCount,
      dataType,
      min,
      max,
      avg,
      median,
      minLength,
      maxLength,
      avgLength,
      completeness: ((nonNullValues.length / totalCount) * 100).toFixed(1),
      uniqueness: ((uniqueCount / totalCount) * 100).toFixed(1),
    }
  }, [columnName, data])

  return (
    <div
      className="fixed z-50 w-64 bg-card border border-border rounded-lg shadow-2xl p-3 text-sm animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateY(-100%) translateY(-8px)",
      }}
    >
      <div className="font-semibold mb-2 flex items-center gap-2">
        <Type className="w-4 h-4 text-primary" />
        {columnName}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-mono font-medium">{stats.dataType}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Rows:</span>
          <span className="font-medium">{stats.totalCount.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Non-Null:</span>
          <span className="font-medium">
            {stats.nonNullCount.toLocaleString()}
            <span className="text-muted-foreground ml-1">({stats.completeness}%)</span>
          </span>
        </div>
        
        {stats.nullCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Null Values:</span>
            <span className="text-destructive font-medium">{stats.nullCount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Unique:</span>
          <span className="font-medium">
            {stats.uniqueCount.toLocaleString()}
            <span className="text-muted-foreground ml-1">({stats.uniqueness}%)</span>
          </span>
        </div>
        
        {stats.dataType === "Numeric" && stats.min !== null && (
          <>
            <div className="border-t border-border pt-2 mt-2" />
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-3 h-3 text-chart-1" />
              <span className="font-semibold">Numeric Stats</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Min:</span>
              <span className="font-mono">{stats.min.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Max:</span>
              <span className="font-mono">{stats.max?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-mono">{stats.avg?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Median:</span>
              <span className="font-mono">{stats.median?.toFixed(2)}</span>
            </div>
          </>
        )}
        
        {stats.dataType === "Text" && stats.minLength !== null && (
          <>
            <div className="border-t border-border pt-2 mt-2" />
            <div className="flex items-center gap-2 text-xs">
              <Hash className="w-3 h-3 text-chart-2" />
              <span className="font-semibold">Text Stats</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Min Length:</span>
              <span className="font-mono">{stats.minLength}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Max Length:</span>
              <span className="font-mono">{stats.maxLength}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avg Length:</span>
              <span className="font-mono">{stats.avgLength?.toFixed(1)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

