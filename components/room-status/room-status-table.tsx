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
  ArrowUpDown,
  LayoutGrid,
  List,
  Loader2,
  Grid3X3,
} from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { UpdateRoomStatusDialog } from "./update-room-status-dialog"
import { GuestBookingDialog } from "./guest-booking-dialog"

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

  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms)
  const [sortField, setSortField] = useState<SortField>("roomNumber")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [isInitialized, setIsInitialized] = useState(false)

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

    // Apply sorting
    result = sortRooms(result, sortField, sortDirection)

    setFilteredRooms(result)
    setCurrentPage(1)
  }, [searchTerm, rooms, sortField, sortDirection])

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

  // Pagination logic
  const indexOfLastRoom = currentPage * rowsPerPage
  const indexOfFirstRoom = indexOfLastRoom - rowsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage)

  // Grid Card Component
  const RoomStatusCard = ({ room }: { room: Room }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
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
            placeholder="Search rooms by number, category, status, or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Table</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Grid</span>
              </Button>
            </div>

            {/* Rows per page selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Rows: </span>
                  <span>{rowsPerPage}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {[5, 10, 15, 20, 50, 100].map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => {
                      setRowsPerPage(value)
                      setCurrentPage(1)
                    }}
                  >
                    {value} rows
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("roomNumber")
                    setSortDirection("asc")
                  }}
                >
                  Room Number (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("roomNumber")
                    setSortDirection("desc")
                  }}
                >
                  Room Number (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("status")
                    setSortDirection("asc")
                  }}
                >
                  Status (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("status")
                    setSortDirection("desc")
                  }}
                >
                  Status (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("category")
                    setSortDirection("asc")
                  }}
                >
                  Category (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("category")
                    setSortDirection("desc")
                  }}
                >
                  Category (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("price")
                    setSortDirection("asc")
                  }}
                >
                  Price (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSortField("price")
                    setSortDirection("desc")
                  }}
                >
                  Price (High to Low)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Results Info */}
          <div className="text-sm text-muted-foreground">{filteredRooms.length} room(s) found</div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "table" ? (
        <div className="w-full overflow-hidden">
          <div className="border rounded-lg bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Room</TableHead>
                      <TableHead className="min-w-[120px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Category</TableHead>
                      <TableHead className="min-w-[100px]">Price</TableHead>
                      <TableHead className="min-w-[150px]">Description</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {searchTerm.trim() !== "" ? `No rooms found matching "${searchTerm}"` : "No rooms found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentRooms.map((room) => (
                        <TableRow key={room.id}>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentRooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm.trim() !== "" ? `No rooms found matching "${searchTerm}"` : "No rooms found"}
            </div>
          ) : (
            currentRooms.map((room) => <RoomStatusCard key={room.id} room={room} />)
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {indexOfFirstRoom + 1}-{Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length}{" "}
            rooms
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
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
              <span className="hidden sm:inline mr-1">Next</span>
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
        onStatusUpdated={(updatedRoom) => {
          if (updatedRoom && "id" in updatedRoom) {
            setRooms(rooms.map((room) => (room.id === updatedRoom.id ? (updatedRoom as Room) : room)))
          }
        }}
      />

      <GuestBookingDialog
        open={isBookingOpen}
        onOpenChange={setIsBookingOpen}
        room={selectedRoom}
        onBookingCreated={(updatedRoom) => {
          if (updatedRoom && "id" in updatedRoom) {
            setRooms(rooms.map((room) => (room.id === updatedRoom.id ? (updatedRoom as Room) : room)))
          }
        }}
      />
    </div>
  )
}
