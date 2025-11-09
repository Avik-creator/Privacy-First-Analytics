"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChartCustomizerProps {
  numericColumns: string[]
  categoricalColumns: string[]
  onCustomize: (config: ChartConfig) => void
}

export interface ChartConfig {
  chartType: "area" | "stacked-bar" | "multi-line" | "radar" | "combo"
  title?: string
  xAxis?: string
  yAxis?: string[]
}

export function ChartCustomizer({ numericColumns, categoricalColumns, onCustomize }: ChartCustomizerProps) {
  const [config, setConfig] = useState<ChartConfig>({
    chartType: "area",
    title: "Data Visualization",
    xAxis: categoricalColumns[0],
    yAxis: numericColumns.slice(0, 2),
  })

  const handleApply = () => {
    onCustomize(config)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Chart Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Chart Type</label>
          <select
            value={config.chartType}
            onChange={(e) => setConfig({ ...config, chartType: e.target.value as ChartConfig["chartType"] })}
            className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
          >
            <option value="area">Area Chart</option>
            <option value="stacked-bar">Stacked Bar</option>
            <option value="multi-line">Multi-Line</option>
            <option value="radar">Radar Chart</option>
            <option value="combo">Combination Chart</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Chart Title</label>
          <input
            type="text"
            value={config.title || ""}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            placeholder="Enter chart title"
            className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">X-Axis (Category)</label>
          <select
            value={config.xAxis || ""}
            onChange={(e) => setConfig({ ...config, xAxis: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded bg-background text-sm"
          >
            <option value="">Auto</option>
            {categoricalColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Y-Axis Values</label>
          <div className="grid grid-cols-2 gap-2">
            {numericColumns.map((col) => (
              <button
                key={col}
                onClick={() => {
                  const yAxis = config.yAxis || []
                  setConfig({
                    ...config,
                    yAxis: yAxis.includes(col) ? yAxis.filter((y) => y !== col) : [...yAxis, col],
                  })
                }}
                className={`p-2 text-xs text-left rounded border transition ${config.yAxis?.includes(col)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                  }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply Settings
        </Button>
      </CardContent>
    </Card>
  )
}
