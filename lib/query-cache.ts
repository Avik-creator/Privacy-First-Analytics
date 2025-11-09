"use client"

import type { QueryResults, CachedQuery } from "./types"

export interface CacheEntry {
  query: string
  results: QueryResults
  timestamp: number
  executionTime: number
}

class QueryCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly maxSize = 50
  private readonly maxAge = 5 * 60 * 1000 // 5 minutes

  set(query: string, results: QueryResults, executionTime: number): void {
    // Clean old entries
    this.cleanup()

    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    const key = this.hashQuery(query)
    this.cache.set(key, {
      query,
      results,
      timestamp: Date.now(),
      executionTime,
    })
  }

  get(query: string): CacheEntry | null {
    const key = this.hashQuery(query)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  clear(): void {
    this.cache.clear()
  }

  getStats(): { size: number; queries: string[] } {
    return {
      size: this.cache.size,
      queries: Array.from(this.cache.values()).map((e) => e.query),
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key)
      }
    }
  }

  private hashQuery(query: string): string {
    return btoa(query.toLowerCase().trim())
  }
}

export const queryCache = new QueryCache()
