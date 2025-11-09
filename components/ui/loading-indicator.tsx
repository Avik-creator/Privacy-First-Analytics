"use client"

import { Card, CardContent } from "@/components/ui/card"

interface LoadingIndicatorProps {
  isLoading: boolean
  message?: string
  progress?: number
}

export function LoadingIndicator({ isLoading, message = "Processing...", progress }: LoadingIndicatorProps) {
  if (!isLoading) return null

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-medium">{message}</span>
          </div>
          {progress !== undefined && (
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
