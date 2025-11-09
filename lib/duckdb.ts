import type { QueryResults, TableColumn } from "./types"
import type * as duckdb from "@duckdb/duckdb-wasm"

type AsyncDuckDB = duckdb.AsyncDuckDB
type AsyncDuckDBConnection = duckdb.AsyncDuckDBConnection

let db: AsyncDuckDB | null = null
let connection: AsyncDuckDBConnection | null = null
let initialized = false

async function initDuckDB(): Promise<AsyncDuckDB | null> {
  if (initialized) return db

  try {
    const duckdb = await import("@duckdb/duckdb-wasm")

    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)

    // Create worker from bundle
    const worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker!}");`], { type: "text/javascript" }),
    )

    const worker = new Worker(worker_url)
    const logger = new duckdb.ConsoleLogger()

    // Use AsyncDuckDB instead of Database
    db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)

    URL.revokeObjectURL(worker_url)
    initialized = true

    return db
  } catch (error) {
    console.error("Failed to initialize DuckDB:", error)
    throw error
  }
}

async function uploadCSV(file: File): Promise<string> {
  await initDuckDB()
  if (!db) throw new Error("Database not initialized")

  const text = await file.text()
  const tableName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase()

  try {
    const conn = await db.connect()

    // This stores the CSV data in DuckDB's virtual filesystem
    await db.registerFileText(tableName + ".csv", text)

    // Now query the registered file
    await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${tableName}.csv')`)

    await conn.close()
    return tableName
  } catch (error) {
    console.error("Error uploading CSV:", error)
    throw error
  }
}

async function getTableSchema(tableName: string): Promise<TableColumn[]> {
  await initDuckDB()
  if (!db) throw new Error("Database not initialized")

  try {
    const conn = await db.connect()
    const result = await conn.query(`PRAGMA table_info(${tableName})`)
    const rows = result.toArray()

    const schema = rows.map((row: Record<string, unknown>) => ({
      name: row.name as string,
      type: row.type as string,
    }))

    await conn.close()
    return schema
  } catch (error) {
    console.error("Error getting table schema:", error)
    throw error
  }
}

async function executeQuery(query: string): Promise<QueryResults> {
  await initDuckDB()
  if (!db) throw new Error("Database not initialized")

  try {
    const conn = await db.connect()
    const result = await conn.query(query)

    const rows = result
      .toArray()
      .map((row: Record<string, unknown>) => 
        Object.fromEntries(Object.entries(row).map(([key, val]) => [key, val]))
      )

    const columns = result.schema.fields.map(field => field.name) ?? 
                   (rows[0] ? Object.keys(rows[0]) : [])

    await conn.close()

    return { 
      rows, 
      columns,
      rowCount: rows.length
    }
  } catch (error) {
    console.error("Query execution error:", error)
    throw error
  }
}

export { initDuckDB, uploadCSV, executeQuery, getTableSchema }
