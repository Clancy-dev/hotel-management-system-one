import "jspdf-autotable"
import { exportToCSV, type ExportOptions } from "./export-utils"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface PDFColumn {
  header: string
  dataKey: string
  width?: number
}

export interface PDFOptions {
  title: string
  subtitle?: string
  columns: PDFColumn[]
  data: any[]
  filename: string
  orientation?: "portrait" | "landscape"
  pageSize?: "a4" | "letter"
}

export const generatePDF = async (options: PDFOptions) => {
  try {
    // Try to load jsPDF dynamically
    const jsPDF = (await import("jspdf")).default

    // Check if jsPDF loaded successfully
    if (!jsPDF) {
      throw new Error("jsPDF failed to load")
    }

    const { title, subtitle, columns, data, filename, orientation = "portrait", pageSize = "a4" } = options

    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: pageSize,
    })

    // Add header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(title, 20, 20)

    if (subtitle) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(subtitle, 20, 30)
    }

    // Add date
    const currentDate = new Date().toLocaleDateString()
    doc.setFontSize(10)
    doc.text(`Generated on: ${currentDate}`, 20, subtitle ? 40 : 30)

    // Try to add table if autoTable is available
    try {
      const autoTable = (await import("jspdf-autotable")).default

      autoTable(doc, {
        head: [columns.map((col) => col.header)],
        body: data.map((row) => columns.map((col) => row[col.dataKey] || "")),
        startY: subtitle ? 50 : 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })
    } catch (tableError) {
      // Fallback to simple text if autoTable fails
      let yPosition = subtitle ? 50 : 40
      doc.setFontSize(10)

      // Add headers
      const headerText = columns.map((col) => col.header).join(" | ")
      doc.text(headerText, 20, yPosition)
      yPosition += 10

      // Add data rows
      data.forEach((row) => {
        const rowText = columns.map((col) => row[col.dataKey] || "").join(" | ")
        doc.text(rowText, 20, yPosition)
        yPosition += 8

        // Add new page if needed
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
      })
    }

    // Save the PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.warn("PDF generation failed, falling back to CSV export:", error)

    // Convert PDFOptions to ExportOptions
    const exportOptions: ExportOptions = {
      title: options.title,
      subtitle: options.subtitle,
      columns: options.columns.map((col) => ({ header: col.header, dataKey: col.dataKey })),
      data: options.data,
      filename: options.filename,
    }

    // Fallback to CSV export
    exportToCSV(exportOptions)
  }
}

export const generateSimplePDF = async (title: string, content: string, filename: string) => {
  try {
    const jsPDF = (await import("jspdf")).default

    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(title, 20, 20)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    const lines = doc.splitTextToSize(content, 170)
    doc.text(lines, 20, 40)

    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.warn("Simple PDF generation failed, falling back to text export:", error)

    // Fallback to text file
    const textContent = `${title}\n\n${content}`
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" })
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
}
