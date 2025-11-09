"use client"

import type { ErrorContext as ErrorContextType } from "./types"

export interface ErrorContext {
  message: string
  code?: string
  context?: string
  recoverable?: boolean
}

export class QueryError extends Error {
  code: string
  recoverable: boolean
  context: string

  constructor(message: string, code = "UNKNOWN_ERROR", recoverable = false, context = "") {
    super(message)
    this.code = code
    this.recoverable = recoverable
    this.context = context
    this.name = "QueryError"
  }
}

export function handleError(error: unknown): ErrorContext {
  if (error instanceof QueryError) {
    return {
      message: error.message,
      code: error.code,
      context: error.context,
      recoverable: error.recoverable,
    }
  }

  if (error instanceof Error) {
    const message = error.message || "An unknown error occurred"

    if (message.includes("CSV") || message.includes("parse")) {
      return {
        message: "Failed to parse CSV file. Please check the file format.",
        code: "PARSE_ERROR",
        context: "file_upload",
        recoverable: true,
      }
    }

    if (message.includes("query") || message.includes("SQL")) {
      return {
        message: "Query execution failed. Please check your SQL syntax.",
        code: "QUERY_ERROR",
        context: "query_execution",
        recoverable: true,
      }
    }

    return {
      message,
      code: "ERROR",
      recoverable: false,
    }
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN",
    recoverable: false,
  }
}

export async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)))
      }
    }
  }

  throw lastError || new Error("Operation failed after retries")
}
