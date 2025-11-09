"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { initDuckDB, uploadCSV, getTableSchema } from "@/lib/duckdb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Download } from "lucide-react"

interface FileUploadProps {
  onTablesChanged: (tables: string[]) => void
  onTableSchemas: (schemas: Record<string, any[]>) => void
  existingSchemas: Record<string, any[]>
}

export function FileUpload({ onTablesChanged, onTableSchemas, existingSchemas }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setIsLoading(true)
      setError(null)
      try {
        await initDuckDB()
        const tableName = await uploadCSV(file)
        const schema = await getTableSchema(tableName)

        const newTables = [...uploadedFiles, tableName]
        setUploadedFiles(newTables)
        onTablesChanged(newTables)
        onTableSchemas({
          ...existingSchemas,
          [tableName]: schema,
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        setError("Failed to upload CSV file")
      } finally {
        setIsLoading(false)
      }
    },
    [uploadedFiles, onTablesChanged, onTableSchemas, existingSchemas],
  )

  const handleLoadSample = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await initDuckDB()
      const sampleCSV =
        "name,sales,region\nAlice,5000,North\nBob,7500,South\nCharlie,6000,East\nDiana,8500,West\nEve,5500,North"
      const blob = new Blob([sampleCSV], { type: "text/csv" })
      const file = new File([blob], "sample_data.csv", { type: "text/csv" })

      const tableName = await uploadCSV(file)
      const schema = await getTableSchema(tableName)

      const newTables = [...uploadedFiles, tableName]
      setUploadedFiles(newTables)
      onTablesChanged(newTables)
      onTableSchemas({
        ...existingSchemas,
        [tableName]: schema,
      })
    } catch (error) {
      console.error("Error loading sample:", error)
      setError("Failed to load sample data")
    } finally {
      setIsLoading(false)
    }
  }, [uploadedFiles, onTablesChanged, onTableSchemas, existingSchemas])

  const handleDeleteTable = useCallback(
    (tableName: string) => {
      const newTables = uploadedFiles.filter((t) => t !== tableName)
      setUploadedFiles(newTables)
      onTablesChanged(newTables)

      const newSchemas = { ...existingSchemas }
      delete newSchemas[tableName]
      onTableSchemas(newSchemas)
    },
    [uploadedFiles, onTablesChanged, onTableSchemas, existingSchemas],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Data</CardTitle>
        <CardDescription>Import CSV files to query</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition">
          <span className="text-sm text-muted-foreground text-center">
            {isLoading ? "📤 Uploading..." : "📁 Click or drag CSV"}
          </span>
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isLoading} className="hidden" />
        </label>

        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive text-destructive text-xs rounded">
            {error}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadSample}
          disabled={isLoading}
          className="w-full bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Loaded Tables:</p>
            <div className="space-y-1">
              {uploadedFiles.map((file) => (
                <div key={file} className="text-xs p-2 bg-accent rounded flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span>✓</span>
                    <span className="font-mono truncate">{file}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTable(file)}
                    className="p-1 hover:bg-destructive/20 rounded transition"
                    title="Delete table"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
