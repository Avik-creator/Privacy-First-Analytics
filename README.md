# Privacy-First Analytics Engine 🦆

A powerful, browser-based SQL analytics platform powered by DuckDB WASM. Query your data locally with complete privacy - zero server involvement, your data never leaves your device.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![DuckDB](https://img.shields.io/badge/DuckDB-WASM-yellow)

## ✨ Features

### Core Capabilities
- 🔒 **100% Client-Side**: All processing happens in your browser
- ⚡ **Lightning Fast**: Powered by DuckDB WASM for near-native performance
- 📊 **Rich Visualizations**: Bar, line, pie, scatter charts + advanced options
- 🔍 **Smart Search**: Real-time filtering across all columns
- 📤 **Multi-Format Export**: CSV, JSON, JSON Lines, Markdown, HTML
- 💾 **Persistent Storage**: Query history & preferences saved locally via Zustand
- 🌓 **Dark Mode**: System-aware theme with smooth transitions

### Advanced Features
- ⌨️ **Command Palette** (Cmd/Ctrl+K): Quick access to all actions
- 📈 **Column Statistics**: Hover over columns for instant insights
- 🔢 **Sortable Columns**: Click headers to sort ascending/descending
- 📋 **Click-to-Copy**: Copy any cell value with one click
- 🎯 **Query Templates**: Pre-built queries for common operations
- 📊 **Data Quality Metrics**: Completeness, uniqueness, consistency checks
- 🔄 **Query History**: Track and reuse past queries
- 🎨 **Chart Customization**: Interactive chart builder

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd analytics-engine

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### First Query

1. **Upload Data**: Click "Upload CSV" or drag-and-drop a CSV file
2. **Write Query**: Use the SQL editor or query builder
3. **Execute**: Press Cmd/Ctrl+Enter or click "Run Query"
4. **Visualize**: Switch between table, chart, and advanced views

## 📖 Usage Guide

### Uploading Data

#### CSV Files
```sql
-- After upload, query your data
SELECT * FROM your_table LIMIT 10;
```

#### Parquet Files (Coming Soon)
```sql
SELECT * FROM read_parquet('data.parquet');
```

#### JSON Files
```sql
SELECT * FROM read_json_auto('data.json');
```

### Writing Queries

#### Basic Queries
```sql
-- Select all data
SELECT * FROM customers;

-- Filter rows
SELECT * FROM customers WHERE country = 'USA';

-- Aggregate data
SELECT country, COUNT(*) as total 
FROM customers 
GROUP BY country 
ORDER BY total DESC;
```

#### Advanced Queries
```sql
-- Window functions
SELECT 
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY customer_id 
    ORDER BY order_date
  ) as running_total
FROM orders;

-- CTEs (Common Table Expressions)
WITH top_customers AS (
  SELECT customer_id, SUM(amount) as total
  FROM orders
  GROUP BY customer_id
  ORDER BY total DESC
  LIMIT 10
)
SELECT c.name, tc.total
FROM top_customers tc
JOIN customers c ON tc.customer_id = c.id;
```

### Query Templates

Access pre-built templates via the Templates tab:

- **Preview Data**: `SELECT * FROM table LIMIT 10`
- **Count Records**: `SELECT COUNT(*) FROM table`
- **Distinct Values**: `SELECT DISTINCT column FROM table`
- **Summary Stats**: Aggregate statistics
- **Group & Count**: Group by with counts
- **Random Sample**: Sample rows from dataset

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + Enter` | Execute Query |
| `Esc` | Close modals/palettes |
| `↑` `↓` | Navigate command palette |
| `Enter` | Select command |

### Command Palette

Press `Cmd/Ctrl + K` to access the command palette:

- Execute queries
- Navigate between tabs
- Upload files
- Export results
- And more...

## 📊 Export Options

### CSV Export
```typescript
// Results are exported with proper escaping
// Handles commas, quotes, and newlines
export as CSV
```

### JSON Export
```typescript
// Pretty-printed JSON array
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

### JSON Lines (NDJSON)
```typescript
// Newline-delimited JSON (streaming-friendly)
{"id":1,"name":"Alice"}
{"id":2,"name":"Bob"}
```

### Markdown Table
```markdown
| id | name  |
| -- | ----- |
| 1  | Alice |
| 2  | Bob   |
```

### HTML Table
```html
<!-- Styled HTML table with metadata -->
<table>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

## 🎨 Features Deep Dive

### Column Statistics

Hover over any column header to see:
- **Data Type**: Numeric, Text, Boolean, or Mixed
- **Total Rows**: Number of records
- **Non-Null Count**: Completeness percentage
- **Unique Values**: Uniqueness percentage
- **Numeric Stats**: Min, Max, Average, Median
- **Text Stats**: Min/Max/Avg length

### Data Quality Assessment

Automatic data quality checks:
- **Completeness**: Percentage of non-null values
- **Uniqueness**: Distinct value count
- **Consistency**: Pattern validation
- **Overall Quality Score**: Excellent, Good, or Needs Attention

### Query Builder

Visual query builder for non-SQL users:
1. Select tables
2. Choose columns
3. Add filters (AND/OR conditions)
4. Apply sorting
5. Set limits
6. Generate SQL automatically

### Advanced Charts

- **Area Charts**: Time-series trends
- **Stacked Bar Charts**: Comparative analysis
- **Multi-Line Charts**: Multiple metrics
- **Radar Charts**: Multi-dimensional data
- **Combo Charts**: Mixed chart types

## 🔧 Technical Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: DuckDB WASM 1.30.0
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS v4 with OKLCH colors
- **Charts**: Recharts 3.3.0
- **Icons**: Lucide React
- **Theme**: next-themes with system detection
- **TypeScript**: Full type safety throughout

## 📁 Project Structure

```
analytics-engine/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles
├── components/
│   ├── analytics/          # Analytics-related components
│   │   ├── analytics.tsx   # Main analytics dashboard
│   │   ├── query-editor.tsx
│   │   ├── query-results.tsx
│   │   ├── data-stats.tsx
│   │   └── ...
│   └── ui/                 # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── command-palette.tsx
│       ├── column-stats-tooltip.tsx
│       └── ...
├── lib/
│   ├── duckdb.ts           # DuckDB integration
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript types
│   ├── export-utils.ts     # Export functionality
│   ├── query-cache.ts      # Query caching
│   └── error-handler.ts    # Error handling
└── public/                 # Static assets
```

## Architecture

┌────────────┐
│  CSV/JSON  │
└──────┬─────┘
       │
       ▼
  DuckDB WASM Engine
       │
       ▼
 ┌───────────────┐
 │  SQL Editor   │
 │ + Query Cache │
 └──────┬────────┘
        ▼
  Results → Charts → Export
        │
        ▼
   Local Storage / IndexedDB


## 🔒 Privacy & Security

### Data Privacy
- ✅ All data processing happens in your browser
- ✅ No data is uploaded to any server
- ✅ No tracking or analytics
- ✅ No network requests (except for initial app load)
- ✅ All storage is local (localStorage + IndexedDB)

### What We Store Locally
- Query history (last 50 queries)
- User preferences (theme, layout)
- Query statistics (counts, timing)
- DuckDB virtual filesystem (your uploaded data)

### What We Don't Store
- Your actual data on any server
- Personal information
- Usage analytics
- Telemetry data

## 🚧 Roadmap

### Planned Features
- [ ] Parquet file import/export
- [ ] Excel (.xlsx) import/export
- [ ] Natural Language to SQL (AI-powered)
- [ ] Query explanation in plain English
- [ ] Pivot tables
- [ ] Data transformations UI
- [ ] Query collaboration (share via link)
- [ ] Scheduled exports
- [ ] More chart types (heatmaps, treemaps)
- [ ] Custom themes

### Known Limitations
- Parquet export requires filesystem access (coming soon)
- Excel import requires extension (planned)
- Large files (>2GB) may be slow in browser
- IndexedDB storage limits vary by browser

## 📝 DuckDB SQL Reference

DuckDB supports full SQL with many extensions:

### Aggregations
```sql
SELECT 
  category,
  COUNT(*) as count,
  AVG(price) as avg_price,
  SUM(quantity) as total_quantity
FROM products
GROUP BY category;
```

### Window Functions
```sql
SELECT 
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) as salary_rank
FROM employees;
```

### String Functions
```sql
SELECT 
  UPPER(name) as upper_name,
  LENGTH(description) as desc_length,
  SUBSTRING(code, 1, 3) as code_prefix
FROM items;
```

### Date Functions
```sql
SELECT 
  DATE_TRUNC('month', order_date) as month,
  COUNT(*) as orders
FROM orders
GROUP BY month;
```

### JSON Functions
```sql
SELECT 
  json_extract(data, '$.user.name') as user_name,
  json_extract_string(data, '$.status') as status
FROM events;
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing code formatting
- Add comments for complex logic
- Update tests as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [DuckDB](https://duckdb.org/) - Amazing in-process SQL database
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Charting library
- [shadcn/ui](https://ui.shadcn.com/) - UI components inspiration

## 📞 Support

- **Documentation**: [DuckDB Docs](https://duckdb.org/docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ using DuckDB WASM**

*Your data, your browser, your control.*
