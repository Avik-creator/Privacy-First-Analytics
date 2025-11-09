"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TableSchemasProps {
  tableName: string
  columns: Array<{ name: string; type: string }>
  compact?: boolean
}

export function TableSchemas({ tableName, columns, compact = false }: TableSchemasProps) {
  if (compact) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Schema</p>
        {columns.slice(0, 5).map((col) => (
          <div key={col.name} className="flex items-center justify-between text-xs p-1.5 bg-muted/50 rounded">
            <span className="font-mono truncate">{col.name}</span>
            <span className="text-muted-foreground text-xs ml-2 whitespace-nowrap">{col.type}</span>
          </div>
        ))}
        {columns.length > 5 && (
          <div className="text-xs text-muted-foreground text-center py-1">+{columns.length - 5} more columns</div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schema</CardTitle>
        <CardDescription>{tableName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {columns.map((col) => (
            <div key={col.name} className="flex items-center justify-between text-xs p-2 bg-muted rounded">
              <span className="font-mono font-semibold">{col.name}</span>
              <span className="text-muted-foreground">{col.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
