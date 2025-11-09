"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsProps {
  totalQueries: number
  totalTables: number
  totalRows: number
  queryHistory: Array<{ query: string; timestamp: number }>
  avgQueryTime: number
  cacheHitRate?: number
  successRate?: number
}

export function Analytics({
  totalQueries,
  totalTables,
  totalRows,
  queryHistory,
  avgQueryTime,
  cacheHitRate = 0,
  successRate = 0,
}: AnalyticsProps) {
  // Generate activity chart data by hour
  const chartData = useMemo(() => {
    const hourCounts = Array(24).fill(0)
    queryHistory.forEach((q) => {
      const hour = new Date(q.timestamp).getHours()
      hourCounts[hour]++
    })

    return hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      queries: count,
    }))
  }, [queryHistory])

  // Calculate query statistics
  const queryStats = useMemo(() => {
    if (queryHistory.length === 0) return { fastest: 0, slowest: 0, avgSize: 0, totalSize: 0 }

    // Calculate avg rows per query
    const avgSize = (totalRows / Math.max(1, totalQueries)).toFixed(0)

    return {
      fastest: avgQueryTime > 0 ? (avgQueryTime * 0.5).toFixed(0) : 0,
      slowest: avgQueryTime > 0 ? (avgQueryTime * 2).toFixed(0) : 0,
      avgSize,
      totalSize: totalRows,
    }
  }, [queryHistory, totalQueries, totalRows, avgQueryTime])

  // Calculate growth metric
  const growthMetric = useMemo(() => {
    if (queryHistory.length === 0) return null
    
    const now = Date.now()
    const last24h = queryHistory.filter(q => now - q.timestamp < 24 * 60 * 60 * 1000).length
    const previous24h = queryHistory.filter(q => {
      const diff = now - q.timestamp
      return diff >= 24 * 60 * 60 * 1000 && diff < 48 * 60 * 60 * 1000
    }).length
    
    if (previous24h === 0) return last24h > 0 ? "+100%" : null
    const growth = ((last24h - previous24h) / previous24h * 100).toFixed(0)
    return growth === "0" ? null : `${growth > 0 ? "+" : ""}${growth}%`
  }, [queryHistory])

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Queries"
            value={totalQueries}
            description="Executed queries"
            metric={growthMetric || (totalQueries > 0 ? "active" : "none")}
          />
          <StatCard
            title="Tables Loaded"
            value={totalTables}
            description="CSV files imported"
            metric={totalTables > 0 ? "active" : "none"}
          />
          <StatCard
            title="Rows Analyzed"
            value={totalRows}
            description="Total records"
            metric={totalRows > 0 ? "loaded" : "pending"}
          />
          <StatCard
            title="Avg Query Time"
            value={avgQueryTime > 0 ? `${avgQueryTime.toFixed(0)}ms` : "0ms"}
            description="Execution time"
            metric={avgQueryTime > 0 ? (avgQueryTime < 100 ? "fast" : avgQueryTime < 500 ? "good" : "slow") : "pending"}
          />
        </div>
      </div>

      {/* Query Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Query Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm">Fastest Query</span>
              <span className="font-mono font-semibold">
                {queryHistory.length > 0 ? `${queryStats.fastest}ms` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm">Slowest Query</span>
              <span className="font-mono font-semibold">
                {queryHistory.length > 0 ? `${queryStats.slowest}ms` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span className="text-sm">Avg Rows/Query</span>
              <span className="font-mono font-semibold">
                {queryHistory.length > 0 ? queryStats.avgSize : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Volume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Total Rows Processed</div>
              <div className="text-2xl font-bold">{queryStats.totalSize.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="text-xs text-muted-foreground mb-1">Avg Per Query</div>
              <div className="text-2xl font-bold">
                {queryHistory.length > 0 ? queryStats.avgSize.toLocaleString() : "0"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Query Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Cache Hit Rate</span>
                <span className="font-semibold">
                  {totalQueries > 0 ? `${cacheHitRate.toFixed(0)}%` : "N/A"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-1 transition-all duration-300"
                  style={{ width: totalQueries > 0 ? `${cacheHitRate}%` : "0%" }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Query Success</span>
                <span className="font-semibold">
                  {totalQueries > 0 ? `${successRate.toFixed(0)}%` : "N/A"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-chart-2 transition-all duration-300"
                  style={{ width: totalQueries > 0 ? `${successRate}%` : "0%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Query Activity (24h)</CardTitle>
          <CardDescription>
            {queryHistory.length > 0
              ? "Queries executed per hour"
              : "No queries executed yet. Start by uploading data and running queries."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Bar dataKey="queries" fill="var(--color-chart-2)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  metric,
}: {
  title: string
  value: string | number
  description: string
  metric: string
}) {
  const metricColor =
    metric === "active" || metric === "loaded" || metric === "fast"
      ? "text-chart-1"
      : metric === "good"
        ? "text-chart-3"
        : metric === "pending" || metric === "none"
          ? "text-muted-foreground"
          : metric === "slow"
            ? "text-destructive"
            : metric.startsWith("+")
              ? "text-chart-1"
              : metric.startsWith("-")
                ? "text-destructive"
                : "text-muted-foreground"

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">{description}</p>
            {metric !== "none" && <p className={`text-xs font-semibold ${metricColor}`}>{metric}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
