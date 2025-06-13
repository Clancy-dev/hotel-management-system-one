"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  List,
  Loader2,
  Grid3X3,
  Filter,
  ImageIcon,
} from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { UpdateRoomStatusDialog } from "./update-room-status-dialog"
import { GuestBookingDialog } from "./guest-booking-dialog"
import { RoomDetailsDialog } from "./room-details-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getRoomStatusHistory } from "@/actions/room-status"

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface RoomCategory {
  id: string
  name: string
}

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: RoomCategory
  currentStatus?: RoomStatus
}

interface RoomStatusTableProps {
  initialRooms: Room[]
  roomStatuses: RoomStatus[]
  roomCategories: RoomCategory[]
}

type SortField = "roomNumber" | "category" | "status" | "price" | "createdAt"
type SortDirection = "asc" | "desc"
type ViewMode = "table" | "grid"

export function RoomStatusTable({ initialRooms, roomStatuses, roomCategories }: RoomStatusTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms)
  const [sortField, setSortField] = useState<SortField>("roomNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10)
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "grid" : "table")
  const [isInitialized, setIsInitialized] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("roomStatusTableViewMode") as ViewMode | null
      const savedRowsPerPage = localStorage.getItem("roomStatusTableRowsPerPage")
      const savedSortField = localStorage.getItem("roomStatusTableSortField") as SortField | null
      const savedSortDirection = localStorage.getItem("roomStatusTableSortDirection") as SortDirection | null

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
      localStorage.setItem("roomStatusTableViewMode", viewMode)
      localStorage.setItem("roomStatusTableRowsPerPage", rowsPerPage.toString())
      localStorage.setItem("roomStatusTableSortField", sortField)
      localStorage.setItem("roomStatusTableSortDirection", sortDirection)
    }
  }, [viewMode, rowsPerPage, sortField, sortDirection, isInitialized])

  // Update rooms when initialRooms changes
  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  // Filter and sort rooms
  useEffect(() => {
    let result = [...rooms]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((room) => {
        const categoryName = getCategoryName(room.categoryId).toLowerCase()
        const statusName = (room.currentStatus?.name || "No Status").toLowerCase()
        return (
          room.roomNumber.toLowerCase().includes(term) ||
          categoryName.includes(term) ||
          statusName.includes(term) ||
          room.description.toLowerCase().includes(term)
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((room) => room.currentStatus?.id === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((room) => room.categoryId === categoryFilter)
    }

    // Apply sorting
    result = sortRooms(result, sortField, sortDirection)

    setFilteredRooms(result)
    setCurrentPage(1)
  }, [searchTerm, rooms, sortField, sortDirection, statusFilter, categoryFilter])

  const sortRooms = (roomsToSort: Room[], field: SortField, direction: SortDirection): Room[] => {
    return [...roomsToSort].sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "roomNumber":
          comparison = a.roomNumber.localeCompare(b.roomNumber)
          break
        case "category":
          const categoryA = getCategoryName(a.categoryId)
          const categoryB = getCategoryName(b.categoryId)
          comparison = categoryA.localeCompare(categoryB)
          break
        case "status":
          const statusA = a.currentStatus?.name || "No Status"
          const statusB = b.currentStatus?.name || "No Status"
          comparison = statusA.localeCompare(statusB)
          break
        case "price":
          comparison = a.price - b.price
          break
        case "createdAt":
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = timeA - timeB
          break
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = roomCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  const getStatusBadge = (status?: RoomStatus) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="text-xs">
          No Status
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-xs text-white" style={{ backgroundColor: status.color }}>
        {status.name}
      </Badge>
    )
  }

  const handleUpdateStatus = (room: Room) => {
    setSelectedRoom(room)
    setIsUpdateStatusOpen(true)
  }

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsBookingOpen(true)
  }

  const handleViewDetails = async (room: Room) => {
    setSelectedRoom(room)
    setIsLoadingHistory(true)

    try {
      // Fetch room status history
      const historyResult = await getRoomStatusHistory(room.id)
      if (historyResult.success && historyResult.data) {
        setStatusHistory(historyResult.data)
      } else {
        setStatusHistory([])
      }
    } catch (error) {
      console.error("Failed to fetch room status history:", error)
      setStatusHistory([])
    } finally {
      setIsLoadingHistory(false)
      setIsDetailsOpen(true)
    }
  }

  const handleRoomStatusUpdated = (updatedRoom: Room) => {
    // Ensure currentStatus has all required properties
    let fixedStatus: RoomStatus | undefined = undefined
    if (updatedRoom.currentStatus) {
      // Try to find the full status object from roomStatuses by id
      fixedStatus = roomStatuses.find((status) => status.id === updatedRoom.currentStatus?.id)
        // fallback to the provided status if not found, but add isDefault as false
        ?? { ...updatedRoom.currentStatus, isDefault: false }
    }
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === updatedRoom.id ? { ...room, currentStatus: fixedStatus } : room,
      ),
    )
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setSortField("roomNumber")
    setSortDirection("asc")
  }

  // Pagination logic
  const indexOfLastRoom = currentPage * rowsPerPage
  const indexOfFirstRoom = indexOfLastRoom - rowsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage)

  // Grid Card Component
  const RoomStatusCard = ({ room }: { room: Room }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Room Image */}
      <div className="aspect-video w-full overflow-hidden rounded-md bg-muted mb-3">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0] || "/placeholder.svg"}
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(room)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(room)}>
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            {room.currentStatus?.name === "Available" && (
              <DropdownMenuItem onClick={() => handleBookRoom(room)}>
                <Eye className="mr-2 h-4 w-4" />
                Book Room
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(room.currentStatus)}
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Category:</span>
          <span className="text-sm">{getCategoryName(room.categoryId)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Price:</span>
          <span className="text-sm font-medium">{formatPrice(room.price)}</span>
        </div>
      </div>

      {room.description && <p className="text-sm text-muted-foreground truncate">{room.description}</p>}
    </div>
  )

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
            placeholder="Search rooms..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Filter by Status</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {roomStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Filter by Category</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {roomCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode and Rows per page */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium">View Mode</label>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none flex-1"
                disabled={isMobile}
              >
                <List className="h-4 w-4 mr-1" />
                <span className="text-xs">Table</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none flex-1"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                <span className="text-xs">Grid</span>
              </Button>
            </div>
          </div>

          {/* Rows per page */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium">Rows per page</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value="5">5 rows</option>
              <option value="10">10 rows</option>
              <option value="15">15 rows</option>
              <option value="20">20 rows</option>
              <option value="50">50 rows</option>
            </select>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
              <Filter className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">{filteredRooms.length} room(s) found</div>
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
                    <TableHead className="w-[60px]">Image</TableHead>
                    <TableHead className="w-[80px]">Room</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Category</TableHead>
                    <TableHead className="w-[80px]">Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all"
                          ? `No rooms found matching your filters`
                          : "No rooms found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>
                          {room.images && room.images.length > 0 ? (
                            <img
                              src={room.images[0] || "/placeholder.svg"}
                              alt={`Room ${room.roomNumber}`}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{room.roomNumber}</TableCell>
                        <TableCell>{getStatusBadge(room.currentStatus)}</TableCell>
                        <TableCell>{getCategoryName(room.categoryId)}</TableCell>
                        <TableCell className="font-medium">{formatPrice(room.price)}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={room.description}>
                            {room.description}
                          </div>
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
                              <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(room)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              {room.currentStatus?.name === "Available" && (
                                <DropdownMenuItem onClick={() => handleBookRoom(room)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Book Room
                                </DropdownMenuItem>
                              )}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentRooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all"
                ? `No rooms found matching your filters`
                : "No rooms found"}
            </div>
          ) : (
            currentRooms.map((room) => <RoomStatusCard key={room.id} room={room} />)
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-xs text-muted-foreground order-2 sm:order-1">
            Showing {indexOfFirstRoom + 1}-{Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length}{" "}
            rooms
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
      <UpdateRoomStatusDialog
        open={isUpdateStatusOpen}
        onOpenChange={setIsUpdateStatusOpen}
        room={selectedRoom}
        roomStatuses={roomStatuses}
        onStatusUpdated={handleRoomStatusUpdated}
      />

      <GuestBookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        room={selectedRoom}
        onBookingCreated={(room) => {
          // Ensure currentStatus has all required properties
          let fixedStatus: RoomStatus | undefined = undefined
          if (room.currentStatus) {
            fixedStatus = roomStatuses.find((status) => status.id === room.currentStatus?.id)
              ?? { ...room.currentStatus, isDefault: false }
          }
          handleRoomStatusUpdated({ ...room, currentStatus: fixedStatus })
        }}
      />

      <RoomDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        room={selectedRoom}
        statusHistory={statusHistory}
      />
    </div>
  )
}
