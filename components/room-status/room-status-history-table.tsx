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
import { ChevronLeft, ChevronRight, Search, CalendarIcon, Download, X, Filter, Eye, ImageIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageGallery } from "../rooms/image-gallery"

interface RoomStatusHistory {
  id: string
  roomId: string
  statusId: string
  previousStatusId?: string
  notes?: string
  changedBy?: string
  changedAt: Date
  room: {
    roomNumber: string
    category: {
      name: string
    }
    images?: string[]
  }
  status: {
    name: string
    color: string
  }
  booking?: {
    guest: {
      firstName: string
      lastName: string
    }
  }
}

interface Room {
  id: string
  roomNumber: string
  category?: {
    name: string
  }
  images?: string[]
}

interface RoomStatusHistoryTableProps {
  initialHistory: RoomStatusHistory[]
  rooms: Room[]
}

export function RoomStatusHistoryTable({ initialHistory, rooms }: RoomStatusHistoryTableProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const isMobile = useMediaQuery("(max-width: 640px)")

  const [history, setHistory] = useState<RoomStatusHistory[]>(initialHistory)
  const [filteredHistory, setFilteredHistory] = useState<RoomStatusHistory[]>(history)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [isFilterExpanded, setIsFilterExpanded] = useState(!isMobile)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RoomStatusHistory | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(history.map((h) => h.status.name))).map((name) => {
    const status = history.find((h) => h.status.name === name)?.status
    return { name, color: status?.color || "#000000" }
  })

  // Update rows per page based on screen size
  useEffect(() => {
    if (isMobile && rowsPerPage > 5) {
      setRowsPerPage(5)
    }
  }, [isMobile, rowsPerPage])

  // Filter and search logic
  useEffect(() => {
    let result = [...history]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((item) => {
        const guestName = item.booking
          ? `${item.booking.guest.firstName} ${item.booking.guest.lastName}`.toLowerCase()
          : ""
        return (
          item.room.roomNumber.toLowerCase().includes(term) ||
          item.room.category.name.toLowerCase().includes(term) ||
          item.status.name.toLowerCase().includes(term) ||
          (item.notes && item.notes.toLowerCase().includes(term)) ||
          (item.changedBy && item.changedBy.toLowerCase().includes(term)) ||
          guestName.includes(term)
        )
      })
    }

    // Apply room filter
    if (selectedRoom !== "all") {
      result = result.filter((item) => item.roomId === selectedRoom)
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status.name === selectedStatus)
    }

    // Apply date filters
    if (dateFrom) {
      result = result.filter((item) => new Date(item.changedAt) >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((item) => new Date(item.changedAt) <= dateTo)
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())

    setFilteredHistory(result)
    setCurrentPage(1)
  }, [searchTerm, selectedRoom, selectedStatus, dateFrom, dateTo, history])

  // Pagination logic
  const indexOfLastItem = currentPage * rowsPerPage
  const indexOfFirstItem = indexOfLastItem - rowsPerPage
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage)

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedRoom("all")
    setSelectedStatus("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const exportToCSV = () => {
    const headers = ["Date", "Room", "Category", "Status", "Previous Status", "Changed By", "Guest", "Notes"]
    const csvData = filteredHistory.map((item) => [
      format(new Date(item.changedAt), "yyyy-MM-dd HH:mm:ss"),
      item.room.roomNumber,
      item.room.category.name,
      item.status.name,
      item.previousStatusId || "N/A",
      item.changedBy || "System",
      item.booking ? `${item.booking.guest.firstName} ${item.booking.guest.lastName}` : "N/A",
      item.notes || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `room-status-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleViewDetails = (item: RoomStatusHistory) => {
    setSelectedHistoryItem(item)
    setIsDetailsOpen(true)
  }

  const handleViewImages = (item: RoomStatusHistory) => {
    setSelectedHistoryItem(item)
    setIsGalleryOpen(true)
  }

  // Mobile history card component
  const HistoryCard = ({ item }: { item: RoomStatusHistory }) => (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-3">
        {/* Room Image */}
        {item.room.images && item.room.images.length > 0 && (
          <div
            className="aspect-video w-full overflow-hidden rounded-md bg-muted mb-3 cursor-pointer"
            onClick={() => handleViewImages(item)}
          >
            <img
              src={item.room.images[0] || "/placeholder.svg"}
              alt={`Room ${item.room.roomNumber}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium">Room {item.room.roomNumber}</div>
            <div className="text-xs text-muted-foreground">{item.room.category.name}</div>
          </div>
          <Badge variant="secondary" className="text-white text-xs" style={{ backgroundColor: item.status.color }}>
            {item.status.name}
          </Badge>
        </div>

        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-mono">{format(new Date(item.changedAt), "MMM dd, yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Changed By:</span>
            <span>{item.changedBy || "System"}</span>
          </div>
          {item.booking && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest:</span>
              <span>
                {item.booking.guest.firstName} {item.booking.guest.lastName}
              </span>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="text-xs">
            <div className="text-muted-foreground mb-1">Notes:</div>
            <p className="italic line-clamp-2">{item.notes}</p>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleViewDetails(item)}>
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
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

          {/* Filter Toggle for Mobile */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full flex items-center justify-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterExpanded ? "Hide Filters" : "Show Filters"}
            </Button>
          )}

          {/* Filter Controls */}
          {isFilterExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Room Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} ({room.category?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status.name} value={status.name}>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                          <span>{status.name}</span>
                        </div>
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
          )}

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <span className="text-sm text-muted-foreground">{filteredHistory.length} record(s) found</span>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table for Desktop */}
      {!isMobile ? (
        <div className="border rounded-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead className="w-[120px]">Date & Time</TableHead>
                  <TableHead className="w-[80px]">Room</TableHead>
                  <TableHead className="w-[100px]">Category</TableHead>
                  <TableHead className="w-[100px]">New Status</TableHead>
                  <TableHead className="w-[100px]">Changed By</TableHead>
                  <TableHead className="w-[120px]">Guest</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      {searchTerm.trim() !== "" ||
                      selectedRoom !== "all" ||
                      selectedStatus !== "all" ||
                      dateFrom ||
                      dateTo
                        ? "No records found matching your filters"
                        : "No status history found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.room.images && item.room.images.length > 0 ? (
                          <div className="cursor-pointer" onClick={() => handleViewImages(item)}>
                            <img
                              src={item.room.images[0] || "/placeholder.svg"}
                              alt={`Room ${item.room.roomNumber}`}
                              className="h-10 w-10 object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-muted flex items-center justify-center rounded">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(item.changedAt), "MMM dd, yyyy")}
                        <br />
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(item.changedAt), "HH:mm:ss")}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{item.room.roomNumber}</TableCell>
                      <TableCell>{item.room.category.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-white text-xs"
                          style={{ backgroundColor: item.status.color }}
                        >
                          {item.status.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{item.changedBy || "System"}</span>
                      </TableCell>
                      <TableCell>
                        {item.booking ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {item.booking.guest.firstName} {item.booking.guest.lastName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          {item.notes ? (
                            <p className="text-sm truncate" title={item.notes}>
                              {item.notes}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">No notes</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(item)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        // Mobile Card View
        <div className="space-y-2">
          {currentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm.trim() !== "" || selectedRoom !== "all" || selectedStatus !== "all" || dateFrom || dateTo
                ? "No records found matching your filters"
                : "No status history found"}
            </div>
          ) : (
            currentItems.map((item) => <HistoryCard key={item.id} item={item} />)
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
              <SelectTrigger className="w-16 h-8">
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

          <div className="text-xs text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredHistory.length)} of{" "}
            {filteredHistory.length} records
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Prev</span>
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

      {/* Status History Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Status Change Details</DialogTitle>
            <DialogDescription>
              {selectedHistoryItem && (
                <>
                  Room {selectedHistoryItem.room.roomNumber} -{" "}
                  {format(new Date(selectedHistoryItem.changedAt), "PPP p")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryItem && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Room Image */}
                {selectedHistoryItem.room.images && selectedHistoryItem.room.images.length > 0 && (
                  <div
                    className="aspect-video w-full overflow-hidden rounded-md bg-muted cursor-pointer"
                    onClick={() => {
                      setIsDetailsOpen(false)
                      setIsGalleryOpen(true)
                    }}
                  >
                    <img
                      src={selectedHistoryItem.room.images[0] || "/placeholder.svg"}
                      alt={`Room ${selectedHistoryItem.room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Status Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Room</h3>
                    <p className="font-medium">
                      {selectedHistoryItem.room.roomNumber} ({selectedHistoryItem.room.category.name})
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge
                      variant="secondary"
                      className="text-white"
                      style={{ backgroundColor: selectedHistoryItem.status.color }}
                    >
                      {selectedHistoryItem.status.name}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Changed By</h3>
                    <p>{selectedHistoryItem.changedBy || "System"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                    <p className="font-mono">{format(new Date(selectedHistoryItem.changedAt), "PPP p")}</p>
                  </div>
                </div>

                {/* Guest Information */}
                {selectedHistoryItem.booking && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Guest</h3>
                    <p>
                      {selectedHistoryItem.booking.guest.firstName} {selectedHistoryItem.booking.guest.lastName}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                  {selectedHistoryItem.notes ? (
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm">
                      {selectedHistoryItem.notes}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No notes provided</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Gallery */}
      {selectedHistoryItem && (
        <ImageGallery
          images={selectedHistoryItem.room.images || []}
          open={isGalleryOpen}
          onOpenChange={setIsGalleryOpen}
        />
      )}
    </div>
  )
}
