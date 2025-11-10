import type { QueryResults } from "./types"

export async function exportToCSV(results: QueryResults, filename?: string): Promise<void> {
  const csv = [
    results.columns.join(","),
    ...results.rows.map((row) =>
      results.columns.map((col) => {
        const value = row[col]
        if (value === null || value === undefined) return ""
        const str = String(value)
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(",")
    ),
  ].join("\n")

  downloadFile(csv, filename || `results-${Date.now()}.csv`, "text/csv")
}

export async function exportToJSON(results: QueryResults, filename?: string): Promise<void> {
  const json = JSON.stringify(results.rows, null, 2)
  downloadFile(json, filename || `results-${Date.now()}.json`, "application/json")
}

export async function exportToJSONLines(results: QueryResults, filename?: string): Promise<void> {
  const jsonl = results.rows.map((row) => JSON.stringify(row)).join("\n")
  downloadFile(jsonl, filename || `results-${Date.now()}.jsonl`, "application/x-ndjson")
}

export async function exportToParquet(
  tableName: string,
  connection: any,
  filename?: string
): Promise<void> {
  try {
    // Use DuckDB to export to Parquet
    const query = `COPY ${tableName} TO '${filename || `export-${Date.now()}.parquet`}' (FORMAT PARQUET)`
    await connection.run(query)

  } catch (error) {
    console.error("Parquet export error:", error)
    throw new Error("Parquet export is not yet fully supported in the browser")
  }
}

export async function exportToMarkdown(results: QueryResults, filename?: string): Promise<void> {
  const columnWidths = results.columns.map((col, idx) => {
    const maxWidth = Math.max(
      col.length,
      ...results.rows.map((row) => String(row[col] ?? "").length)
    )
    return Math.min(maxWidth, 50) // Cap at 50 characters
  })

  const header = `| ${results.columns.map((col, idx) => col.padEnd(columnWidths[idx])).join(" | ")} |`
  const separator = `| ${columnWidths.map((w) => "-".repeat(w)).join(" | ")} |`
  const rows = results.rows.map((row) =>
    `| ${results.columns.map((col, idx) =>
      String(row[col] ?? "").padEnd(columnWidths[idx])
    ).join(" | ")} |`
  )

  const markdown = [header, separator, ...rows].join("\n")
  downloadFile(markdown, filename || `results-${Date.now()}.md`, "text/markdown")
}

export async function exportToHTML(results: QueryResults, filename?: string): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Query Results</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: 600; }
    tr:hover { background-color: #f9f9f9; }
    .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="meta">
    <strong>Query Results</strong> • ${results.rowCount} rows • ${results.columns.length} columns
    • Generated: ${new Date().toLocaleString()}
  </div>
  <table>
    <thead>
      <tr>
        ${results.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${results.rows
      .map(
        (row) => `
        <tr>
          ${results.columns.map((col) => `<td>${escapeHtml(String(row[col] ?? ""))}</td>`).join("")}
        </tr>
      `
      )
      .join("")}
    </tbody>
  </table>
</body>
</html>
  `.trim()

  downloadFile(html, filename || `results-${Date.now()}.html`, "text/html")
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const element = document.createElement("a")
  element.setAttribute("href", url)
  element.setAttribute("download", filename)
  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(url)
}

export function getCopyableText(results: QueryResults): string {
  return [
    results.columns.join("\t"),
    ...results.rows.map((row) => results.columns.map((col) => row[col] ?? "").join("\t")),
  ].join("\n")
}

