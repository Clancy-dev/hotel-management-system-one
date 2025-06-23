"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bed, Search, Filter, MoreHorizontal, Users, Clock, Edit, Trash2, Eye, Plus, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { RoomForm } from "@/components/room-form"
import { ImageViewer } from "@/components/image-viewer"
import { Pagination } from "@/components/pagination"
import { useCurrency } from "@/contexts/currency-context"
import { usePagination } from "@/contexts/pagination-context"
import { useToast } from "@/hooks/use-toast"

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
}

export default function RoomStatusPage() {
  const { formatCurrency } = useCurrency()
  const { itemsPerPage } = usePagination()
  const { toast } = useToast()

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })
  const [roomFormOpen, setRoomFormOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [viewingImages, setViewingImages] = useState<{ images: string[]; roomNumber: string }>({
    images: [],
    roomNumber: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      number: "101",
      type: "Standard Single",
      status: "available",
      guest: null,
      checkOut: null,
      nextReservation: "Tomorrow 3:00 PM",
      price: 120,
      amenities: ["WiFi", "TV", "AC"],
      images: [],
    },
    {
      id: "2",
      number: "102",
      type: "Standard Single",
      status: "occupied",
      guest: "John Smith",
      checkOut: "Today 11:00 AM",
      nextReservation: "Today 3:00 PM",
      price: 120,
      amenities: ["WiFi", "TV", "AC"],
      images: [],
    },
    {
      id: "3",
      number: "103",
      type: "Standard Single",
      status: "maintenance",
      guest: null,
      checkOut: null,
      nextReservation: "Jan 20, 2:00 PM",
      price: 120,
      amenities: ["WiFi", "TV", "AC"],
      images: [],
    },
    {
      id: "4",
      number: "201",
      type: "Deluxe Double",
      status: "available",
      guest: null,
      checkOut: null,
      nextReservation: "No upcoming reservations",
      price: 180,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: [],
    },
    {
      id: "5",
      number: "202",
      type: "Deluxe Double",
      status: "occupied",
      guest: "Sarah Johnson",
      checkOut: "Jan 18, 11:00 AM",
      nextReservation: "Jan 19, 3:00 PM",
      price: 180,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: [],
    },
    {
      id: "6",
      number: "203",
      type: "Deluxe Double",
      status: "dirty",
      guest: null,
      checkOut: "1 hour ago",
      nextReservation: "Today 4:00 PM",
      price: 180,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: [],
    },
    {
      id: "7",
      number: "301",
      type: "Suite",
      status: "occupied",
      guest: "Michael Brown",
      checkOut: "Jan 20, 11:00 AM",
      nextReservation: "Jan 21, 2:00 PM",
      price: 350,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: [],
    },
    {
      id: "8",
      number: "302",
      type: "Suite",
      status: "available",
      guest: null,
      checkOut: null,
      nextReservation: "Jan 22, 3:00 PM",
      price: 350,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: [],
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

  // Filter and search rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.guest && room.guest.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = statusFilter === "all" || room.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, id })
  }

  const confirmDelete = () => {
    if (deleteDialog.id) {
      setRooms((prev) => prev.filter((room) => room.id !== deleteDialog.id))
      toast({
        title: "Room deleted",
        description: "The room has been successfully deleted.",
      })
    }
    setDeleteDialog({ open: false, id: null })
  }

  const handleCreateRoom = (data: any) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      number: data.number,
      type: data.type,
      status: data.status,
      guest: null,
      checkOut: null,
      nextReservation: "No upcoming reservations",
      price: data.price,
      amenities: data.amenities,
      images: data.images,
      description: data.description,
      bedType: data.bedType,
      size: data.size,
      maxOccupancy: data.maxOccupancy,
    }

    setRooms((prev) => [...prev, newRoom])
    toast({
      title: "Room created",
      description: `Room ${data.number} has been successfully created.`,
    })
  }

  const handleEditRoom = (data: any) => {
    if (!editingRoom) return

    setRooms((prev) => prev.map((room) => (room.id === editingRoom.id ? { ...room, ...data } : room)))

    toast({
      title: "Room updated",
      description: `Room ${data.number} has been successfully updated.`,
    })
    setEditingRoom(null)
  }

  const handleViewImages = (room: Room) => {
    setViewingImages({ images: room.images, roomNumber: room.number })
    setImageViewerOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "dirty":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "out-of-order":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "occupied":
        return <Users className="h-3 w-3" />
      case "maintenance":
        return <Clock className="h-3 w-3" />
      default:
        return <Bed className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Room Status</h1>
          <p className="text-muted-foreground">Real-time overview of all room statuses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              className="pl-8 w-full sm:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="dirty">Needs Cleaning</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto" onClick={() => setRoomFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Room</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedRooms.map((room) => (
          <Card key={room.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.number}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewImages(room)}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Images
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingRoom(room)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Room
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Change Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Maintenance
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(room.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center">
                <Badge className={`${getStatusColor(room.status)} flex items-center gap-1`}>
                  {getStatusIcon(room.status)}
                  {room.status}
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-primary">{formatCurrency(room.price)}</p>
                <p className="text-xs text-muted-foreground">per night</p>
              </div>

              {room.guest && (
                <div className="text-center">
                  <p className="text-sm font-medium">{room.guest}</p>
                  <p className="text-xs text-muted-foreground">Current Guest</p>
                </div>
              )}

              {room.checkOut && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Check-out:</p>
                  <p className="text-sm font-medium">{room.checkOut}</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Next Reservation:</p>
                <p className="text-sm">{room.nextReservation}</p>
              </div>

              {room.images.length > 0 && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    <ImageIcon className="mr-1 h-3 w-3" />
                    {room.images.length} image{room.images.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Details
                </Button>
                <Button size="sm" className="flex-1" onClick={() => setEditingRoom(room)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Status Legend</CardTitle>
          <CardDescription>Understanding room status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Available</p>
                <p className="text-xs text-muted-foreground">Ready for guests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">Occupied</p>
                <p className="text-xs text-muted-foreground">Guest checked in</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <p className="font-medium">Maintenance</p>
                <p className="text-xs text-muted-foreground">Under repair</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">Dirty</p>
                <p className="text-xs text-muted-foreground">Needs cleaning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="font-medium">Out of Order</p>
                <p className="text-xs text-muted-foreground">Not available</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RoomForm open={roomFormOpen} onOpenChange={setRoomFormOpen} onSubmit={handleCreateRoom} mode="create" />

      <RoomForm
        open={!!editingRoom}
        onOpenChange={(open) => !open && setEditingRoom(null)}
        room={editingRoom}
        onSubmit={handleEditRoom}
        mode="edit"
      />

      <ImageViewer
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        images={viewingImages.images}
        roomNumber={viewingImages.roomNumber}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="Delete Room"
        description="Are you sure you want to delete this room? This action cannot be undone and will affect all related reservations."
        onConfirm={confirmDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
