"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QueryHistoryProps {
  history: Array<{ query: string; timestamp: number }>
  onSelectQuery: (query: string) => void
}

export function QueryHistory({ history, onSelectQuery }: QueryHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Query History</CardTitle>
        <CardDescription>{history.length} queries</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No query history yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...history].reverse().map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectQuery(item.query)}
                className="w-full text-left p-2 text-xs bg-accent rounded hover:bg-accent/80 transition font-mono truncate"
                title={item.query}
              >
                <div className="truncate">{item.query}</div>
                <div className="text-muted-foreground text-xs mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
