"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, Save } from "lucide-react"

interface SavedQuery {
  id: string
  name: string
  query: string
  timestamp: number
}

interface SavedQueriesProps {
  onLoadQuery: (query: string) => void
}

export function SavedQueries({ onLoadQuery }: SavedQueriesProps) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [queryName, setQueryName] = useState("")
  const [currentQuery, setCurrentQuery] = useState("")

  const saveQuery = () => {
    if (!queryName.trim() || !currentQuery.trim()) return

    const newQuery: SavedQuery = {
      id: Math.random().toString(36).substring(7),
      name: queryName,
      query: currentQuery,
      timestamp: Date.now(),
    }

    setSavedQueries([...savedQueries, newQuery])
    setQueryName("")
    setCurrentQuery("")
    setShowDialog(false)
  }

  const deleteQuery = (id: string) => {
    setSavedQueries(savedQueries.filter((q) => q.id !== id))
  }

  const copyToClipboard = (query: string) => {
    navigator.clipboard.writeText(query)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Saved Queries</CardTitle>
            <CardDescription>{savedQueries.length} saved</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowDialog(!showDialog)}>
            <Save className="w-4 h-4 mr-2" />
            Save Query
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showDialog && (
          <div className="space-y-2 p-3 border border-border rounded-lg bg-muted/50">
            <input
              type="text"
              placeholder="Query name"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
            />
            <textarea
              placeholder="Paste your query here"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded bg-background text-sm font-mono h-24 resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={saveQuery}
                disabled={!queryName.trim() || !currentQuery.trim()}
                className="flex-1"
              >
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {savedQueries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No saved queries yet</p>
        ) : (
          <div className="space-y-2">
            {savedQueries.map((q) => (
              <div key={q.id} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm">{q.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(q.timestamp).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => deleteQuery(q.id)} className="p-1 hover:bg-destructive/10 rounded transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs font-mono text-muted-foreground truncate bg-muted p-2 rounded">{q.query}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onLoadQuery(q.query)} className="flex-1">
                    Load
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(q.query)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
