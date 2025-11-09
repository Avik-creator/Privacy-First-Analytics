"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdvancedChartProps {
  data: any[]
  columns: string[]
  chartType: "area" | "stacked-bar" | "multi-line" | "radar" | "combo"
  numericColumns: string[]
  categoricalColumns: string[]
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

export function AdvancedChart({ data, columns, chartType, numericColumns, categoricalColumns }: AdvancedChartProps) {
  const chartData = useMemo(() => {
    if (chartType === "radar" && numericColumns.length >= 3) {
      return data.slice(0, 12).map((row, idx) => {
        const dataPoint: any = { name: `${categoricalColumns[0] ? String(row[categoricalColumns[0]]) : `Item ${idx}`}` }
        numericColumns.slice(0, 5).forEach((col) => {
          dataPoint[col] = row[col] || 0
        })
        return dataPoint
      })
    }

    if (chartType === "stacked-bar" && categoricalColumns.length > 0 && numericColumns.length >= 2) {
      const grouped: Record<string, any> = {}
      data.forEach((row) => {
        const key = String(row[categoricalColumns[0]])
        if (!grouped[key]) grouped[key] = { name: key }
        numericColumns.slice(0, 3).forEach((col) => {
          grouped[key][col] = (grouped[key][col] || 0) + (row[col] || 0)
        })
      })
      return Object.values(grouped)
    }

    if (chartType === "area" && numericColumns.length > 0) {
      return data.slice(0, 20).map((row, idx) => ({
        name: categoricalColumns[0] ? String(row[categoricalColumns[0]]) : `Item ${idx}`,
        value: row[numericColumns[0]] || 0,
        value2: numericColumns[1] ? row[numericColumns[1]] : 0,
      }))
    }

    if (chartType === "multi-line" && numericColumns.length >= 2) {
      return data.slice(0, 15).map((row, idx) => {
        const dataPoint: any = {
          name: categoricalColumns[0] ? String(row[categoricalColumns[0]]) : `Item ${idx}`,
        }
        numericColumns.slice(0, 3).forEach((col) => {
          dataPoint[col] = row[col] || 0
        })
        return dataPoint
      })
    }

    return data.slice(0, 12)
  }, [data, chartType, numericColumns, categoricalColumns])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Insufficient data for this chart type
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{chartType.replace("-", " ")} Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-1)"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          ) : chartType === "stacked-bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Legend />
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Bar key={col} dataKey={col} stackId="a" fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
            </BarChart>
          ) : chartType === "multi-line" ? (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Legend />
              {numericColumns.slice(0, 3).map((col, idx) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          ) : chartType === "radar" ? (
            <RadarChart data={chartData} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 11 }} />
              <Radar
                name={numericColumns[0]}
                dataKey={numericColumns[0]}
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.6}
              />
              {numericColumns[1] && (
                <Radar
                  name={numericColumns[1]}
                  dataKey={numericColumns[1]}
                  stroke="var(--color-chart-2)"
                  fill="var(--color-chart-2)"
                  fillOpacity={0.3}
                />
              )}
              <Legend />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
            </RadarChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Legend />
              {numericColumns.slice(0, 2).map((col, idx) => (
                <Bar key={col} dataKey={col} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
              ))}
              {numericColumns.slice(2, 3).map((col, idx) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={CHART_COLORS[(idx + 2) % CHART_COLORS.length]}
                  yAxisId="right"
                  strokeWidth={2}
                />
              ))}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
