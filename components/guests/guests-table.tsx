"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Search, Loader2, Grid3X3 } from "lucide-react"
import { format } from "date-fns"
import { GuestDetailsDialog } from "./guest-details-dialog"
import { EditGuestDialog } from "./edit-guest-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { deleteGuest } from "@/actions/guest"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface Guest {
  id: string
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date | null
  phoneNumber: string
  email?: string | null
  address?: string | null
  nextOfKin?: string | null
  ninNumber?: string | null
  passportNumber?: string | null
  visaType?: string | null
  visaNumber?: string | null
  drivingPermit?: string | null
  emergencyContact?: string | null
  createdAt: Date
  updatedAt: Date
  bookings: any[]
}

interface GuestsTableProps {
  initialGuests: Guest[]
}

type SortField = "name" | "nationality" | "phoneNumber" | "checkInDate" | "checkOutDate" | "roomNumber"
type SortDirection = "asc" | "desc"
type ViewMode = "table" | "grid"

export function GuestsTable({ initialGuests }: GuestsTableProps) {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10)
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "grid" : "table")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("guestsTableViewMode") as ViewMode | null
      const savedRowsPerPage = localStorage.getItem("guestsTableRowsPerPage")
      const savedSortField = localStorage.getItem("guestsTableSortField") as SortField | null
      const savedSortDirection = localStorage.getItem("guestsTableSortDirection") as SortDirection | null

      if (savedViewMode) setViewMode(savedViewMode)
      if (savedRowsPerPage) setRowsPerPage(Number.parseInt(savedRowsPerPage))
      if (savedSortField) setSortField(savedSortField)
      if (savedSortDirection) setSortDirection(savedSortDirection)

      setIsInitialized(true)
    }
  }, [])

  // Update view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode("grid")
      if (rowsPerPage > 5) setRowsPerPage(5)
    }
  }, [isMobile, rowsPerPage])

  // Save user preferences to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("guestsTableViewMode", viewMode)
      localStorage.setItem("guestsTableRowsPerPage", rowsPerPage.toString())
      localStorage.setItem("guestsTableSortField", sortField)
      localStorage.setItem("guestsTableSortDirection", sortDirection)
    }
  }, [viewMode, rowsPerPage, sortField, sortDirection, isInitialized])

  // Update guests when initialGuests changes
  useEffect(() => {
    if (initialGuests && initialGuests.length > 0) {
      setGuests(initialGuests)
    }
  }, [initialGuests])

  // Filter and sort guests
  useEffect(() => {
    let result = [...guests]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((guest) => {
        const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
        return (
          fullName.includes(term) ||
          guest.nationality.toLowerCase().includes(term) ||
          guest.phoneNumber.includes(term) ||
          (guest.email && guest.email.toLowerCase().includes(term))
        )
      })
    }

    // Apply sorting
    result = sortGuests(result, sortField, sortDirection)

    setFilteredGuests(result)
    setCurrentPage(1)
  }, [searchTerm, guests, sortField, sortDirection])

  const sortGuests = (guestsToSort: Guest[], field: SortField, direction: SortDirection): Guest[] => {
    return [...guestsToSort].sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "name":
          const nameA = `${a.firstName} ${a.lastName}`
          const nameB = `${b.firstName} ${b.lastName}`
          comparison = nameA.localeCompare(nameB)
          break
        case "nationality":
          comparison = a.nationality.localeCompare(b.nationality)
          break
        case "phoneNumber":
          comparison = a.phoneNumber.localeCompare(b.phoneNumber)
          break
        case "checkInDate":
          const checkInA = a.bookings[0]?.checkInDate ? new Date(a.bookings[0].checkInDate).getTime() : 0
          const checkInB = b.bookings[0]?.checkInDate ? new Date(b.bookings[0].checkInDate).getTime() : 0
          comparison = checkInA - checkInB
          break
        case "checkOutDate":
          const checkOutA = a.bookings[0]?.checkOutDate ? new Date(a.bookings[0].checkOutDate).getTime() : 0
          const checkOutB = b.bookings[0]?.checkOutDate ? new Date(b.bookings[0].checkOutDate).getTime() : 0
          comparison = checkOutA - checkOutB
          break
        case "roomNumber":
          const roomA = a.bookings[0]?.room?.roomNumber || ""
          const roomB = b.bookings[0]?.room?.roomNumber || ""
          comparison = roomA.localeCompare(roomB)
          break
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsDetailsOpen(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsEditOpen(true)
  }

  const handleDeleteGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteGuest = async () => {
    if (!selectedGuest) return

    setIsDeleting(true)
    try {
      const result = await deleteGuest(selectedGuest.id)
      if (result.success) {
        toast.success("Guest deleted successfully")
        setGuests((prevGuests) => prevGuests.filter((g) => g.id !== selectedGuest.id))
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete guest")
      }
    } catch (error) {
      console.error("Error deleting guest:", error)
      toast.error("An error occurred while deleting the guest")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGuestUpdated = (updatedGuest: Guest) => {
    setGuests((prevGuests) =>
      prevGuests.map((guest) =>
        guest.id === updatedGuest.id
          ? {
              ...guest,
              ...updatedGuest,
              bookings: updatedGuest.bookings || guest.bookings,
            }
          : guest,
      ),
    )
    router.refresh()
  }

  // Pagination logic
  const indexOfLastGuest = currentPage * rowsPerPage
  const indexOfFirstGuest = indexOfLastGuest - rowsPerPage
  const currentGuests = filteredGuests.slice(indexOfFirstGuest, indexOfLastGuest)
  const totalPages = Math.ceil(filteredGuests.length / rowsPerPage)

  // Grid Card Component
  const GuestCard = ({ guest }: { guest: Guest }) => {
    const activeBooking = guest.bookings && guest.bookings.length > 0 ? guest.bookings[0] : null

    return (
      <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            {guest.firstName} {guest.lastName}
          </h3>
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
              <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Guest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteGuest(guest)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Guest
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Nationality:</span>
            <span className="text-sm">{guest.nationality}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Phone:</span>
            <span className="text-sm">{guest.phoneNumber}</span>
          </div>
          {activeBooking && (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Room:</span>
                <span className="text-sm">{activeBooking.room?.roomNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Check-in:</span>
                <span className="text-sm">
                  {activeBooking.checkInDate ? format(new Date(activeBooking.checkInDate), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Check-out:</span>
                <span className="text-sm">
                  {activeBooking.checkOutDate ? format(new Date(activeBooking.checkOutDate), "MMM d, yyyy") : "N/A"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Search and Controls */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            {!isMobile && (
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <Table className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">Table</span>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">Grid</span>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded-md border border-input bg-background px-3 text-xs"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="15">15 per page</option>
              <option value="20">20 per page</option>
            </select>
            <span className="text-xs text-muted-foreground">{filteredGuests.length} guest(s)</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "table" && !isMobile ? (
        <div className="w-full overflow-hidden">
          <div className="border rounded-lg bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Guest Name</TableHead>
                    <TableHead className="w-[120px]">Nationality</TableHead>
                    <TableHead className="w-[120px]">Phone</TableHead>
                    <TableHead className="w-[100px]">Room</TableHead>
                    <TableHead className="w-[120px]">Check-in</TableHead>
                    <TableHead className="w-[120px]">Check-out</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm.trim() !== "" ? `No guests found matching "${searchTerm}"` : "No guests found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentGuests.map((guest) => {
                      const activeBooking = guest.bookings && guest.bookings.length > 0 ? guest.bookings[0] : null
                      return (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </TableCell>
                          <TableCell>{guest.nationality}</TableCell>
                          <TableCell>{guest.phoneNumber}</TableCell>
                          <TableCell>{activeBooking?.room?.roomNumber || "N/A"}</TableCell>
                          <TableCell>
                            {activeBooking?.checkInDate
                              ? format(new Date(activeBooking.checkInDate), "MMM d, yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {activeBooking?.checkOutDate
                              ? format(new Date(activeBooking.checkOutDate), "MMM d, yyyy")
                              : "N/A"}
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
                                <DropdownMenuItem onClick={() => handleEditGuest(guest)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Guest
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteGuest(guest)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Guest
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentGuests.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm.trim() !== "" ? `No guests found matching "${searchTerm}"` : "No guests found"}
            </div>
          ) : (
            currentGuests.map((guest) => <GuestCard key={guest.id} guest={guest} />)
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredGuests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">
            Showing {indexOfFirstGuest + 1}-{Math.min(indexOfLastGuest, filteredGuests.length)} of{" "}
            {filteredGuests.length} guests
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Previous</span>
            </Button>
            <span className="text-xs px-2">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 px-2"
            >
              <span className="sr-only sm:not-sr-only sm:mr-1 text-xs">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <GuestDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} guestId={selectedGuest?.id || null} />
      <EditGuestDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        guest={selectedGuest}
        onGuestUpdated={(updatedGuest) => {
          // Ensure the updated guest has the required properties
          const completeGuest = {
            ...updatedGuest,
            bookings: selectedGuest?.bookings || [],
          }
          handleGuestUpdated(completeGuest)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this guest?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the guest record and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGuest}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
