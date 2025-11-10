"use client"

import React, { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { useAnalyticsStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Send, Copy, Play, Loader2, Settings2, Sparkles, Trash2 } from "lucide-react"
import { DefaultChatTransport, generateId } from "ai"
import { AISettings } from "@/lib/types"

interface AIAssistantProps {
  onQueryGenerated?: (query: string) => void
  chatId?: string
  onChatIdChange?: (chatId: string) => void
}

export function AIAssistant({ onQueryGenerated, chatId: propChatId, onChatIdChange }: AIAssistantProps) {
  const [input, setInput] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [loadedMessages, setLoadedMessages] = useState<any[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isChatInitialized, setIsChatInitialized] = useState(false)
  const { aiSettings, setAISettings, tableSchemas, selectedTable } = useAnalyticsStore()

  // Use prop chatId if provided, otherwise use stored chatId, or generate a new one
  const activeChatId = propChatId || aiSettings.chatId || (() => {
    const newId = generateId()
    setAISettings({ chatId: newId })
    return newId
  })()

  // Load messages from storage when chat ID changes
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoadingMessages(true)
      setIsChatInitialized(false)
      try {
        const response = await fetch(`/api/chat/load?chatId=${activeChatId}`)
        if (response.ok) {
          const data = await response.json()
          const loadedMsgs = data.messages || []
          console.log('Loaded messages from storage:', loadedMsgs)
          setLoadedMessages(loadedMsgs)
        } else {
          setLoadedMessages([])
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
        setLoadedMessages([])
      } finally {
        setIsLoadingMessages(false)
        setIsChatInitialized(true)
      }
    }

    loadMessages()
  }, [activeChatId])

  // Notify parent of chat ID changes
  useEffect(() => {
    if (onChatIdChange && !propChatId) {
      onChatIdChange(activeChatId)
    }
  }, [activeChatId, onChatIdChange, propChatId])

  // Guard in case the store isn't ready yet
  const safeAISettings = aiSettings ?? { provider: "groq", model: "" }

  const { messages = [], sendMessage, status, setMessages } = useChat({
    id: activeChatId,
    messages: loadedMessages, // Use loaded messages as initial messages
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Send only the last message to reduce payload
      prepareSendMessagesRequest: ({ messages, id }) => {
        return {
          body: {
            message: messages[messages.length - 1],
            chatId: id,
            provider: safeAISettings.provider,
            model: safeAISettings.model,
          },
        }
      },
    }),
  })

  // Update messages when loaded from storage
  useEffect(() => {
    if (isChatInitialized && loadedMessages.length > 0) {
      console.log('Setting messages in useChat:', loadedMessages)
      setMessages(loadedMessages)
    }
  }, [isChatInitialized, loadedMessages, setMessages])

  const isLoading = status === "streaming"
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, isLoading])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !sendMessage) return

    // Add context about available tables
    let contextMessage = trimmed
    if (selectedTable && tableSchemas?.[selectedTable]) {
      const schema = tableSchemas[selectedTable]
      const schemaInfo = schema.map((col: any) => `${col.name} (${col.type})`).join(", ")
      contextMessage = `Table: ${selectedTable}\nSchema: ${schemaInfo}\n\nQuery: ${trimmed}`
    } else if (tableSchemas && Object.keys(tableSchemas).length > 0) {
      const tableList = Object.keys(tableSchemas).join(", ")
      contextMessage = `Available tables: ${tableList}\n\nQuery: ${trimmed}`
    }

    // The SDK may accept either a string or an object; keep your existing object form
    try {
      sendMessage({ text: contextMessage })
      setInput("")
    } catch (err) {
      // Prevent crash — log and keep input so user can retry
      // eslint-disable-next-line no-console
      console.error("sendMessage failed:", err)
    }
  }

  const extractSQLFromText = (text: string | undefined | null) => {
    if (!text) return null

    // 1) ```sql block
    const sqlFence = text.match(/```sql\s*([\s\S]*?)```/i)
    if (sqlFence) return sqlFence[1].trim()

    // 2) generic code fence (sometimes assistants use ``` ... ``` without sql tag)
    const genericFence = text.match(/```\s*([\s\S]*?)```/)
    if (genericFence) {
      const candidate = genericFence[1].trim()
      // Heuristic: if it contains SELECT / INSERT / UPDATE or FROM, treat as SQL
      if (/\b(select|insert|update|delete|with)\b/i.test(candidate)) return candidate
    }

    // 3) JSON tool output: "query": "...."
    const jsonQuery = text.match(/"query"\s*:\s*"([^"]+)"/i)
    if (jsonQuery) return jsonQuery[1].trim()

    // 4) Inline SQL like: SQL: SELECT ...
    const inline = text.match(/\bSQL[:\-]\s*([\s\S]+)/i)
    if (inline) {
      const remainder = inline[1].trim()
      // stop at end of sentence if present
      return remainder.split(/\n/)[0].trim()
    }

    return null
  }

  const handleCopySQL = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Clipboard write failed", err)
    }
  }

  const handleRunSQL = (sql: string) => {
    if (onQueryGenerated) onQueryGenerated(sql)
  }

  const handleNewChat = () => {
    const newChatId = generateId()
    setAISettings({ chatId: newChatId })
    setLoadedMessages([])
    setIsChatInitialized(false)
    setIsLoadingMessages(true)
    if (onChatIdChange) {
      onChatIdChange(newChatId)
    }
  }

  const handleClearChat = async () => {
    setMessages([])
    setLoadedMessages([])
    // Also clear from storage
    try {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChatId }),
      })
    } catch (error) {
      console.error('Failed to clear chat:', error)
    }
  }

  // safe renderer helpers
  const renderMessageParts = (message: any) => {
    const parts = Array.isArray(message.parts) ? message.parts : [{ type: "text", text: message.text ?? message.content ?? "" }]

    return parts.map((part: any, i: number) => {
      const key = `${message.id ?? "msg"}-${i}-${part.type ?? "p"}`

      // Normalize text content
      const textContent = part.text ?? part.content ?? (typeof part === "string" ? part : "")

      // If this is a known tool part for generateSQL (some SDKs use e.g. "tool-generateSQL")
      if (part.type === "tool-generateSQL" || part.type === "tool.generateSQL" || part.type === "generateSQL") {
        if (part.state === "output-available" && part.output) {
          const { query, explanation } = part.output as { query?: string; explanation?: string }
          if (!query) return null
          return (
            <div key={key} className="space-y-2 mt-2">
              {explanation && <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{explanation}</div>}
              <div className="relative">
                <pre className="text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-50 p-3 rounded-md overflow-x-auto">{query}</pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 px-2 bg-zinc-800 hover:bg-zinc-700" onClick={() => handleCopySQL(query)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 bg-zinc-800 hover:bg-zinc-700" onClick={() => handleRunSQL(query)}>
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )
        }
        // Skip other tool states (input-streaming, etc.)
        return null
      }

      // Skip step-start and other internal parts
      if (part.type === "step-start") return null

      // If it's a text part, try to detect SQL inside it
      if (part.type === "text" || part.type === "message" || typeof textContent === "string") {
        const possibleSQL = extractSQLFromText(textContent as string)
        if (possibleSQL) {
          return (
            <div key={key} className="space-y-2 mt-2">
              <div className="whitespace-pre-wrap text-sm">{textContent}</div>
              <div className="relative mt-2">
                <pre className="text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-50 p-3 rounded-md overflow-x-auto">{possibleSQL}</pre>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 px-2 bg-zinc-800 hover:bg-zinc-700" onClick={() => handleCopySQL(possibleSQL)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 bg-zinc-800 hover:bg-zinc-700" onClick={() => handleRunSQL(possibleSQL)}>
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )
        }

        // Otherwise just render plain text
        return (
          <div key={key} className="whitespace-pre-wrap text-sm">
            {textContent}
          </div>
        )
      }

      // Unknown part types: render JSON for debugging (small)
      return (
        <pre key={key} className="text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 p-2 rounded-md overflow-x-auto">
          {JSON.stringify(part, null, 2)}
        </pre>
      )
    })
  }

  return (
    <Card key={activeChatId} className="flex flex-col h-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">AI Assistant</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            {safeAISettings.provider === "groq" ? "Hosted" : "Self-hosted"}
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            title="New chat"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowSettings((s) => !s)}>
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Provider</label>
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant={safeAISettings.provider === "groq" ? "default" : "outline"}
                  onClick={() => setAISettings({ provider: "groq", model: "llama-3.3-70b-versatile" })}
                >
                  Groq (Hosted)
                </Button>
                <Button
                  size="sm"
                  variant={safeAISettings.provider === "ollama" ? "default" : "outline"}
                  onClick={() => setAISettings({ provider: "ollama", model: "llama3.1" })}
                >
                  Ollama (Local)
                </Button>
              </div>
            </div>

            {safeAISettings.provider === "groq" && (
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Model</label>
                <select
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={safeAISettings.model}
                  onChange={(e) => setAISettings({ model: e.target.value })}
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Recommended)</option>
                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B</option>
                  <option value="llama-3.2-90b-text-preview">Llama 3.2 90B</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                </select>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Larger models have better tool calling support
                </p>
              </div>
            )}

            {safeAISettings.provider === "ollama" && (
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Model</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  value={safeAISettings.model}
                  onChange={(e) => setAISettings({ model: e.target.value })}
                  placeholder="e.g., llama3.1, mistral, codellama"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Make sure the model is pulled: <code className="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">ollama pull {safeAISettings.model}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400 py-12">
            <Brain className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm">Ask me anything about your data!</p>
            <p className="text-xs mt-2">Try: &quot;Show me total sales by category&quot; or &quot;Find the top 10 customers&quot;</p>
          </div>
        ) : null}

        {messages.map((message: any) => (
          <div key={message.id ?? Math.random()} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"}`}>
              {renderMessageParts(message)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => handleSubmit(e)} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1 px-4 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            onKeyDown={(e) => {
              // Allow Shift+Enter for newline
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
