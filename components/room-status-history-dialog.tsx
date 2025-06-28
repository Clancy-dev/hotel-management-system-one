"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react"
// import { getRoomStatusHistoryByDate, type RoomStatusHistoryEntry } from "@/lib/room-status-history"
import { format } from "date-fns"
import { getRoomStatusHistoryByDate, RoomStatusHistoryEntry } from "@/lib/room-status-history"

interface Room {
  id: string
  number: string
  type: string
  status: string
  guest: string | null
  checkOut: string | null
  nextReservation: string
  price: number
  amenities: string[]
  images: string[]
  bedType?: string
  size?: string
  maxOccupancy?: number
  description?: string
}

interface RoomStatusHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function RoomStatusHistoryDialog({ open, onOpenChange, room }: RoomStatusHistoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("all")
  const [history, setHistory] = useState<RoomStatusHistoryEntry[]>([])
  const [filteredHistory, setFilteredHistory] = useState<RoomStatusHistoryEntry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  useEffect(() => {
    if (room && open) {
      const roomHistory = getRoomStatusHistoryByDate(room.id, selectedDate)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "reserved":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "booked":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "dirty":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "maintenance":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "out-of-order":
        return "bg-black text-white"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getActionIcon = () => {
    return <RefreshCw className="h-4 w-4 text-blue-600" />
  }

  const getActionColor = () => {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
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
            <RefreshCw className="h-6 w-6" />
            Room {room.number} Status History
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
                  {filteredHistory.length} status change{filteredHistory.length !== 1 ? "s" : ""} found
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing status history for {format(selectedDate, "MMMM dd, yyyy")}
            {selectedTime !== "all" && <span> • {timeOptions.find((opt) => opt.value === selectedTime)?.label}</span>}
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Status Changes Found</h3>
                  <p className="text-muted-foreground text-center">
                    No status changes found for Room {room.number} on {format(selectedDate, "MMMM dd, yyyy")}
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
                          {getActionIcon()}
                          <div>
                            <CardTitle className="text-lg">Status Changed</CardTitle>
                            <p className="text-sm text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatTime(entry.timestamp)}
                          </Badge>
                          <Badge className={getActionColor()}>status-changed</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status Change Details */}
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-3">Status Change Details:</p>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Previous Status:</p>
                            <Badge className={`${getStatusColor(entry.changes[0].oldValue)} text-sm`}>
                              {entry.changes[0].oldValue}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">New Status:</p>
                            <Badge className={`${getStatusColor(entry.changes[0].newValue)} text-sm`}>
                              {entry.changes[0].newValue}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Room State at Time of Change */}
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                          <Badge className={getStatusColor(entry.data.status)}>{entry.data.status}</Badge>
                        </div>
                        {entry.data.guest && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Guest</p>
                            <p className="text-sm">{entry.data.guest}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Next Reservation</p>
                          <p className="text-sm">{entry.data.nextReservation}</p>
                        </div>
                      </div>

                      {entry.data.checkOut && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Check-out Time</p>
                          <p className="text-sm">{entry.data.checkOut}</p>
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
                {filteredHistory.length} status changes
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
              <h4 className="font-medium mb-2">Status History Summary</h4>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Status Changes:</span>
                  <span className="ml-2 font-medium">{filteredHistory.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2 font-medium">{format(selectedDate, "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
