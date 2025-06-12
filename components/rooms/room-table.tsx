"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Clock,
  LayoutGrid,
  GalleryHorizontal,
  Loader2,
  Grid3X3,
  List,
} from "lucide-react"
import { EditRoomDialog } from "@/components/rooms/edit-room-dialog"
import { ImageGallery } from "@/components/rooms/image-gallery"
import { deleteRoom } from "@/actions/room"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"

// Define types based on Prisma models
interface RoomCategory {
  id: string
  name: string
  createdAt: Date
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
}

interface RoomTableProps {
  initialRooms: Room[]
  roomCategories: RoomCategory[]
}

type SortField = "roomNumber" | "category" | "price" | "createdAt"
type SortDirection = "asc" | "desc"
type ViewMode = "table" | "grid"

interface SortOption {
  label: string
  field: SortField
  direction: SortDirection
  icon: React.ReactNode
}

export function RoomTable({ initialRooms, roomCategories }: RoomTableProps) {
  const { currency, formatPrice } = useCurrency()
  const { t } = useLanguage()

  // Initialize with no defaults - let users choose their preferences
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [showRowsMenu, setShowRowsMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load user preferences from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("roomTableViewMode") as ViewMode | null
      const savedRowsPerPage = localStorage.getItem("roomTableRowsPerPage")
      const savedSortField = localStorage.getItem("roomTableSortField") as SortField | null
      const savedSortDirection = localStorage.getItem("roomTableSortDirection") as SortDirection | null

      if (savedViewMode) setViewMode(savedViewMode)
      if (savedRowsPerPage) setRowsPerPage(Number.parseInt(savedRowsPerPage))
      if (savedSortField) setSortField(savedSortField)
      if (savedSortDirection) setSortDirection(savedSortDirection)

      setIsInitialized(true)
    }
  }, [])

  // Save user preferences to localStorage when they change (only after initialization)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("roomTableViewMode", viewMode)
    }
  }, [viewMode, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("roomTableRowsPerPage", rowsPerPage.toString())
    }
  }, [rowsPerPage, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("roomTableSortField", sortField)
    }
  }, [sortField, isInitialized])

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("roomTableSortDirection", sortDirection)
    }
  }, [sortDirection, isInitialized])

  // Update rooms when initialRooms changes
  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  // Sort options
  const sortOptions: SortOption[] = [
    {
      label: t("roomTable.sortOptions.roomNumberAsc"),
      field: "roomNumber",
      direction: "asc",
      icon: <ArrowUp className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.roomNumberDesc"),
      field: "roomNumber",
      direction: "desc",
      icon: <ArrowDown className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.categoryAsc"),
      field: "category",
      direction: "asc",
      icon: <ArrowUp className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.categoryDesc"),
      field: "category",
      direction: "desc",
      icon: <ArrowDown className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.priceLowHigh"),
      field: "price",
      direction: "asc",
      icon: <ArrowUp className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.priceHighLow"),
      field: "price",
      direction: "desc",
      icon: <ArrowDown className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.newestFirst"),
      field: "createdAt",
      direction: "desc",
      icon: <Clock className="h-4 w-4 ml-2" />,
    },
    {
      label: t("roomTable.sortOptions.oldestFirst"),
      field: "createdAt",
      direction: "asc",
      icon: <Clock className="h-4 w-4 ml-2" />,
    },
  ]

  useEffect(() => {
    // Filter and sort rooms
    let result = [...rooms]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((room) => {
        const categoryName = getCategoryName(room.categoryId).toLowerCase()
        return (
          room.roomNumber.toLowerCase().includes(term) ||
          categoryName.includes(term) ||
          room.description.toLowerCase().includes(term)
        )
      })
    }

    // Apply sorting
    result = sortRooms(result, sortField, sortDirection)

    setFilteredRooms(result)
    // Reset to first page when search or sort changes
    setCurrentPage(1)
  }, [searchTerm, rooms, sortField, sortDirection])

  // Function to sort rooms
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
        case "price":
          comparison = a.price - b.price
          break
        case "createdAt":
          // Convert to timestamps for comparison
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = timeA - timeB
          break
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  // Function to handle sort selection
  const handleSortSelect = (option: SortOption) => {
    setSortField(option.field)
    setSortDirection(option.direction)
    setShowSortMenu(false)
  }

  // Function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = roomCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : t("roomTable.unknownCategory")
  }

  // Function to truncate description to about 3 words
  const truncateDescription = (description: string) => {
    const words = description.split(" ")
    if (words.length <= 3) return description
    return words.slice(0, 3).join(" ") + "..."
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailsOpen(true)
  }

  const handleEdit = (room: Room) => {
    setRoomToEdit(room)
    setIsEditOpen(true)
  }

  const handleDelete = async (roomId: string) => {
    setRoomToDelete(roomId)
  }

  const handleViewGallery = (room: Room) => {
    setSelectedRoom(room)
    setIsGalleryOpen(true)
  }

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.field === sortField && opt.direction === sortDirection)
    return option ? option.label : "Sort Rooms"
  }

  // Pagination logic
  const indexOfLastRoom = currentPage * rowsPerPage
  const indexOfFirstRoom = indexOfLastRoom - rowsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage)

  // Grid Card Component
  const RoomCard = ({ room }: { room: Room }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t("roomTable.openMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("roomTable.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(room)}>
                <Edit className="mr-2 h-4 w-4" />
                {t("roomTable.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewGallery(room)}>
                <GalleryHorizontal className="mr-2 h-4 w-4" />
                {t("roomTable.viewImages")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(room.id)} className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                {t("roomTable.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span>{getCategoryName(room.categoryId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">{formatPrice(room.price)}</span>
          </div>
        </div>

        {room.description && <p className="text-sm text-muted-foreground truncate">{room.description}</p>}
      </div>
    </div>
  )

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Search and Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("roomTable.searchPlaceholder")}
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
                <span className="hidden sm:inline ml-2">{t("roomTable.table")}</span>
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">{t("roomTable.grid")}</span>
              </Button>
            </div>

            {/* Rows per page selector */}
            <div className="relative">
              <button
                type="button"
                className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setShowRowsMenu(!showRowsMenu)}
              >
                <span className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("roomTable.rows")}: </span>
                  <span>{rowsPerPage}</span>
                </span>
              </button>

              {showRowsMenu && (
                <div className="absolute left-0 z-50 mt-1 w-32 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div className="p-1">
                    {[5, 10, 15, 20, 50, 100].map((value) => (
                      <div
                        key={value}
                        className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                          rowsPerPage === value ? "bg-accent text-accent-foreground" : ""
                        }`}
                        onClick={() => {
                          setRowsPerPage(value)
                          setShowRowsMenu(false)
                          setCurrentPage(1)
                        }}
                      >
                        {value} rows
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort selector */}
            <div className="relative">
              <button
                type="button"
                className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t("roomTable.sort")}</span>
                </span>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 z-50 mt-1 w-56 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div className="p-1">
                    {sortOptions.map((option, index) => (
                      <div
                        key={index}
                        className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                          sortField === option.field && sortDirection === option.direction
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                        onClick={() => handleSortSelect(option)}
                      >
                        <span className="flex items-center justify-between w-full">
                          {option.label}
                          {option.icon}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className="text-sm text-muted-foreground">
            {filteredRooms.length} {t("roomTable.resultsFound")}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "table" ? (
        <div className="w-full">
          {/* Table Container with proper overflow handling */}
          <div className="border rounded-lg bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">{t("roomTable.image")}</TableHead>
                      <TableHead className="min-w-[100px]">{t("roomTable.room")}</TableHead>
                      <TableHead className="min-w-[120px]">{t("roomTable.category")}</TableHead>
                      <TableHead className="min-w-[100px]">{t("roomTable.price")}</TableHead>
                      <TableHead className="min-w-[200px]">{t("roomTable.description")}</TableHead>
                      <TableHead className="w-20">{t("roomTable.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentRooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {searchTerm.trim() !== ""
                            ? `${t("roomTable.noRoomsMatching")} "${searchTerm}"`
                            : t("roomTable.noRoomsFound")}
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
                                  <span className="sr-only">{t("roomTable.openMenu")}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("roomTable.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(room)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t("roomTable.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewGallery(room)}>
                                  <GalleryHorizontal className="mr-2 h-4 w-4" />
                                  {t("roomTable.viewImages")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(room.id)} className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  {t("roomTable.delete")}
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentRooms.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {searchTerm.trim() !== ""
                ? `${t("roomTable.noRoomsMatching")} "${searchTerm}"`
                : t("roomTable.noRoomsFound")}
            </div>
          ) : (
            currentRooms.map((room) => <RoomCard key={room.id} room={room} />)
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {t("roomTable.showing")} {indexOfFirstRoom + 1}-{Math.min(indexOfLastRoom, filteredRooms.length)}{" "}
            {t("roomTable.of")} {filteredRooms.length} {t("roomTable.rooms")}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t("roomTable.previous")}</span>
            </Button>
            <span className="text-sm px-2">
              {t("roomTable.page")} {currentPage} {t("roomTable.of")} {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <span className="hidden sm:inline mr-1">{t("roomTable.next")}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Room Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{t("roomTable.roomDetails")}</DialogTitle>
            <DialogDescription>{t("roomTable.roomDetailsDescription")}</DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto pr-1 flex-1">
                <div className="space-y-4 py-4">
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="mb-4">
                      <img
                        src={selectedRoom.images[0] || "/placeholder.svg"}
                        alt={`Room ${selectedRoom.roomNumber}`}
                        className="w-full h-48 sm:h-64 object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 sm:h-64 bg-muted flex items-center justify-center rounded-md mb-4">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div className="font-medium">{t("roomTable.roomNumber")}:</div>
                      <div className="sm:col-span-2">{selectedRoom.roomNumber}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div className="font-medium">{t("roomTable.category")}:</div>
                      <div className="sm:col-span-2">{getCategoryName(selectedRoom.categoryId)}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div className="font-medium">{t("roomTable.price")}:</div>
                      <div className="sm:col-span-2">{formatPrice(selectedRoom.price)}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                      <div className="font-medium">{t("roomTable.description")}:</div>
                      <div className="sm:col-span-2">{selectedRoom.description}</div>
                    </div>
                    {selectedRoom.createdAt && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                        <div className="font-medium">{t("roomTable.createdAt")}:</div>
                        <div className="sm:col-span-2">{new Date(selectedRoom.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 border-t mt-2">
                <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleViewGallery(selectedRoom)}
                    className="w-full sm:w-auto"
                  >
                    <GalleryHorizontal className="mr-2 h-4 w-4" />
                    {t("roomTable.viewImages")}
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(selectedRoom)} className="w-full sm:w-auto">
                    <Edit className="mr-2 h-4 w-4" />
                    {t("roomTable.edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setRoomToDelete(selectedRoom.id)}
                    disabled={isDeleting}
                    className="w-full sm:w-auto"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("roomTable.deleting")}
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" />
                        {t("roomTable.delete")}
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditRoomDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        room={roomToEdit}
        roomCategories={roomCategories}
        onRoomUpdated={(updatedRoom) => {
          // Update the room in the local state
          setRooms(rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))

          // If this room is currently selected in the details view, update it there too
          if (selectedRoom && selectedRoom.id === updatedRoom.id) {
            setSelectedRoom(updatedRoom)
          }
        }}
      />

      {selectedRoom && (
        <ImageGallery images={selectedRoom.images || []} open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
      )}

      {roomToDelete && (
        <Dialog open={true} onOpenChange={() => setRoomToDelete(null)}>
          <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>{t("roomTable.confirmDeletion")}</DialogTitle>
              <DialogDescription>{t("roomTable.deleteConfirmMessage")}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setRoomToDelete(null)} className="w-full sm:w-auto">
                {t("roomTable.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setIsDeleting(true)
                  try {
                    const result = await deleteRoom(roomToDelete)
                    if (result.success) {
                      setRooms(rooms.filter((room) => room.id !== roomToDelete))
                      toast.success("The room has been successfully deleted")
                      if (isDetailsOpen && selectedRoom?.id === roomToDelete) {
                        setIsDetailsOpen(false)
                      }
                    } else {
                      toast.error("Failed to delete room")
                    }
                  } catch (error) {
                    toast.error("An unexpected error occurred")
                  } finally {
                    setIsDeleting(false)
                    setRoomToDelete(null)
                  }
                }}
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("roomTable.deleting")}
                  </>
                ) : (
                  t("roomTable.delete")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
