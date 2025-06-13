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
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarIcon,
  Download,
  Phone,
  Mail,
  User,
  X,
  Printer,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"

interface GuestHistory {
  id: string
  firstName: string
  lastName: string
  nationality: string
  phoneNumber: string
  email?: string
  bookings: Array<{
    id: string
    checkInDate: Date
    checkOutDate: Date
    actualCheckOut?: Date
    numberOfGuests: number
    purposeOfStay: string
    room: {
      roomNumber: string
      category: {
        name: string
      }
    }
    payments: Array<{
      totalBill: number
      balanceRemaining: number
      status: string
      paymentDate: Date
    }>
  }>
}

interface GuestHistoryTableProps {
  initialGuestHistory: GuestHistory[]
}

export function GuestHistoryTable({ initialGuestHistory }: GuestHistoryTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()

  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>(initialGuestHistory)
  const [filteredHistory, setFilteredHistory] = useState<GuestHistory[]>(guestHistory)
  const [selectedGuest, setSelectedGuest] = useState<GuestHistory | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNationality, setSelectedNationality] = useState<string>("all")
  const [selectedPurpose, setSelectedPurpose] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  // Get unique values for filters
  const uniqueNationalities = Array.from(new Set(guestHistory.map((g) => g.nationality))).sort()
  const uniquePurposes = Array.from(new Set(guestHistory.flatMap((g) => g.bookings.map((b) => b.purposeOfStay)))).sort()

  // Update history when initialGuestHistory changes
  useEffect(() => {
    setGuestHistory(initialGuestHistory)
  }, [initialGuestHistory])

  // Filter and search logic
  useEffect(() => {
    let result = [...guestHistory]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((guest) => {
        const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
        const roomNumbers = guest.bookings
          .map((b) => b.room.roomNumber)
          .join(" ")
          .toLowerCase()
        return (
          fullName.includes(term) ||
          guest.phoneNumber.includes(term) ||
          (guest.email && guest.email.toLowerCase().includes(term)) ||
          guest.nationality.toLowerCase().includes(term) ||
          roomNumbers.includes(term)
        )
      })
    }

    // Apply nationality filter
    if (selectedNationality !== "all") {
      result = result.filter((guest) => guest.nationality === selectedNationality)
    }

    // Apply purpose filter
    if (selectedPurpose !== "all") {
      result = result.filter((guest) => guest.bookings.some((b) => b.purposeOfStay === selectedPurpose))
    }

    // Apply date filters (based on checkout date)
    if (dateFrom || dateTo) {
      result = result.filter((guest) =>
        guest.bookings.some((booking) => {
          const checkoutDate = booking.actualCheckOut
            ? new Date(booking.actualCheckOut)
            : new Date(booking.checkOutDate)
          if (dateFrom && checkoutDate < dateFrom) return false
          if (dateTo && checkoutDate > dateTo) return false
          return true
        }),
      )
    }

    // Sort by most recent checkout
    result.sort((a, b) => {
      const aLatestCheckout = Math.max(
        ...a.bookings.map((booking) =>
          booking.actualCheckOut
            ? new Date(booking.actualCheckOut).getTime()
            : new Date(booking.checkOutDate).getTime(),
        ),
      )
      const bLatestCheckout = Math.max(
        ...b.bookings.map((booking) =>
          booking.actualCheckOut
            ? new Date(booking.actualCheckOut).getTime()
            : new Date(booking.checkOutDate).getTime(),
        ),
      )
      return bLatestCheckout - aLatestCheckout
    })

    setFilteredHistory(result)
    setCurrentPage(1)
  }, [searchTerm, selectedNationality, selectedPurpose, dateFrom, dateTo, guestHistory])

  // Pagination logic
  const indexOfLastGuest = currentPage * rowsPerPage
  const indexOfFirstGuest = indexOfLastGuest - rowsPerPage
  const currentGuests = filteredHistory.slice(indexOfFirstGuest, indexOfLastGuest)
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage)

  const handleViewDetails = (guest: GuestHistory) => {
    setSelectedGuest(guest)
    setIsDetailsOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedNationality("all")
    setSelectedPurpose("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Nationality",
      "Phone",
      "Email",
      "Room",
      "Category",
      "Check-in",
      "Check-out",
      "Guests",
      "Purpose",
      "Total Bill",
      "Final Balance",
    ]
    const csvData = filteredHistory.flatMap((guest) =>
      guest.bookings.map((booking) => {
        const payment = booking.payments[booking.payments.length - 1] // Latest payment
        return [
          `${guest.firstName} ${guest.lastName}`,
          guest.nationality,
          guest.phoneNumber,
          guest.email || "N/A",
          booking.room.roomNumber,
          booking.room.category.name,
          format(new Date(booking.checkInDate), "yyyy-MM-dd"),
          booking.actualCheckOut
            ? format(new Date(booking.actualCheckOut), "yyyy-MM-dd")
            : format(new Date(booking.checkOutDate), "yyyy-MM-dd"),
          booking.numberOfGuests,
          booking.purposeOfStay.replace("_", " "),
          payment ? formatPrice(payment.totalBill) : "N/A",
          payment ? formatPrice(payment.balanceRemaining) : "N/A",
        ]
      }),
    )

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `guest-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const printGuestRecord = (guest: GuestHistory) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guest Record - ${guest.firstName} ${guest.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Guest Record</h1>
            <p>Generated on ${format(new Date(), "PPP")}</p>
          </div>
          
          <div class="section">
            <h3>Personal Information</h3>
            <table>
              <tr><td><strong>Name:</strong></td><td>${guest.firstName} ${guest.lastName}</td></tr>
              <tr><td><strong>Nationality:</strong></td><td>${guest.nationality}</td></tr>
              <tr><td><strong>Phone:</strong></td><td>${guest.phoneNumber}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${guest.email || "Not provided"}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Booking History</h3>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Category</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Purpose</th>
                  <th>Total Bill</th>
                </tr>
              </thead>
              <tbody>
                ${guest.bookings
                  .map((booking) => {
                    const payment = booking.payments[booking.payments.length - 1]
                    return `
                      <tr>
                        <td>${booking.room.roomNumber}</td>
                        <td>${booking.room.category.name}</td>
                        <td>${format(new Date(booking.checkInDate), "MMM dd, yyyy")}</td>
                        <td>${
                          booking.actualCheckOut
                            ? format(new Date(booking.actualCheckOut), "MMM dd, yyyy")
                            : format(new Date(booking.checkOutDate), "MMM dd, yyyy")
                        }</td>
                        <td>${booking.numberOfGuests}</td>
                        <td>${booking.purposeOfStay.replace("_", " ")}</td>
                        <td>${payment ? formatPrice(payment.totalBill) : "N/A"}</td>
                      </tr>
                    `
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>Filter guest history by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, nationality, or room..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nationality Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nationality</label>
              <Select value={selectedNationality} onValueChange={setSelectedNationality}>
                <SelectTrigger>
                  <SelectValue placeholder="All Nationalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  {uniqueNationalities.map((nationality) => (
                    <SelectItem key={nationality} value={nationality}>
                      {nationality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose of Stay</label>
              <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="All Purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  {uniquePurposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {purpose.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
              <span className="text-sm text-muted-foreground">{filteredHistory.length} guest(s) found</span>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guest History Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Guest Name</TableHead>
                  <TableHead className="min-w-[100px]">Nationality</TableHead>
                  <TableHead className="min-w-[120px]">Contact</TableHead>
                  <TableHead className="min-w-[80px]">Room</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[100px]">Check-out Date</TableHead>
                  <TableHead className="min-w-[80px]">Guests</TableHead>
                  <TableHead className="min-w-[100px]">Purpose</TableHead>
                  <TableHead className="min-w-[100px]">Total Bill</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      {searchTerm.trim() !== "" ||
                      selectedNationality !== "all" ||
                      selectedPurpose !== "all" ||
                      dateFrom ||
                      dateTo
                        ? "No guest history found matching your filters"
                        : "No guest history found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentGuests.map((guest) => {
                    const latestBooking = guest.bookings[guest.bookings.length - 1]
                    const latestPayment = latestBooking?.payments[latestBooking.payments.length - 1]
                    return (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <div className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{guest.nationality}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {guest.phoneNumber}
                            </div>
                            {guest.email && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 mr-1" />
                                {guest.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{latestBooking?.room.roomNumber}</TableCell>
                        <TableCell>{latestBooking?.room.category.name}</TableCell>
                        <TableCell>
                          {latestBooking && (
                            <div className="text-sm">
                              {latestBooking.actualCheckOut
                                ? format(new Date(latestBooking.actualCheckOut), "MMM dd, yyyy")
                                : format(new Date(latestBooking.checkOutDate), "MMM dd, yyyy")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{latestBooking?.numberOfGuests || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{latestBooking?.purposeOfStay.replace("_", " ")}</span>
                        </TableCell>
                        <TableCell>
                          {latestPayment && (
                            <div className="text-sm font-medium">{formatPrice(latestPayment.totalBill)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(guest)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => printGuestRecord(guest)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {filteredHistory.length > 0 && (
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
            Showing {indexOfFirstGuest + 1}-{Math.min(indexOfLastGuest, filteredHistory.length)} of{" "}
            {filteredHistory.length} guests
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

      {/* Guest Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Guest History Details</DialogTitle>
            <DialogDescription>Complete booking and payment history for this guest</DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium">
                        {selectedGuest.firstName} {selectedGuest.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                      <p>{selectedGuest.nationality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <p>{selectedGuest.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{selectedGuest.email || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking History</CardTitle>
                    <CardDescription>All past bookings for this guest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedGuest.bookings.map((booking, index) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Room</label>
                              <p className="font-medium">
                                {booking.room.roomNumber} ({booking.room.category.name})
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Stay Period</label>
                              <p className="text-sm">
                                {format(new Date(booking.checkInDate), "MMM dd, yyyy")} -{" "}
                                {booking.actualCheckOut
                                  ? format(new Date(booking.actualCheckOut), "MMM dd, yyyy")
                                  : format(new Date(booking.checkOutDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Purpose</label>
                              <p className="text-sm capitalize">{booking.purposeOfStay.replace("_", " ")}</p>
                            </div>
                          </div>

                          {/* Payment Information */}
                          {booking.payments.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-2">Payment Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {booking.payments.map((payment, paymentIndex) => (
                                  <div key={paymentIndex} className="text-sm">
                                    <div className="flex justify-between">
                                      <span>Total Bill:</span>
                                      <span className="font-medium">{formatPrice(payment.totalBill)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Balance:</span>
                                      <span
                                        className={`font-medium ${
                                          payment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                                        }`}
                                      >
                                        {payment.balanceRemaining > 0
                                          ? formatPrice(payment.balanceRemaining)
                                          : "Fully Paid"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Status:</span>
                                      <Badge
                                        variant={
                                          payment.status === "completed"
                                            ? "default"
                                            : payment.status === "partial"
                                              ? "secondary"
                                              : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {payment.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
