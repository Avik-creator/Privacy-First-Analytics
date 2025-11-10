import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AnalyticsStore, QueryResults, TableSchemas } from "./types"

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      // Initial state
      history: [],
      tables: [],
      selectedTable: null,
      tableSchemas: {},
      queryResults: null,
      queryStats: { total: 0, cached: 0, avgTime: 0, successful: 0, failed: 0 },
      isLoading: false,
      activeTab: "query",
      commandPaletteOpen: false,
      aiSettings: {
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        enabled: false
      },

      // Actions
      addQuery: (query: string) =>
        set((state) => ({
          history: [...state.history, { query, timestamp: Date.now() }].slice(-50),
        })),

      clearHistory: () => set({ history: [] }),

      setTables: (tables: string[]) => set({ tables }),

      setSelectedTable: (table: string | null) => set({ selectedTable: table }),

      setTableSchemas: (schemas: TableSchemas) => set({ tableSchemas: schemas }),

      setQueryResults: (results: QueryResults | null) => set({ queryResults: results }),

      incrementQueryStats: (cached = false, time = 0, success = true) =>
        set((state) => {
          const newTotal = state.queryStats.total + 1
          const newCached = cached ? state.queryStats.cached + 1 : state.queryStats.cached
          const newSuccessful = success ? state.queryStats.successful + 1 : state.queryStats.successful
          const newFailed = !success ? state.queryStats.failed + 1 : state.queryStats.failed
          const newAvgTime =
            (state.queryStats.avgTime * state.queryStats.total + time) / newTotal

          return {
            queryStats: {
              total: newTotal,
              cached: newCached,
              avgTime: newAvgTime,
              successful: newSuccessful,
              failed: newFailed,
            },
          }
        }),

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      setActiveTab: (tab: string) => set({ activeTab: tab }),

      setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

      setAISettings: (settings) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, ...settings },
        })),
    }),
    {
      name: "analytics-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        queryStats: state.queryStats,
        aiSettings: state.aiSettings,
      }),
    }
  )
)

