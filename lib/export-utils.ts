// Simple export utilities that work without external dependencies
export interface ExportColumn {
  header: string
  dataKey: string
}

export interface ExportOptions {
  title: string
  subtitle?: string
  columns: ExportColumn[]
  data: any[]
  filename: string
}

export const exportToCSV = (options: ExportOptions) => {
  const { title, subtitle, columns, data, filename } = options

  // Create CSV content
  const headers = columns.map((col) => col.header).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.dataKey] || ""
        // Escape commas and quotes in CSV
        return typeof value === "string" && (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      })
      .join(","),
  )

  const csvContent = [
    `# ${title}`,
    subtitle ? `# ${subtitle}` : "",
    `# Generated on: ${new Date().toLocaleDateString()}`,
    "",
    headers,
    ...rows,
  ]
    .filter(Boolean)
    .join("\n")

  // Download CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportToJSON = (options: ExportOptions) => {
  const { title, subtitle, data, filename } = options

  const exportData = {
    title,
    subtitle,
    generatedOn: new Date().toISOString(),
    data,
  }

  const jsonContent = JSON.stringify(exportData, null, 2)

  // Download JSON file
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.json`
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportToText = (options: ExportOptions) => {
  const { title, subtitle, columns, data, filename } = options

  let content = `${title}\n`
  if (subtitle) content += `${subtitle}\n`
  content += `Generated on: ${new Date().toLocaleDateString()}\n\n`

  // Create a simple table format
  const maxWidths = columns.map((col) => {
    const headerWidth = col.header.length
    const dataWidth = Math.max(...data.map((row) => String(row[col.dataKey] || "").length))
    return Math.max(headerWidth, dataWidth, 10)
  })

  // Add headers
  content += columns.map((col, i) => col.header.padEnd(maxWidths[i])).join(" | ") + "\n"
  content += columns.map((_, i) => "-".repeat(maxWidths[i])).join("-|-") + "\n"

  // Add data rows
  data.forEach((row) => {
    content += columns.map((col, i) => String(row[col.dataKey] || "").padEnd(maxWidths[i])).join(" | ") + "\n"
  })

  // Download text file
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.txt`
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
