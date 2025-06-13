"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarIcon,
  Download,
  X,
  Filter,
  Eye,
  ImageIcon,
  Trash2,
  AlertTriangle,
  Images,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ImageGallery } from "../image-gallery"

interface RoomStatusHistory {
  id: string
  roomId: string
  statusId: string
  previousStatusId?: string
  notes?: string
  changedBy?: string
  changedAt: Date
  bookingId?: string
  room: {
    id: string
    roomNumber: string
    categoryId: string
    price: number
    description: string
    images: string[]
    category?: {
      id: string
      name: string
    }
  }
  status: {
    id: string
    name: string
    color: string
    description?: string
  }
  previousStatus?: {
    id: string
    name: string
    color: string
    description?: string
  }
  booking?: {
    id: string
    guestId: string
    guest: {
      id: string
      firstName: string
      lastName: string
    }
  }
}

interface RoomStatusHistoryTableProps {
  initialHistory: RoomStatusHistory[]
  roomStatuses: {
    id: string
    name: string
    color: string
    description?: string
  }[]
  roomCategories: {
    id: string
    name: string
  }[]
}

type SortField = "changedAt" | "roomNumber" | "status" | "category"
type SortDirection = "asc" | "desc"
type ViewMode = "table" | "grid"

export function RoomStatusHistoryTable({ initialHistory, roomStatuses, roomCategories }: RoomStatusHistoryTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const [history, setHistory] = useState<RoomStatusHistory[]>(initialHistory)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredHistory, setFilteredHistory] = useState<RoomStatusHistory[]>([])
  const [sortField, setSortField] = useState<SortField>("changedAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10)
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "grid" : "table")
  const [isInitialized, setIsInitialized] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [selectedHistory, setSelectedHistory] = useState<RoomStatusHistory | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null)

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("roomStatusHistoryTableViewMode") as ViewMode | null
      const savedRowsPerPage = localStorage.getItem("roomStatusHistoryTableRowsPerPage")
      const savedSortField = localStorage.getItem("roomStatusHistoryTableSortField") as SortField | null
      const savedSortDirection = localStorage.getItem("roomStatusHistoryTableSortDirection") as SortDirection | null

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
      localStorage.setItem("roomStatusHistoryTableViewMode", viewMode)
      localStorage.setItem("roomStatusHistoryTableRowsPerPage", rowsPerPage.toString())
      localStorage.setItem("roomStatusHistoryTableSortField", sortField)
      localStorage.setItem("roomStatusHistoryTableSortDirection", sortDirection)
    }
  }, [viewMode, rowsPerPage, sortField, sortDirection, isInitialized])

  // Filter and sort history
  useEffect(() => {
    let result = [...history]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((item) => {
        const roomNumber = item.room.roomNumber.toLowerCase()
        const statusName = item.status.name.toLowerCase()
        const categoryName = getCategoryName(item.room.categoryId).toLowerCase()
        const notes = item.notes?.toLowerCase() || ""
        const changedBy = item.changedBy?.toLowerCase() || ""
        const guestName = item.booking
          ? `${item.booking.guest.firstName} ${item.booking.guest.lastName}`.toLowerCase()
          : ""

        return (
          roomNumber.includes(term) ||
          statusName.includes(term) ||
          categoryName.includes(term) ||
          notes.includes(term) ||
          changedBy.includes(term) ||
          guestName.includes(term)
        )
      })
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.statusId === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.room.categoryId === categoryFilter)
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filterDate.setHours(0, 0, 0, 0)

      result = result.filter((item) => {
        const itemDate = new Date(item.changedAt)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate.getTime() === filterDate.getTime()
      })
    }

    // Apply sorting
    result = sortHistory(result, sortField, sortDirection)

    setFilteredHistory(result)
    setCurrentPage(1)
  }, [searchTerm, history, sortField, sortDirection, statusFilter, categoryFilter, dateFilter])

  const sortHistory = (
    historyToSort: RoomStatusHistory[],
    field: SortField,
    direction: SortDirection,
  ): RoomStatusHistory[] => {
    return [...historyToSort].sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "changedAt":
          const timeA = new Date(a.changedAt).getTime()
          const timeB = new Date(b.changedAt).getTime()
          comparison = timeA - timeB
          break
        case "roomNumber":
          comparison = a.room.roomNumber.localeCompare(b.room.roomNumber)
          break
        case "status":
          comparison = a.status.name.localeCompare(b.status.name)
          break
        case "category":
          const categoryA = getCategoryName(a.room.categoryId)
          const categoryB = getCategoryName(b.room.categoryId)
          comparison = categoryA.localeCompare(categoryB)
          break
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = roomCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  const getStatusBadge = (status: { name: string; color: string }) => {
    return (
      <Badge variant="secondary" className="text-xs text-white" style={{ backgroundColor: status.color }}>
        {status.name}
      </Badge>
    )
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (item: RoomStatusHistory) => {
    setSelectedHistory(item)
    setIsDetailsOpen(true)
  }

  const handleViewImages = (item: RoomStatusHistory) => {
    setSelectedHistory(item)
    setIsGalleryOpen(true)
  }

  const handleDeleteHistory = (id: string) => {
    setHistoryToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteHistory = () => {
    if (historyToDelete) {
      // In a real app, you would call an API to delete the history item
      // For now, we'll just update the local state
      setHistory((prev) => prev.filter((item) => item.id !== historyToDelete))
      toast.success("Status history item deleted successfully")
    }
    setIsDeleteAlertOpen(false)
    setHistoryToDelete(null)
  }

  const handleDeleteAllHistory = () => {
    setIsDeleteAllAlertOpen(true)
  }

  const confirmDeleteAllHistory = () => {
    // In a real app, you would call an API to delete all history items
    // For now, we'll just update the local state
    setHistory([])
    toast.success("All status history deleted successfully")
    setIsDeleteAllAlertOpen(false)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setDateFilter(undefined)
    setSortField("changedAt")
    setSortDirection("desc")
  }

  // Pagination logic
  const indexOfLastItem = currentPage * rowsPerPage
  const indexOfFirstItem = indexOfLastItem - rowsPerPage
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage)

  // Grid Card Component
  const HistoryCard = ({ item }: { item: RoomStatusHistory }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        {item.room.images && item.room.images.length > 0 ? (
          <img
            src={item.room.images[0] || "/placeholder.svg"}
            alt={`Room ${item.room.roomNumber}`}
            className="w-full h-full object-cover"
            onClick={() => handleViewImages(item)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full opacity-90 hover:opacity-100"
            onClick={() => handleDeleteHistory(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Room {item.room.roomNumber}</h3>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleViewDetails(item)}>
            <Eye className="h-3.5 w-3.5 mr-1" />
            Details
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Status:</span>
            {getStatusBadge(item.status)}
          </div>
          {item.previousStatus && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Previous:</span>
              <Badge
                variant="outline"
                className="text-xs"
                style={{ color: item.previousStatus.color, borderColor: item.previousStatus.color }}
              >
                {item.previousStatus.name}
              </Badge>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Category:</span>
            <span className="text-xs">{getCategoryName(item.room.categoryId)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Changed:</span>
            <span className="text-xs">{formatDate(item.changedAt)}</span>
          </div>
          {item.changedBy && (
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">By:</span>
              <span className="text-xs">{item.changedBy}</span>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="w-full">
        {/* Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Room Status History</h2>
            {history.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteAllHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All History
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {roomStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Filter by Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {roomCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium">Filter by Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                    {dateFilter && (
                      <X
                        className="ml-auto h-4 w-4 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDateFilter(undefined)
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
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
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">{filteredHistory.length} record(s) found</div>
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
                      <TableHead className="w-[80px]">Room</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]">Previous</TableHead>
                      <TableHead className="w-[100px]">Category</TableHead>
                      <TableHead className="w-[180px]">Changed At</TableHead>
                      <TableHead className="w-[100px]">Changed By</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {searchTerm.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all" || dateFilter
                            ? `No history found matching your filters`
                            : "No history found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.room.roomNumber}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {item.previousStatus ? (
                              <Badge
                                variant="outline"
                                style={{ color: item.previousStatus.color, borderColor: item.previousStatus.color }}
                              >
                                {item.previousStatus.name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>{getCategoryName(item.room.categoryId)}</TableCell>
                          <TableCell>{formatDate(item.changedAt)}</TableCell>
                          <TableCell>
                            {item.changedBy || <span className="text-xs text-muted-foreground">Unknown</span>}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={item.notes || ""}>
                              {item.notes || <span className="text-xs text-muted-foreground">No notes</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewDetails(item)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => handleDeleteHistory(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
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
            {currentItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {searchTerm.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all" || dateFilter
                  ? `No history found matching your filters`
                  : "No history found"}
              </div>
            ) : (
              currentItems.map((item) => <HistoryCard key={item.id} item={item} />)
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHistory.length)} of{" "}
              {filteredHistory.length} records
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
      </div>

      {/* Details Dialog */}
      {selectedHistory && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Status Change Details</DialogTitle>
              <DialogDescription>Room {selectedHistory.room.roomNumber} status change information</DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-2 space-y-4 overflow-auto max-h-[calc(90vh-120px)]">
              {/* Room Image */}
              <div className="aspect-video w-full overflow-hidden rounded-md bg-muted relative group">
                {selectedHistory.room.images && selectedHistory.room.images.length > 0 ? (
                  <>
                    <img
                      src={selectedHistory.room.images[0] || "/placeholder.svg"}
                      alt={`Room ${selectedHistory.room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                      onClick={() => setIsGalleryOpen(true)}
                    >
                      <Images className="h-4 w-4 mr-2" />
                      View All Images ({selectedHistory.room.images.length})
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">No images available</p>
                  </div>
                )}
              </div>

              {/* Status Change Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Room Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Room Number:</span>
                      <span className="text-sm font-medium">{selectedHistory.room.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm">{getCategoryName(selectedHistory.room.categoryId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="text-sm font-medium">{formatPrice(selectedHistory.room.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Status Change</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New Status:</span>
                      {getStatusBadge(selectedHistory.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Previous Status:</span>
                      {selectedHistory.previousStatus ? (
                        <Badge
                          variant="outline"
                          style={{
                            color: selectedHistory.previousStatus.color,
                            borderColor: selectedHistory.previousStatus.color,
                          }}
                        >
                          {selectedHistory.previousStatus.name}
                        </Badge>
                      ) : (
                        <span className="text-sm">None</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Changed At:</span>
                      <span className="text-sm">{formatDate(selectedHistory.changedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Changed By:</span>
                      <span className="text-sm">{selectedHistory.changedBy || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedHistory.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedHistory.notes}</p>
                </div>
              )}

              {/* Booking Info */}
              {selectedHistory.booking && (
                <div className="space-y-2">
                  <h3 className="font-medium">Booking Information</h3>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Guest: </span>
                      <span className="font-medium">
                        {selectedHistory.booking.guest.firstName} {selectedHistory.booking.guest.lastName}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Booking ID: </span>
                      <span>{selectedHistory.booking.id}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Gallery */}
      {selectedHistory && (
        <ImageGallery images={selectedHistory.room.images || []} open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
      )}

      {/* Delete History Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this status history item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All History Confirmation */}
      <AlertDialog open={isDeleteAllAlertOpen} onOpenChange={setIsDeleteAllAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all status history records? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
