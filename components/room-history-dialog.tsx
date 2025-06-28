"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Edit, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { getRoomHistoryByDate, type RoomHistoryEntry } from "@/lib/room-history"
import { format } from "date-fns"

interface Room {
  id: string
  number: string
  type: string
  status: string
  price: number
  amenities: string[]
  lastCleaned: string
  nextReservation: string
  images: string[]
  bedType?: string
  size?: string
  maxOccupancy?: number
  description?: string
}

interface RoomHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function RoomHistoryDialog({ open, onOpenChange, room }: RoomHistoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("all")
  const [history, setHistory] = useState<RoomHistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<RoomHistoryEntry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Reduced for better UX

  useEffect(() => {
    if (room && open) {
      const roomHistory = getRoomHistoryByDate(room.id, selectedDate)
      setHistory(roomHistory)
      setCurrentPage(1)
    }
  }, [room, selectedDate, open])

  // Filter history by time when selectedTime changes
  useEffect(() => {
    if (selectedTime === "all") {
      setFilteredHistory(history)
    } else {
      const [startHour, endHour] = selectedTime.split("-").map(Number)
      const filtered = history.filter((entry) => {
        const entryHour = entry.timestamp.getHours()
        return entryHour >= startHour && entryHour < endHour
      })
      setFilteredHistory(filtered)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }, [history, selectedTime])

  if (!room) return null

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const formatDateTime = (date: Date) => {
    return format(date, "MMM dd, yyyy 'at' h:mm a")
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-600" />
      case "edited":
        return <Edit className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "edited":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const timeOptions = [
    { value: "all", label: "All Day" },
    { value: "0-6", label: "12:00 AM - 6:00 AM" },
    { value: "6-12", label: "6:00 AM - 12:00 PM" },
    { value: "12-18", label: "12:00 PM - 6:00 PM" },
    { value: "18-24", label: "6:00 PM - 12:00 AM" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Room {room.number} History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date and Time Filters */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="history-date" className="text-sm font-medium">
                  Select Date:
                </label>
              </div>
              <Input
                id="history-date"
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Time Range:</label>
              </div>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Results:</label>
              </div>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                <span className="text-sm">
                  {filteredHistory.length} record{filteredHistory.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing history for {format(selectedDate, "MMMM dd, yyyy")}
            {selectedTime !== "all" && <span> • {timeOptions.find((opt) => opt.value === selectedTime)?.label}</span>}
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No History Found</h3>
                  <p className="text-muted-foreground text-center">
                    No history records found for Room {room.number} on {format(selectedDate, "MMMM dd, yyyy")}
                    {selectedTime !== "all" && (
                      <span> during {timeOptions.find((opt) => opt.value === selectedTime)?.label.toLowerCase()}</span>
                    )}
                    .
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatedHistory.map((entry) => (
                  <Card key={entry.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getActionIcon(entry.action)}
                          <div>
                            <CardTitle className="text-lg">
                              Room {entry.action === "created" ? "Created" : "Edited"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(entry.timestamp)}
                          </Badge>
                          <Badge className={getActionColor(entry.action)}>{entry.action}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Room Data at Time of Action */}
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Room Type</p>
                          <p className="text-sm">{entry.data.type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Price</p>
                          <p className="text-sm font-semibold">{formatCurrency(entry.data.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Bed Type</p>
                          <p className="text-sm">{entry.data.bedType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Size</p>
                          <p className="text-sm">{entry.data.size}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Max Occupancy</p>
                          <p className="text-sm">{entry.data.maxOccupancy} guests</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Images</p>
                          <p className="text-sm">{entry.data.images.length} image(s)</p>
                        </div>
                      </div>

                      {/* Description */}
                      {entry.data.description && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                          <p className="text-sm bg-muted p-2 rounded">{entry.data.description}</p>
                        </div>
                      )}

                      {/* Amenities */}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Amenities ({entry.data.amenities.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {entry.data.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Changes (for edited entries) */}
                      {entry.action === "edited" && entry.changes && entry.changes.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Changes Made:</p>
                          <div className="space-y-2">
                            {entry.changes.map((change, index) => (
                              <div key={index} className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                <p className="text-sm font-medium capitalize">{change.field} Changed</p>
                                <div className="grid gap-2 grid-cols-1 md:grid-cols-2 mt-1">
                                  <div>
                                    <p className="text-xs text-muted-foreground">From:</p>
                                    <p className="text-sm">
                                      {Array.isArray(change.oldValue)
                                        ? change.oldValue.join(", ")
                                        : change.field === "price"
                                          ? formatCurrency(change.oldValue)
                                          : String(change.oldValue)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">To:</p>
                                    <p className="text-sm font-medium">
                                      {Array.isArray(change.newValue)
                                        ? change.newValue.join(", ")
                                        : change.field === "price"
                                          ? formatCurrency(change.newValue)
                                          : String(change.newValue)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of{" "}
                {filteredHistory.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Summary */}
          {filteredHistory.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">History Summary</h4>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="ml-2 font-medium">{filteredHistory.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2 font-medium">
                    {filteredHistory.filter((h) => h.action === "created").length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Edited:</span>
                  <span className="ml-2 font-medium">
                    {filteredHistory.filter((h) => h.action === "edited").length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
