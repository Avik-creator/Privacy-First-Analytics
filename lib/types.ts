// Query and History Types
export interface QueryHistory {
  query: string
  timestamp: number
}

// Query Results Types
export interface QueryColumn {
  name: string
  type: string
}

export interface QueryResults {
  rows: Record<string, unknown>[]
  columns: string[]
  rowCount: number
  executionTime?: number
}

// Table Schema Types
export interface TableColumn {
  name: string
  type: string
  nullable?: boolean
}

export type TableSchemas = Record<string, TableColumn[]>

// Query Stats Types
export interface QueryStats {
  total: number
  cached: number
  avgTime: number
  successful: number
  failed: number
}

// Cache Types
export interface CachedQuery {
  results: QueryResults
  timestamp: number
  executionTime: number
}

// Error Types
export interface ErrorContext {
  message: string
  code?: string
  severity: "error" | "warning" | "info"
  suggestion?: string
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// AI Provider Types
export type AIProvider = 'groq' | 'ollama'

export interface AISettings {
  provider: AIProvider
  model: string
  enabled: boolean
}

// Analytics Store Types
export interface AnalyticsState {
  history: QueryHistory[]
  tables: string[]
  selectedTable: string | null
  tableSchemas: TableSchemas
  queryResults: QueryResults | null
  queryStats: QueryStats
  isLoading: boolean
  activeTab: string
  commandPaletteOpen: boolean
  aiSettings: AISettings
}

export interface AnalyticsActions {
  addQuery: (query: string) => void
  clearHistory: () => void
  setTables: (tables: string[]) => void
  setSelectedTable: (table: string | null) => void
  setTableSchemas: (schemas: TableSchemas) => void
  setQueryResults: (results: QueryResults | null) => void
  incrementQueryStats: (cached?: boolean, time?: number, success?: boolean) => void
  setIsLoading: (loading: boolean) => void
  setActiveTab: (tab: string) => void
  setCommandPaletteOpen: (open: boolean) => void
  setAISettings: (settings: Partial<AISettings>) => void
}

export type AnalyticsStore = AnalyticsState & AnalyticsActions

// File Upload Types
export interface FileUploadResult {
  tableName: string
  rowCount: number
  columns: string[]
}

// Template Types
export interface QueryTemplate {
  title: string
  description: string
  query: string
  category?: "basic" | "aggregation" | "analysis" | "utility"
}

