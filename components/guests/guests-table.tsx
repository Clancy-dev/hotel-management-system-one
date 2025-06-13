"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  User,
  Loader2,
  Edit,
} from "lucide-react"
import { format } from "date-fns"
import { checkOutGuest } from "@/actions/guest"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { GuestDetailsDialog } from "./guest-details-dialog"
import { EditGuestDialog } from "./edit-guest-dialog"

interface Guest {
  id: string
  firstName: string
  lastName: string
  gender: string
  nationality: string
  phoneNumber: string
  email?: string
  bookings: Array<{
    id: string
    checkInDate: Date
    checkOutDate: Date
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
    }>
  }>
}

interface GuestsTableProps {
  initialGuests: Guest[]
}

export function GuestsTable({ initialGuests }: GuestsTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()

  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(guests)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [guestToCheckout, setGuestToCheckout] = useState<Guest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [isGuestDetailsOpen, setIsGuestDetailsOpen] = useState(false)
  const [isEditGuestOpen, setIsEditGuestOpen] = useState(false)
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null)

  // Update guests when initialGuests changes
  useEffect(() => {
    setGuests(initialGuests)
  }, [initialGuests])

  // Filter and search logic
  useEffect(() => {
    let result = [...guests]

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

    setFilteredGuests(result)
    setCurrentPage(1)
  }, [searchTerm, guests])

  // Pagination logic
  const indexOfLastGuest = currentPage * rowsPerPage
  const indexOfFirstGuest = indexOfLastGuest - rowsPerPage
  const currentGuests = filteredGuests.slice(indexOfFirstGuest, indexOfLastGuest)
  const totalPages = Math.ceil(filteredGuests.length / rowsPerPage)

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsDetailsOpen(true)
  }

  const handleCheckout = (guest: Guest) => {
    setGuestToCheckout(guest)
    setIsCheckoutOpen(true)
  }

  const confirmCheckout = async () => {
    if (!guestToCheckout || !guestToCheckout.bookings[0]) return

    setIsCheckingOut(true)
    try {
      const result = await checkOutGuest(guestToCheckout.bookings[0].id)

      if (result.success) {
        toast.success("Guest checked out successfully!")
        setGuests(guests.filter((g) => g.id !== guestToCheckout.id))
        setIsCheckoutOpen(false)
        setGuestToCheckout(null)
      } else {
        toast.error(result.error || "Failed to check out guest")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to check out guest")
    } finally {
      setIsCheckingOut(false)
    }
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
      "Balance",
    ]
    const csvData = filteredGuests.map((guest) => {
      const booking = guest.bookings[0]
      const payment = booking?.payments[0]
      return [
        `${guest.firstName} ${guest.lastName}`,
        guest.nationality,
        guest.phoneNumber,
        guest.email || "N/A",
        booking?.room.roomNumber || "N/A",
        booking?.room.category.name || "N/A",
        booking ? format(new Date(booking.checkInDate), "yyyy-MM-dd") : "N/A",
        booking ? format(new Date(booking.checkOutDate), "yyyy-MM-dd") : "N/A",
        booking?.numberOfGuests || "N/A",
        booking?.purposeOfStay || "N/A",
        payment ? formatPrice(payment.totalBill) : "N/A",
        payment ? formatPrice(payment.balanceRemaining) : "N/A",
      ]
    })

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `current-guests-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewGuestDetails = (guest: Guest) => {
    setSelectedGuestId(guest.id)
    setIsGuestDetailsOpen(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setGuestToEdit(guest)
    setIsEditGuestOpen(true)
  }

  const handleGuestUpdated = () => {
    // Refresh the guests list
    window.location.reload()
  }

  const handleGuestDeleted = () => {
    // Refresh the guests list
    window.location.reload()
  }

  return (
    <div className="w-full space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests by name, phone, email, or room..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredGuests.length} guest(s) found</span>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Guests Table */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Guest Name</TableHead>
                  <TableHead className="min-w-[100px]">Nationality</TableHead>
                  <TableHead className="min-w-[120px]">Contact</TableHead>
                  <TableHead className="min-w-[80px]">Room</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[100px]">Check-in</TableHead>
                  <TableHead className="min-w-[100px]">Check-out</TableHead>
                  <TableHead className="min-w-[80px]">Guests</TableHead>
                  <TableHead className="min-w-[100px]">Balance</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      {searchTerm.trim() !== ""
                        ? `No guests found matching "${searchTerm}"`
                        : "No current guests found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentGuests.map((guest) => {
                    const booking = guest.bookings[0]
                    const payment = booking?.payments[0]
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
                        <TableCell className="font-medium">{booking?.room.roomNumber}</TableCell>
                        <TableCell>{booking?.room.category.name}</TableCell>
                        <TableCell>
                          {booking && (
                            <div className="text-sm">{format(new Date(booking.checkInDate), "MMM dd, yyyy")}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking && (
                            <div className="text-sm">{format(new Date(booking.checkOutDate), "MMM dd, yyyy")}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{booking?.numberOfGuests || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          {payment && (
                            <div className="text-sm">
                              {payment.balanceRemaining > 0 ? (
                                <span className="text-orange-600 font-medium">
                                  {formatPrice(payment.balanceRemaining)}
                                </span>
                              ) : (
                                <span className="text-green-600">Paid</span>
                              )}
                            </div>
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
                              <DropdownMenuItem onClick={() => handleViewGuestDetails(guest)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Full Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Guest
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewDetails(guest)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Booking Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCheckout(guest)}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Check Out
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
      {filteredGuests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {indexOfFirstGuest + 1}-{Math.min(indexOfLastGuest, filteredGuests.length)} of{" "}
            {filteredGuests.length} guests
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
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
        <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Guest Details</DialogTitle>
            <DialogDescription>Complete information about the guest and their booking</DialogDescription>
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

                {/* Booking Information */}
                {selectedGuest.bookings.map((booking, index) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Booking Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Room</label>
                        <p className="font-medium">
                          {booking.room.roomNumber} ({booking.room.category.name})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Number of Guests</label>
                        <p>{booking.numberOfGuests}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
                        <p>{format(new Date(booking.checkInDate), "PPP")}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Check-out Date</label>
                        <p>{format(new Date(booking.checkOutDate), "PPP")}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Purpose of Stay</label>
                        <p className="capitalize">{booking.purposeOfStay.replace("_", " ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Payment Information */}
                {selectedGuest.bookings[0]?.payments.map((payment, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Bill</label>
                        <p className="font-medium">{formatPrice(payment.totalBill)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Balance Remaining</label>
                        <p
                          className={`font-medium ${
                            payment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {payment.balanceRemaining > 0 ? formatPrice(payment.balanceRemaining) : "Fully Paid"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "partial"
                                ? "secondary"
                                : "destructive"
                          }
                          className="ml-2"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Confirm Check-out</DialogTitle>
            <DialogDescription>
              Are you sure you want to check out{" "}
              {guestToCheckout && `${guestToCheckout.firstName} ${guestToCheckout.lastName}`}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will mark the guest as checked out and change the room status to "Dirty" for cleaning.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} disabled={isCheckingOut}>
              Cancel
            </Button>
            <Button onClick={confirmCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking out...
                </>
              ) : (
                "Confirm Check-out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guest Details Dialog */}
      <GuestDetailsDialog
        open={isGuestDetailsOpen}
        onOpenChange={setIsGuestDetailsOpen}
        guestId={selectedGuestId}
        onGuestDeleted={handleGuestDeleted}
        onGuestUpdated={handleGuestUpdated}
      />

      {/* Edit Guest Dialog */}
      <EditGuestDialog
        open={isEditGuestOpen}
        onOpenChange={setIsEditGuestOpen}
        guest={guestToEdit}
        onGuestUpdated={handleGuestUpdated}
      />
    </div>
  )
}
