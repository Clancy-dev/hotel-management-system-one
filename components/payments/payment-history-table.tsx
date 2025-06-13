"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarIcon,
  Download,
  X,
  Printer,
  Edit,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { PaymentDetailsDialog } from "./payment-details-dialog"
import { EditPaymentDialog } from "./edit-payment-dialog"

interface Payment {
  id: string
  amount: number
  paymentMode: string
  receiptNumber?: string
  depositPaid?: number
  roomRate: number
  discountType?: string
  discountAmount?: number
  totalBill: number
  balanceRemaining: number
  status: string
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
  paymentDate: Date
  booking: {
    id: string
    checkInDate: Date
    checkOutDate: Date
    guest: {
      firstName: string
      lastName: string
      phoneNumber: string
    }
    room: {
      roomNumber: string
      category: {
        name: string
      }
    }
  }
}

interface PaymentHistoryTableProps {
  initialPayments: Payment[]
}

export function PaymentHistoryTable({ initialPayments }: PaymentHistoryTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()

  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false)
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false)
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null)

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(payments.map((p) => p.status))).sort()
  const uniquePaymentModes = Array.from(new Set(payments.map((p) => p.paymentMode))).sort()

  // Update payments when initialPayments changes
  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  // Filter and search logic
  useEffect(() => {
    let result = [...payments]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((payment) => {
        const guestName = `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`.toLowerCase()
        return (
          guestName.includes(term) ||
          payment.booking.guest.phoneNumber.includes(term) ||
          payment.booking.room.roomNumber.toLowerCase().includes(term) ||
          payment.paymentMode.toLowerCase().includes(term) ||
          (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(term))
        )
      })
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter((payment) => payment.status === selectedStatus)
    }

    // Apply payment mode filter
    if (selectedPaymentMode !== "all") {
      result = result.filter((payment) => payment.paymentMode === selectedPaymentMode)
    }

    // Apply date filters
    if (dateFrom) {
      result = result.filter((payment) => new Date(payment.paymentDate) >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((payment) => new Date(payment.paymentDate) <= dateTo)
    }

    // Sort by payment date (newest first)
    result.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

    setFilteredPayments(result)
    setCurrentPage(1)
  }, [searchTerm, selectedStatus, selectedPaymentMode, dateFrom, dateTo, payments])

  // Pagination logic
  const indexOfLastPayment = currentPage * rowsPerPage
  const indexOfFirstPayment = indexOfLastPayment - rowsPerPage
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment)
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage)

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailsOpen(true)
  }

  const handleGenerateReceipt = async (payment: Payment) => {
    setSelectedPayment(payment)

    // Generate a placeholder QR code URL
    // In a real application, you would use the QRCode library
    // but for this demo, we'll use a placeholder
    const qrUrl = `/placeholder.svg?text=${encodeURIComponent(payment.id)}&height=100&width=100`
    setQrCodeUrl(qrUrl)
    setIsReceiptOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStatus("all")
    setSelectedPaymentMode("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Guest",
      "Phone",
      "Room",
      "Payment Mode",
      "Amount",
      "Total Bill",
      "Balance",
      "Status",
      "Receipt Number",
    ]
    const csvData = filteredPayments.map((payment) => [
      format(new Date(payment.paymentDate), "yyyy-MM-dd HH:mm:ss"),
      `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
      payment.booking.guest.phoneNumber,
      payment.booking.room.roomNumber,
      payment.paymentMode,
      formatPrice(payment.amount),
      formatPrice(payment.totalBill),
      formatPrice(payment.balanceRemaining),
      payment.status,
      payment.receiptNumber || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const printReceipt = () => {
    if (!selectedPayment) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; max-width: 400px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin-bottom: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PAYMENT RECEIPT</h2>
            <p>Hotel Management System</p>
          </div>
          
          <div class="section">
            <div class="row">
              <span>Receipt #:</span>
              <span>${selectedPayment.receiptNumber || selectedPayment.id.slice(-8)}</span>
            </div>
            <div class="row">
              <span>Date:</span>
              <span>${format(new Date(selectedPayment.paymentDate), "MMM dd, yyyy HH:mm")}</span>
            </div>
          </div>

          <div class="section">
            <h3>Guest Information</h3>
            <div class="row">
              <span>Name:</span>
              <span>${selectedPayment.booking.guest.firstName} ${selectedPayment.booking.guest.lastName}</span>
            </div>
            <div class="row">
              <span>Phone:</span>
              <span>${selectedPayment.booking.guest.phoneNumber}</span>
            </div>
            <div class="row">
              <span>Room:</span>
              <span>${selectedPayment.booking.room.roomNumber} (${selectedPayment.booking.room.category.name})</span>
            </div>
          </div>

          <div class="section">
            <h3>Payment Details</h3>
            <div class="row">
              <span>Room Rate:</span>
              <span>${formatPrice(selectedPayment.roomRate)}</span>
            </div>
            ${
              selectedPayment.discountAmount
                ? `
            <div class="row">
              <span>Discount:</span>
              <span>-${formatPrice(selectedPayment.discountAmount)}</span>
            </div>
            `
                : ""
            }
            <div class="row">
              <span>Total Bill:</span>
              <span>${formatPrice(selectedPayment.totalBill)}</span>
            </div>
            <div class="row">
              <span>Amount Paid:</span>
              <span>${formatPrice(selectedPayment.amount)}</span>
            </div>
            <div class="row total">
              <span>Balance Remaining:</span>
              <span>${formatPrice(selectedPayment.balanceRemaining)}</span>
            </div>
          </div>

          <div class="section">
            <div class="row">
              <span>Payment Mode:</span>
              <span>${selectedPayment.paymentMode.replace("_", " ").toUpperCase()}</span>
            </div>
            ${
              selectedPayment.mobileMoneyProvider
                ? `
            <div class="row">
              <span>Provider:</span>
              <span>${selectedPayment.mobileMoneyProvider.replace("_", " ")}</span>
            </div>
            `
                : ""
            }
          </div>

          ${
            qrCodeUrl
              ? `
          <div class="qr-code">
            <div class="mx-auto w-20 h-20 border border-gray-300 flex items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-500">QR Code</span>
            </div>
            <p style="font-size: 10px;">Scan for verification</p>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Generated on ${format(new Date(), "PPP")}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(receiptContent)
    printWindow.document.close()
    printWindow.print()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Completed
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-white">
            Partial
          </Badge>
        )
      case "pending":
        return <Badge variant="destructive">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPaymentId(payment.id)
    setIsPaymentDetailsOpen(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setPaymentToEdit(payment)
    setIsEditPaymentOpen(true)
  }

  const handlePaymentUpdated = () => {
    // Refresh the payments list
    window.location.reload()
  }

  const handlePaymentDeleted = () => {
    // Refresh the payments list
    window.location.reload()
  }

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>Filter payment history by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by guest name, phone, room, or receipt number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Mode Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Mode</label>
              <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Modes</SelectItem>
                  {uniquePaymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <span className="text-sm text-muted-foreground">{filteredPayments.length} payment(s) found</span>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Date</TableHead>
                  <TableHead className="min-w-[150px]">Guest</TableHead>
                  <TableHead className="min-w-[80px]">Room</TableHead>
                  <TableHead className="min-w-[100px]">Payment Mode</TableHead>
                  <TableHead className="min-w-[100px]">Amount Paid</TableHead>
                  <TableHead className="min-w-[100px]">Total Bill</TableHead>
                  <TableHead className="min-w-[100px]">Balance</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      {searchTerm.trim() !== "" ||
                      selectedStatus !== "all" ||
                      selectedPaymentMode !== "all" ||
                      dateFrom ||
                      dateTo
                        ? "No payments found matching your filters"
                        : "No payment history found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(payment.paymentDate), "MMM dd, yyyy")}
                        <br />
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(payment.paymentDate), "HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.booking.guest.firstName} {payment.booking.guest.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{payment.booking.guest.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{payment.booking.room.roomNumber}</TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{payment.paymentMode.replace("_", " ")}</span>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(payment.amount)}</TableCell>
                      <TableCell>{formatPrice(payment.totalBill)}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            payment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {payment.balanceRemaining > 0 ? formatPrice(payment.balanceRemaining) : "Paid"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPaymentDetails(payment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateReceipt(payment)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Generate Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstPayment + 1}-{Math.min(indexOfLastPayment, filteredPayments.length)} of{" "}
            {filteredPayments.length} payments
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Complete payment information and booking details</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-6">
                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                      <p>{format(new Date(selectedPayment.paymentDate), "PPP p")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                      <p>{selectedPayment.receiptNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Mode</label>
                      <p className="capitalize">{selectedPayment.paymentMode.replace("_", " ")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                      <p className="font-medium text-lg">{formatPrice(selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Balance Remaining</label>
                      <p
                        className={`font-medium text-lg ${
                          selectedPayment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {selectedPayment.balanceRemaining > 0
                          ? formatPrice(selectedPayment.balanceRemaining)
                          : "Fully Paid"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Room Rate:</span>
                      <span>{formatPrice(selectedPayment.roomRate)}</span>
                    </div>
                    {selectedPayment.discountAmount && selectedPayment.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selectedPayment.discountType}):</span>
                        <span>-{formatPrice(selectedPayment.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total Bill:</span>
                      <span>{formatPrice(selectedPayment.totalBill)}</span>
                    </div>
                    {selectedPayment.depositPaid && selectedPayment.depositPaid > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Deposit Paid:</span>
                        <span>{formatPrice(selectedPayment.depositPaid)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Guest & Booking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Guest & Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Guest Name</label>
                      <p className="font-medium">
                        {selectedPayment.booking.guest.firstName} {selectedPayment.booking.guest.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p>{selectedPayment.booking.guest.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Room</label>
                      <p className="font-medium">
                        {selectedPayment.booking.room.roomNumber} ({selectedPayment.booking.room.category.name})
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stay Period</label>
                      <p className="text-sm">
                        {format(new Date(selectedPayment.booking.checkInDate), "MMM dd")} -{" "}
                        {format(new Date(selectedPayment.booking.checkOutDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Money Details */}
                {selectedPayment.mobileMoneyProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mobile Money Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Provider</label>
                        <p>{selectedPayment.mobileMoneyProvider.replace("_", " ")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <p>{selectedPayment.mobileMoneyNumber || "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Payment Receipt
            </DialogTitle>
            <DialogDescription>
              Receipt for payment made by{" "}
              {selectedPayment &&
                `${selectedPayment.booking.guest.firstName} ${selectedPayment.booking.guest.lastName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Receipt Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg">PAYMENT RECEIPT</h3>
                  <p className="text-sm text-muted-foreground">Hotel Management System</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span className="font-medium">{selectedPayment.receiptNumber || selectedPayment.id.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{format(new Date(selectedPayment.paymentDate), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>
                      {selectedPayment.booking.guest.firstName} {selectedPayment.booking.guest.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{selectedPayment.booking.room.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="capitalize">{selectedPayment.paymentMode.replace("_", " ")}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span className="font-bold">{formatPrice(selectedPayment.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance:</span>
                      <span className={selectedPayment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"}>
                        {selectedPayment.balanceRemaining > 0
                          ? formatPrice(selectedPayment.balanceRemaining)
                          : "Fully Paid"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center mt-4">
                    <div className="mx-auto w-20 h-20 border border-gray-300 flex items-center justify-center bg-gray-50">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Scan for verification</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>
                  Close
                </Button>
                <Button onClick={printReceipt}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        open={isPaymentDetailsOpen}
        onOpenChange={setIsPaymentDetailsOpen}
        paymentId={selectedPaymentId}
        onPaymentDeleted={handlePaymentDeleted}
        onPaymentUpdated={handlePaymentUpdated}
      />

      {/* Edit Payment Dialog */}
      <EditPaymentDialog
        open={isEditPaymentOpen}
        onOpenChange={setIsEditPaymentOpen}
        payment={paymentToEdit}
        onPaymentUpdated={handlePaymentUpdated}
      />
    </div>
  )
}
