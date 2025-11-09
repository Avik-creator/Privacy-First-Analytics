"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataQualityProps {
  data: Record<string, unknown>[]
  columns: string[]
}

interface QualityMetric {
  name: string
  completeness: number
  uniqueness: number
  consistency: string
}

export function DataQuality({ data, columns }: DataQualityProps) {
  const metrics = useMemo(() => {
    const qualityMetrics: QualityMetric[] = []

    columns.forEach((col) => {
      const values = data.map((row) => row[col])
      const nonNullValues = values.filter((v) => v !== null && v !== undefined)
      const completeness = (nonNullValues.length / values.length) * 100
      const uniqueCount = new Set(nonNullValues).size
      const uniqueness = (uniqueCount / values.length) * 100

      let consistency = "Good"
      if (completeness < 50) consistency = "Poor"
      else if (completeness < 80) consistency = "Fair"

      qualityMetrics.push({
        name: col,
        completeness,
        uniqueness,
        consistency,
      })
    })

    return qualityMetrics
  }, [data, columns])

  const overallQuality = useMemo(() => {
    const avgCompleteness = metrics.reduce((sum, m) => sum + m.completeness, 0) / metrics.length
    return avgCompleteness > 95 ? "Excellent" : avgCompleteness > 80 ? "Good" : "Needs Attention"
  }, [metrics])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-linear-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Overall Quality</div>
              <div
                className={`text-lg font-bold ${overallQuality === "Excellent"
                  ? "text-chart-1"
                  : overallQuality === "Good"
                    ? "text-chart-2"
                    : "text-destructive"
                  }`}
              >
                {overallQuality}
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-chart-1 to-chart-2"
                style={{
                  width: `${Math.min(100, (metrics.reduce((sum, m) => sum + m.completeness, 0) / metrics.length) * 1.2)}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Column Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.name} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{metric.name}</div>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${metric.consistency === "Good"
                        ? "bg-chart-1/20 text-chart-1"
                        : metric.consistency === "Fair"
                          ? "bg-chart-2/20 text-chart-2"
                          : "bg-destructive/20 text-destructive"
                        }`}
                    >
                      {metric.consistency}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Completeness</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-1" style={{ width: `${metric.completeness}%` }} />
                    </div>
                    <div className="mt-1 text-muted-foreground">{metric.completeness.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Uniqueness</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-chart-2" style={{ width: `${Math.min(100, metric.uniqueness)}%` }} />
                    </div>
                    <div className="mt-1 text-muted-foreground">{metric.uniqueness.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
