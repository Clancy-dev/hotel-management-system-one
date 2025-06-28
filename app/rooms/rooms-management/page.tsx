"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Wifi,
  Coffee,
  Tv,
  Bath,
  Plus,
  MoreHorizontal,
  ImageIcon,
  Search,
  Edit,
  Trash2,
  Eye,
  History,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ImageViewer } from "@/components/image-viewer"
import { AddRoomDialog } from "@/components/add-room-dialog"
import { PaginationControls } from "@/components/pagination-controls"
import { formatCurrency } from "@/lib/currency"
import Image from "next/image"
import { Toaster } from "react-hot-toast"
import { toast } from "react-hot-toast"
import { RoomDetailsDialog } from "@/components/room-details-dialog"
import { EditRoomDialog } from "@/components/edit-room-dialog"
import { RoomHistoryDialog } from "@/components/room-history-dialog"
import { DeleteRoomDialog } from "@/components/delete-room-dialog"

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

export default function RoomsPage() {
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewingImages, setViewingImages] = useState<{ images: string[]; roomNumber: string }>({
    images: [],
    roomNumber: "",
  })

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      number: "101",
      type: "Standard Single",
      status: "available",
      price: 150000,
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "2 hours ago",
      nextReservation: "Tomorrow 3:00 PM",
      images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
    },
    {
      id: "2",
      number: "205",
      type: "Deluxe Double",
      status: "booked",
      price: 300000,
      amenities: ["Wifi", "TV", "AC", "Mini Bar"],
      lastCleaned: "Yesterday",
      nextReservation: "Jan 20, 11:00 AM",
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
    },
    {
      id: "3",
      number: "301",
      type: "Executive Suite",
      status: "maintenance",
      price: 650000,
      amenities: ["Wifi", "TV", "AC", "Mini Bar", "Balcony"],
      lastCleaned: "3 days ago",
      nextReservation: "Jan 18, 2:00 PM",
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "King Bed",
      size: "600 sq ft",
      maxOccupancy: 2,
    },
    {
      id: "4",
      number: "102",
      type: "Standard Single",
      status: "reserved",
      price: 150000,
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "1 hour ago",
      nextReservation: "Tomorrow 3:00 PM",
      images: [
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
      ],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
    },
    {
      id: "5",
      number: "103",
      type: "Standard Single",
      status: "dirty",
      price: 150000,
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "4 hours ago",
      nextReservation: "Today 6:00 PM",
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
    },
    {
      id: "6",
      number: "104",
      type: "Standard Single",
      status: "out-of-order",
      price: 150000,
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "1 week ago",
      nextReservation: "Under repair",
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
    },
  ])

  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false)
  const [roomDetailsDialogOpen, setRoomDetailsDialogOpen] = useState(false)
  const [roomHistoryDialogOpen, setRoomHistoryDialogOpen] = useState(false)
  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

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

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setEditRoomDialogOpen(true)
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setRoomDetailsDialogOpen(true)
  }

  const handleViewHistory = (room: Room) => {
    setSelectedRoom(room)
    setRoomHistoryDialogOpen(true)
  }

  const handleDeleteRoom = (room: Room) => {
    setSelectedRoom(room)
    setDeleteRoomDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedRoom) {
      setRooms((prev) => prev.filter((room) => room.id !== selectedRoom.id))
      toast.success(`Room ${selectedRoom.number} deleted successfully!`)
      setDeleteRoomDialogOpen(false)
      setSelectedRoom(null)
    }
  }

  // Add room history to localStorage
  const addRoomHistory = (
    roomId: string,
    roomNumber: string,
    action: string,
    newData: any,
    previousData?: any
  ) => {
    const historyKey = `room-history-${roomId}`
    const history = JSON.parse(localStorage.getItem(historyKey) || "[]")
    history.unshift({
      timestamp: new Date().toISOString(),
      action,
      roomNumber,
      newData,
      previousData,
    })
    localStorage.setItem(historyKey, JSON.stringify(history))
  }

  const handleUpdateRoom = async (roomData: any) => {
    try {
      const previousRoom = rooms.find((r) => r.id === roomData.id)

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomData.id
            ? {
                ...room,
                number: roomData.number,
                type: roomData.type,
                price: roomData.price,
                amenities: roomData.amenities,
                images: roomData.images,
                bedType: roomData.bedType,
                size: roomData.size,
                maxOccupancy: roomData.maxOccupancy,
                description: roomData.description,
              }
            : room,
        ),
      )

      // Add to history
      if (previousRoom) {
        addRoomHistory(roomData.id, roomData.number, "edited", roomData, previousRoom)
      }

      setEditRoomDialogOpen(false)
      setSelectedRoom(null)
    } catch (error) {
      throw error
    }
  }

  const handleAddRoom = async (roomData: any) => {
    try {
      const newRoom: Room = {
        id: Date.now().toString(),
        number: roomData.number,
        type: roomData.type,
        status: "available",
        price: roomData.price,
        amenities: roomData.amenities,
        lastCleaned: "Just now",
        nextReservation: "No upcoming reservations",
        images: roomData.images || ["/placeholder.svg?height=200&width=300"],
        bedType: roomData.bedType,
        size: roomData.size,
        maxOccupancy: roomData.maxOccupancy,
        description: roomData.description,
      }

      // Add new room to the beginning of the array (latest first)
      setRooms((prev) => [newRoom, ...prev])

      // Add to history
      addRoomHistory(newRoom.id, newRoom.number, "created", newRoom)
    } catch (error) {
      throw error
    }
  }

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(
    (room) =>
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `room ${room.number}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rooms Management</h1>
          <p className="text-muted-foreground">Monitor room status, availability, and maintenance</p>
        </div>
        <Button onClick={() => setAddRoomDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rooms... (e.g., Room 101, Standard Single)"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page when searching
          }}
        />
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
                    <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Room
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewHistory(room)}>
                      <History className="mr-2 h-4 w-4" />
                      Room History
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteRoom(room)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Room
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

              <div className="flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(room.price)}</span>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 3).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      {getAmenityIcon(amenity)}
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
          <p className="text-muted-foreground">No rooms found matching your search.</p>
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        totalItems={filteredRooms.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <ImageViewer
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        images={viewingImages.images}
        roomNumber={viewingImages.roomNumber}
      />

      <AddRoomDialog open={addRoomDialogOpen} onOpenChange={setAddRoomDialogOpen} onSubmit={handleAddRoom} />

      <EditRoomDialog
        open={editRoomDialogOpen}
        onOpenChange={setEditRoomDialogOpen}
        room={selectedRoom}
        onSubmit={handleUpdateRoom}
      />

      <RoomDetailsDialog open={roomDetailsDialogOpen} onOpenChange={setRoomDetailsDialogOpen} room={selectedRoom} />

      <RoomHistoryDialog open={roomHistoryDialogOpen} onOpenChange={setRoomHistoryDialogOpen} room={selectedRoom} />

      <DeleteRoomDialog
        open={deleteRoomDialogOpen}
        onOpenChange={setDeleteRoomDialogOpen}
        room={selectedRoom}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
