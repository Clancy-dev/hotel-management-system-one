"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bed, Search, Filter, MoreHorizontal, Users, Clock, Eye, ImageIcon, RefreshCw, History } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { ImageViewer } from "@/components/image-viewer"
// import { RoomDetailsDialog } from "@/components/room-details-dialog"
// import { RoomStatusHistoryDialog } from "@/components/room-status-history-dialog"
// import { PaginationControls } from "@/components/pagination-controls"
// import { formatCurrency } from "@/lib/currency"
import Image from "next/image"
import { Toaster } from "react-hot-toast"
import { toast } from "react-hot-toast"
import { Wifi, Coffee, Tv, Bath } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { PaginationControls } from "@/components/pagination-controls"
import { RoomStatusHistoryDialog } from "@/components/room-status-history-dialog"
import { RoomDetailsDialog } from "@/components/room-details-dialog"
import { addRoomStatusHistory } from "@/lib/room-status-history"

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
  description?: string
  bedType?: string
  size?: string
  maxOccupancy?: number
  lastCleaned: string
}

export default function RoomStatusPage() {
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [roomDetailsDialogOpen, setRoomDetailsDialogOpen] = useState(false)
  const [roomStatusHistoryDialogOpen, setRoomStatusHistoryDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [viewingImages, setViewingImages] = useState<{ images: string[]; roomNumber: string }>({
    images: [],
    roomNumber: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 8

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      number: "101",
      type: "Standard Single",
      status: "available",
      guest: null,
      checkOut: null,
      nextReservation: "Tomorrow 3:00 PM",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      lastCleaned: "2 hours ago",
    },
    {
      id: "2",
      number: "102",
      type: "Standard Single",
      status: "booked",
      guest: "John Smith",
      checkOut: "Today 11:00 AM",
      nextReservation: "Today 3:00 PM",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      lastCleaned: "Yesterday",
    },
    {
      id: "3",
      number: "103",
      type: "Standard Single",
      status: "maintenance",
      guest: null,
      checkOut: null,
      nextReservation: "Jan 20, 2:00 PM",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: [],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      lastCleaned: "3 days ago",
    },
    {
      id: "4",
      number: "201",
      type: "Deluxe Double",
      status: "reserved",
      guest: null,
      checkOut: null,
      nextReservation: "No upcoming reservations",
      price: 300000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
      lastCleaned: "1 hour ago",
    },
    {
      id: "5",
      number: "202",
      type: "Deluxe Double",
      status: "booked",
      guest: "Sarah Johnson",
      checkOut: "Jan 18, 11:00 AM",
      nextReservation: "Jan 19, 3:00 PM",
      price: 300000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
      lastCleaned: "4 hours ago",
    },
    {
      id: "6",
      number: "203",
      type: "Deluxe Double",
      status: "dirty",
      guest: null,
      checkOut: "1 hour ago",
      nextReservation: "Today 4:00 PM",
      price: 300000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
      lastCleaned: "5 hours ago",
    },
    {
      id: "7",
      number: "301",
      type: "Suite",
      status: "booked",
      guest: "Michael Brown",
      checkOut: "Jan 20, 11:00 AM",
      nextReservation: "Jan 21, 2:00 PM",
      price: 650000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "King Bed",
      size: "600 sq ft",
      maxOccupancy: 2,
      lastCleaned: "6 hours ago",
    },
    {
      id: "8",
      number: "302",
      type: "Suite",
      status: "out-of-order",
      guest: null,
      checkOut: null,
      nextReservation: "Under repair",
      price: 650000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: [],
      bedType: "King Bed",
      size: "600 sq ft",
      maxOccupancy: 2,
      lastCleaned: "1 week ago",
    },
  ])

  // Load rooms from localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem("hotel-rooms")
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms))
    }
  }, [])

  // Save rooms to localStorage
  useEffect(() => {
    localStorage.setItem("hotel-rooms", JSON.stringify(rooms))
  }, [rooms])

  // Calculate room statistics
  const roomStats = [
    {
      status: "Available",
      count: rooms.filter((r) => r.status === "available").length,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    {
      status: "Reserved",
      count: rooms.filter((r) => r.status === "reserved").length,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    },
    {
      status: "Booked",
      count: rooms.filter((r) => r.status === "booked").length,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
    },
    {
      status: "Dirty",
      count: rooms.filter((r) => r.status === "dirty").length,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
    },
    {
      status: "Maintenance",
      count: rooms.filter((r) => r.status === "maintenance").length,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    },
    {
      status: "Out of Order",
      count: rooms.filter((r) => r.status === "out-of-order").length,
      color: "bg-black",
      bgColor: "bg-gray-50",
      textColor: "text-gray-900",
      borderColor: "border-gray-200",
    },
  ]

  // Filter and search rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `room ${room.number}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.guest && room.guest.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "booked":
      case "reserved":
        return <Users className="h-3 w-3" />
      case "maintenance":
        return <Clock className="h-3 w-3" />
      default:
        return <Bed className="h-3 w-3" />
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-3 h-3" />
      case "tv":
        return <Tv className="w-3 h-3" />
      case "ac":
        return <Coffee className="w-3 h-3" />
      case "mini bar":
        return <Coffee className="w-3 h-3" />
      case "balcony":
        return <Bath className="w-3 h-3" />
      default:
        return <Coffee className="w-3 h-3" />
    }
  }

  const handleViewImages = (room: Room) => {
    setViewingImages({ images: room.images, roomNumber: room.number })
    setImageViewerOpen(true)
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setRoomDetailsDialogOpen(true)
  }

  const handleViewStatusHistory = (room: Room) => {
    setSelectedRoom(room)
    setRoomStatusHistoryDialogOpen(true)
  }

  const handleChangeStatus = (room: Room, newStatus: string) => {
    try {
      const oldStatus = room.status

      // Update room status
      setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...r, status: newStatus } : r)))

      // Add to status history
      addRoomStatusHistory(room.id, room.number, oldStatus, newStatus, {
        ...room,
        status: newStatus,
      })

      toast.success(`Room ${room.number} status changed to ${newStatus}`, {
        duration: 4000,
        position: "top-right",
      })
    } catch (error) {
      toast.error(`Failed to change status for Room ${room.number}`, {
        duration: 4000,
        position: "top-right",
      })
    }
  }

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "reserved", label: "Reserved" },
    { value: "booked", label: "Booked" },
    { value: "dirty", label: "Dirty" },
    { value: "maintenance", label: "Maintenance" },
    { value: "out-of-order", label: "Out of Order" },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Room Status</h1>
          <p className="text-muted-foreground">Real-time overview of all room statuses</p>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {roomStats.map((stat) => (
          <Card
            key={stat.status}
            className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setStatusFilter(stat.status.toLowerCase().replace(" ", "-"))}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-xs sm:text-sm font-medium ${stat.textColor}`}>{stat.status}</CardTitle>
              <div className={`w-3 h-3 rounded-full ${stat.color} shadow-sm`}></div>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${stat.textColor}`}>{stat.count}</div>
              <p className="text-xs text-muted-foreground">
                {rooms.length > 0 ? ((stat.count / rooms.length) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms, numbers, types, guests..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="dirty">Dirty</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="out-of-order">Out of Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Room Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedRooms.map((room) => (
          <Card key={room.id} className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.number}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewImages(room)}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Images
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {statusOptions
                          .filter((status) => status.value !== room.status)
                          .map((status) => (
                            <DropdownMenuItem key={status.value} onClick={() => handleChangeStatus(room, status.value)}>
                              <Badge className={`${getStatusColor(status.value)} mr-2`} variant="outline">
                                {status.label}
                              </Badge>
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={() => handleViewStatusHistory(room)}>
                      <History className="mr-2 h-4 w-4" />
                      Room Status History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={room.images[0] || "/placeholder.svg?height=200&width=300"}
                  alt={`Room ${room.number}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(room.price)}</span>
                <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      <span>{getAmenityIcon(amenity)}</span>
                      {amenity}
                    </div>
                  ))}
                  {room.amenities.length > 3 && (
                    <div className="text-xs bg-muted px-2 py-1 rounded">+{room.amenities.length - 3} more</div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Reservation:</span>
                  <span className="text-right text-xs">{room.nextReservation}</span>
                </div>
                {room.guest && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Guest:</span>
                    <span className="text-right text-xs">{room.guest}</span>
                  </div>
                )}
                {room.checkOut && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out:</span>
                    <span className="text-right text-xs">{room.checkOut}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Badge variant="outline" className="text-xs">
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {room.images.length} image{room.images.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rooms found matching your search criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        totalItems={filteredRooms.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={() => {}} // Fixed items per page for status view
      />

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
          <CardDescription>Understanding room status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Available</p>
                <p className="text-xs text-muted-foreground">Ready for guests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">Reserved</p>
                <p className="text-xs text-muted-foreground">Reserved by guest</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">Booked</p>
                <p className="text-xs text-muted-foreground">Confirmed booking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="font-medium">Dirty</p>
                <p className="text-xs text-muted-foreground">Needs cleaning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="font-medium">Maintenance</p>
                <p className="text-xs text-muted-foreground">Under repair</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black"></div>
              <div>
                <p className="font-medium">Out of Order</p>
                <p className="text-xs text-muted-foreground">Not available</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageViewer
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        images={viewingImages.images}
        roomNumber={viewingImages.roomNumber}
      />

      <RoomDetailsDialog open={roomDetailsDialogOpen} onOpenChange={setRoomDetailsDialogOpen} room={selectedRoom} />

      <RoomStatusHistoryDialog
        open={roomStatusHistoryDialogOpen}
        onOpenChange={setRoomStatusHistoryDialogOpen}
        room={selectedRoom}
      />
    </div>
  )
}
