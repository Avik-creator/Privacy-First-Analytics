"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { queryCache } from "@/lib/query-cache"

interface PerformanceMetrics {
  cacheSize: number
  memoryUsage?: number
  activeQueries: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheSize: 0,
    activeQueries: 0,
  })

  useEffect(() => {
    const updateMetrics = () => {
      const stats = queryCache.getStats()
      setMetrics({
        cacheSize: stats.size,
        activeQueries: 0,
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
          <span className="text-muted-foreground">Cached Queries</span>
          <span className="font-mono font-semibold">{metrics.cacheSize}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
          <span className="text-muted-foreground">Cache Status</span>
          <span className="text-chart-1 font-semibold">Active</span>
        </div>
      </CardContent>
    </Card>
  )
}
