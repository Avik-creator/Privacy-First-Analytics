"use client"
import { useState } from "react"
import { QueryEditor } from "@/components/analytics/query-editor"
import { QueryResults } from "@/components/analytics/query-results"
import { QueryBuilder } from "@/components/analytics/query-builder"
import { SavedQueries } from "@/components/analytics/saved-queries"
import { AIAssistant } from "@/components/analytics/ai-assistant"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalyticsStore } from "@/lib/store"
import type { QueryResults as QueryResultsType, QueryHistory, TableSchemas } from "@/lib/types"

interface MainContentProps {
  tables: string[]
  selectedTable: string | null
  tableSchemas: TableSchemas
  queryResults: QueryResultsType | null
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onResults: (results: QueryResultsType | null) => void
  onQuery: (query: string, cached?: boolean, time?: number, success?: boolean) => void
  history: QueryHistory[]
}

export function MainContent({
  tables,
  selectedTable,
  tableSchemas,
  queryResults,
  isLoading,
  setIsLoading,
  onResults,
  onQuery,
  history,
}: MainContentProps) {
  const [currentQuery, setCurrentQuery] = useState("")
  const { activeTab, setActiveTab } = useAnalyticsStore()

  const handleBuildQuery = (query: string) => {
    setCurrentQuery(query)
    const editor = document.getElementById("query-editor") as HTMLTextAreaElement
    if (editor) editor.value = query
    setActiveTab("query")
  }

  const handleLoadSavedQuery = (query: string) => {
    const editor = document.getElementById("query-editor") as HTMLTextAreaElement
    if (editor) editor.value = query
    setActiveTab("query")
  }

  const handleAIQueryGenerated = (query: string) => {
    setCurrentQuery(query)
    const editor = document.getElementById("query-editor") as HTMLTextAreaElement
    if (editor) editor.value = query
    setActiveTab("query")
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="query">Query</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-4">
          <QueryEditor
            tables={tables}
            selectedTable={selectedTable}
            tableSchemas={tableSchemas}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onResults={onResults}
            onQuery={onQuery}
            history={history}
            initialQuery={currentQuery}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="h-[600px]">
            <AIAssistant onQueryGenerated={handleAIQueryGenerated} />
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <QueryBuilder
            tables={tables}
            tableSchemas={tableSchemas}
            selectedTable={selectedTable}
            onBuildQuery={handleBuildQuery}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <SavedQueries onLoadQuery={handleLoadSavedQuery} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {queryResults ? (
            <QueryResults results={queryResults} />
          ) : (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              Run a query to see results
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {!selectedTable ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
              <p className="text-lg font-semibold mb-2">No Table Selected</p>
              <p className="text-sm">Upload a CSV file and select a table to use query templates</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Query Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Click any template to load it into the query editor
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TemplateCard
                  title="🔍 Preview Data"
                  description="View first 10 records"
                  query={`SELECT * FROM ${selectedTable} LIMIT 10;`}
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="📊 Count All Records"
                  description="Get total row count"
                  query={`SELECT COUNT(*) as total_records FROM ${selectedTable};`}
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="✨ Distinct Values"
                  description="Unique values in first column"
                  query={
                    tableSchemas[selectedTable] && tableSchemas[selectedTable][0]
                      ? `SELECT DISTINCT ${tableSchemas[selectedTable][0].name} FROM ${selectedTable} LIMIT 50;`
                      : `SELECT * FROM ${selectedTable} LIMIT 10;`
                  }
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="🔢 Column Summary"
                  description="Aggregate statistics"
                  query={`SELECT 
  COUNT(*) as total_rows,
  COUNT(DISTINCT *) as unique_rows
FROM ${selectedTable};`}
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="📈 Order by First Column"
                  description="Sort results ascending"
                  query={
                    tableSchemas[selectedTable] && tableSchemas[selectedTable][0]
                      ? `SELECT * FROM ${selectedTable} 
ORDER BY ${tableSchemas[selectedTable][0].name} ASC 
LIMIT 100;`
                      : `SELECT * FROM ${selectedTable} LIMIT 100;`
                  }
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="🔍 Search & Filter"
                  description="Find specific records"
                  query={
                    tableSchemas[selectedTable] && tableSchemas[selectedTable][0]
                      ? `SELECT * FROM ${selectedTable} 
WHERE ${tableSchemas[selectedTable][0].name} IS NOT NULL 
LIMIT 50;`
                      : `SELECT * FROM ${selectedTable} LIMIT 50;`
                  }
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="📋 Column Names"
                  description="Show all column names"
                  query={`SELECT * FROM ${selectedTable} LIMIT 1;`}
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="🎲 Random Sample"
                  description="Get random 100 rows"
                  query={`SELECT * FROM ${selectedTable} 
USING SAMPLE 100;`}
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
                <TemplateCard
                  title="📊 Group & Count"
                  description="Group by first column"
                  query={
                    tableSchemas[selectedTable] && tableSchemas[selectedTable][0]
                      ? `SELECT 
  ${tableSchemas[selectedTable][0].name}, 
  COUNT(*) as count 
FROM ${selectedTable} 
GROUP BY ${tableSchemas[selectedTable][0].name} 
ORDER BY count DESC 
LIMIT 20;`
                      : `SELECT * FROM ${selectedTable} LIMIT 20;`
                  }
                  onUse={(q) => handleLoadSavedQuery(q)}
                  disabled={false}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TemplateCard({
  title,
  description,
  query,
  onUse,
  disabled,
}: {
  title: string
  description: string
  query: string
  onUse: (query: string) => void
  disabled: boolean
}) {
  return (
    <button
      onClick={() => onUse(query)}
      disabled={disabled}
      className="group p-4 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
    >
      <div className="font-semibold mb-1 group-hover:text-primary transition-colors">{title}</div>
      <div className="text-xs text-muted-foreground mb-2">{description}</div>
      {query && (
        <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded border border-border overflow-x-auto max-h-20 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words">{query}</pre>
        </div>
      )}
    </button>
  )
}
