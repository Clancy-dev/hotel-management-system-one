"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Wifi,
  Coffee,
  Tv,
  Bath,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Trash,
  RotateCcw,
  History,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast, Toaster } from "react-hot-toast"

interface RoomTypeHistoryEntry {
  id: string
  roomTypeId: string
  roomTypeName: string
  action: "created" | "edited" | "deleted" | "restored"
  timestamp: number
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  performedBy: string
}

interface RoomType {
  id: string
  name: string
  description: string
  basePrice: number
  maxOccupancy: number
  totalRooms: number
  availableRooms: number
  amenities: string[]
  bedType: string
  size: string
  createdAt: number
  deletedAt?: number
  deletedBy?: string
}

interface Room {
  id: string
  number: string
  type: string
  status: string
}

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [deletedRoomTypes, setDeletedRoomTypes] = useState<RoomType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const itemsPerPageOptions = [5, 10, 15, 20, 50, 100]

  // Dialog states
  const [addRoomTypeDialogOpen, setAddRoomTypeDialogOpen] = useState(false)
  const [viewRoomsDialogOpen, setViewRoomsDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [editRoomTypeDialogOpen, setEditRoomTypeDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [recycleBinDialogOpen, setRecycleBinDialogOpen] = useState(false)

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<RoomType | null>(null)

  // Form state - persisted across dialog closes
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    amenities: [] as string[],
    bedType: "",
    size: "",
  })

  const [roomTypeHistory, setRoomTypeHistory] = useState<RoomTypeHistoryEntry[]>([])
  const [roomTypeHistoryDialogOpen, setRoomTypeHistoryDialogOpen] = useState(false)
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1)
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(5)
  const [viewRoomsCurrentPage, setViewRoomsCurrentPage] = useState(1)
  const [viewRoomsItemsPerPage] = useState(5)

  // Mock rooms data - using logic from room status page
  const [rooms] = useState<Room[]>([
    { id: "1", number: "101", type: "Standard Single", status: "available" },
    { id: "2", number: "102", type: "Standard Single", status: "booked" },
    { id: "3", number: "103", type: "Standard Single", status: "maintenance" },
    { id: "4", number: "201", type: "Deluxe Double", status: "available" },
    { id: "5", number: "202", type: "Deluxe Double", status: "booked" },
    { id: "6", number: "203", type: "Deluxe Double", status: "dirty" },
    { id: "7", number: "301", type: "Family Suite", status: "booked" },
    { id: "8", number: "302", type: "Family Suite", status: "available" },
    { id: "9", number: "401", type: "Executive Suite", status: "available" },
    { id: "10", number: "402", type: "Executive Suite", status: "reserved" },
  ])

  // Initialize with sample data
  useEffect(() => {
    const savedRoomTypes = localStorage.getItem("room-types")
    if (savedRoomTypes) {
      setRoomTypes(JSON.parse(savedRoomTypes))
    } else {
      const sampleRoomTypes: RoomType[] = [
        {
          id: "1",
          name: "Standard Single",
          description: "Comfortable single room with essential amenities",
          basePrice: 150000,
          maxOccupancy: 1,
          totalRooms: 25,
          availableRooms: 8,
          amenities: ["WiFi", "TV", "AC", "Private Bathroom"],
          bedType: "Single Bed",
          size: "200 sq ft",
          createdAt: Date.now() - 86400000,
        },
        {
          id: "2",
          name: "Deluxe Double",
          description: "Spacious double room with premium amenities",
          basePrice: 300000,
          maxOccupancy: 2,
          totalRooms: 20,
          availableRooms: 5,
          amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "City View"],
          bedType: "Queen Bed",
          size: "300 sq ft",
          createdAt: Date.now() - 172800000,
        },
        {
          id: "3",
          name: "Family Suite",
          description: "Large suite perfect for families with children",
          basePrice: 500000,
          maxOccupancy: 4,
          totalRooms: 10,
          availableRooms: 3,
          amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "Kitchenette", "Balcony"],
          bedType: "King Bed + Sofa Bed",
          size: "450 sq ft",
          createdAt: Date.now() - 259200000,
        },
        {
          id: "4",
          name: "Executive Suite",
          description: "Luxury suite with premium amenities and services",
          basePrice: 800000,
          maxOccupancy: 2,
          totalRooms: 8,
          availableRooms: 2,
          amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "Jacuzzi", "Ocean View", "Butler Service"],
          bedType: "King Bed",
          size: "600 sq ft",
          createdAt: Date.now() - 345600000,
        },
      ]
      setRoomTypes(sampleRoomTypes)
      localStorage.setItem("room-types", JSON.stringify(sampleRoomTypes))
    }
  }, [])

  // Load deleted room types
  useEffect(() => {
    const savedDeletedRoomTypes = localStorage.getItem("deleted-room-types")
    if (savedDeletedRoomTypes) {
      setDeletedRoomTypes(JSON.parse(savedDeletedRoomTypes))
    }
  }, [])

  // Save room types to localStorage
  useEffect(() => {
    if (roomTypes.length > 0) {
      localStorage.setItem("room-types", JSON.stringify(roomTypes))
    }
  }, [roomTypes])

  // Save deleted room types to localStorage
  useEffect(() => {
    if (deletedRoomTypes.length >= 0) {
      localStorage.setItem("deleted-room-types", JSON.stringify(deletedRoomTypes))
    }
  }, [deletedRoomTypes])

  // Add history entry
  const addHistoryEntry = (
    roomType: RoomType,
    action: "created" | "edited" | "deleted" | "restored",
    changes?: any[],
  ) => {
    const historyEntry: RoomTypeHistoryEntry = {
      id: `HIST${Date.now()}`,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      action,
      timestamp: Date.now(),
      changes,
      performedBy: "Current User",
    }

    setRoomTypeHistory((prev) => [historyEntry, ...prev])
  }

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("room-type-history")
    if (savedHistory) {
      setRoomTypeHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save history to localStorage
  useEffect(() => {
    if (roomTypeHistory.length >= 0) {
      localStorage.setItem("room-type-history", JSON.stringify(roomTypeHistory))
    }
  }, [roomTypeHistory])

  const handleViewHistory = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setRoomTypeHistoryDialogOpen(true)
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

  // Filter and search room types
  const filteredRoomTypes = roomTypes.filter((roomType) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      roomType.name.toLowerCase().includes(searchLower) ||
      roomType.description.toLowerCase().includes(searchLower) ||
      roomType.basePrice.toString().includes(searchLower) ||
      roomType.bedType.toLowerCase().includes(searchLower) ||
      roomType.maxOccupancy.toString().includes(searchLower) ||
      roomType.amenities.some((amenity) => amenity.toLowerCase().includes(searchLower))
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoomTypes = filteredRoomTypes.slice(startIndex, startIndex + itemsPerPage)

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-3 h-3" />
      case "tv":
        return <Tv className="w-3 h-3" />
      case "mini bar":
        return <Coffee className="w-3 h-3" />
      case "private bathroom":
      case "jacuzzi":
        return <Bath className="w-3 h-3" />
      default:
        return <Coffee className="w-3 h-3" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddRoomType = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.description ||
      !formData.basePrice ||
      !formData.maxOccupancy ||
      !formData.bedType ||
      !formData.size
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    // Calculate total and available rooms from room status
    const roomsOfThisType = rooms.filter((room) => room.type === formData.name)
    const totalRooms = roomsOfThisType.length
    const availableRooms = roomsOfThisType.filter((room) => room.status === "available").length

    const newRoomType: RoomType = {
      id: `RT${String(roomTypes.length + 1).padStart(3, "0")}`,
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      maxOccupancy: Number(formData.maxOccupancy),
      totalRooms: totalRooms,
      availableRooms: availableRooms,
      amenities: formData.amenities,
      bedType: formData.bedType,
      size: formData.size,
      createdAt: Date.now(),
    }

    setRoomTypes((prev) => [newRoomType, ...prev])

    // Add history entry
    addHistoryEntry(newRoomType, "created")

    setAddRoomTypeDialogOpen(false)
    toast.success("Room type added successfully!")
  }

  const handleClearForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      maxOccupancy: "",
      amenities: [],
      bedType: "",
      size: "",
    })
  }

  const handleViewRooms = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setViewRoomsDialogOpen(true)
  }

  const handleViewDetails = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setViewDetailsDialogOpen(true)
  }

  const handleEditRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    setFormData({
      name: roomType.name,
      description: roomType.description,
      basePrice: roomType.basePrice.toString(),
      maxOccupancy: roomType.maxOccupancy.toString(),
      amenities: roomType.amenities,
      bedType: roomType.bedType,
      size: roomType.size,
    })
    setEditRoomTypeDialogOpen(true)
  }

  const handleUpdateRoomType = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !selectedRoomType ||
      !formData.name ||
      !formData.description ||
      !formData.basePrice ||
      !formData.maxOccupancy ||
      !formData.bedType ||
      !formData.size
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    // Calculate total and available rooms from room status
    const roomsOfThisType = rooms.filter((room) => room.type === formData.name)
    const totalRooms = roomsOfThisType.length
    const availableRooms = roomsOfThisType.filter((room) => room.status === "available").length

    const updatedRoomType: RoomType = {
      ...selectedRoomType,
      name: formData.name,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      maxOccupancy: Number(formData.maxOccupancy),
      totalRooms: totalRooms,
      availableRooms: availableRooms,
      amenities: formData.amenities,
      bedType: formData.bedType,
      size: formData.size,
    }

    // Track changes
    const changes = []
    if (selectedRoomType.name !== formData.name) {
      changes.push({ field: "name", oldValue: selectedRoomType.name, newValue: formData.name })
    }
    if (selectedRoomType.description !== formData.description) {
      changes.push({ field: "description", oldValue: selectedRoomType.description, newValue: formData.description })
    }
    if (selectedRoomType.basePrice !== Number(formData.basePrice)) {
      changes.push({ field: "basePrice", oldValue: selectedRoomType.basePrice, newValue: Number(formData.basePrice) })
    }
    // Add more change tracking as needed

    setRoomTypes((prev) => prev.map((rt) => (rt.id === selectedRoomType.id ? updatedRoomType : rt)))

    // Add history entry
    if (changes.length > 0) {
      addHistoryEntry(updatedRoomType, "edited", changes)
    }

    setEditRoomTypeDialogOpen(false)
    setSelectedRoomType(null)
    toast.success("Room type updated successfully!")
  }

  const handleDeleteClick = (roomType: RoomType) => {
    setRoomTypeToDelete(roomType)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!roomTypeToDelete) return

    try {
      const deletedRoomType = {
        ...roomTypeToDelete,
        deletedAt: Date.now(),
        deletedBy: "Current User",
      }

      setDeletedRoomTypes((prev) => [deletedRoomType, ...prev])
      setRoomTypes((prev) => prev.filter((rt) => rt.id !== roomTypeToDelete.id))

      // Add history entry
      addHistoryEntry(roomTypeToDelete, "deleted")

      setDeleteConfirmOpen(false)
      setRoomTypeToDelete(null)

      toast.success(`Room type "${deletedRoomType.name}" moved to recycle bin!`)

      // Reload page after successful deletion
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error deleting room type:", error)
      toast.error("Failed to delete room type. Please try again.")
      setDeleteConfirmOpen(false)
      setRoomTypeToDelete(null)
    }
  }

  const handleRestoreRoomType = (roomType: RoomType) => {
    const { deletedAt, deletedBy, ...restoredRoomType } = roomType
    setRoomTypes((prev) => [restoredRoomType, ...prev])
    setDeletedRoomTypes((prev) => prev.filter((rt) => rt.id !== roomType.id))

    // Add history entry
    addHistoryEntry(restoredRoomType, "restored")

    toast.success(`Room type "${roomType.name}" restored successfully!`)
  }

  const handlePermanentDelete = (roomType: RoomType) => {
    setDeletedRoomTypes((prev) => prev.filter((rt) => rt.id !== roomType.id))
    toast.success(`Room type "${roomType.name}" permanently deleted!`)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const availableAmenities = [
    "WiFi",
    "TV",
    "AC",
    "Mini Bar",
    "Private Bathroom",
    "Kitchenette",
    "Balcony",
    "City View",
    "Ocean View",
    "Jacuzzi",
    "Butler Service",
  ]

  // Get rooms for selected room type
  const getRoomsForType = (roomTypeName: string) => {
    return rooms.filter((room) => room.type === roomTypeName)
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground">Manage different room categories and their configurations</p>
        </div>
        <Dialog open={addRoomTypeDialogOpen} onOpenChange={setAddRoomTypeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Room Type</DialogTitle>
              <DialogDescription>Create a new room category with its specifications</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRoomType} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Type Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Deluxe Suite"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedType">Bed Type *</Label>
                  <Select
                    value={formData.bedType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, bedType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Bed">Single Bed</SelectItem>
                      <SelectItem value="Double Bed">Double Bed</SelectItem>
                      <SelectItem value="Queen Bed">Queen Bed</SelectItem>
                      <SelectItem value="King Bed">King Bed</SelectItem>
                      <SelectItem value="King Bed + Sofa Bed">King Bed + Sofa Bed</SelectItem>
                      <SelectItem value="Twin Beds">Twin Beds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the room type..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (UGX) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="150000"
                    value={formData.basePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    placeholder="2"
                    value={formData.maxOccupancy}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxOccupancy: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Room Size *</Label>
                <Input
                  id="size"
                  placeholder="e.g., 300 sq ft"
                  value={formData.size}
                  onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                  {availableAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1">
                  Clear Form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddRoomTypeDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room Type
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search room types, description, price, bed type, amenities..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Room Types Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {paginatedRoomTypes.map((roomType) => (
          <Card key={roomType.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{roomType.name}</CardTitle>
                  <CardDescription className="mt-1">{roomType.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(roomType)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewHistory(roomType)}>
                      <History className="mr-2 h-4 w-4" />
                      Room Type History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditRoomType(roomType)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(roomType)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing and Occupancy */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(roomType.basePrice)}</p>
                  <p className="text-xs text-muted-foreground">per night</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{roomType.maxOccupancy}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">max guests</p>
                </div>
              </div>

              {/* Room Details */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Bed Type</p>
                  <p className="text-sm text-muted-foreground">{roomType.bedType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Room Size</p>
                  <p className="text-sm text-muted-foreground">{roomType.size}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Availability</p>
                  <p className="text-xs text-muted-foreground">
                    {roomType.availableRooms} of {roomType.totalRooms} rooms available
                  </p>
                </div>
                <Badge
                  variant={roomType.availableRooms > 0 ? "default" : "secondary"}
                  className={roomType.availableRooms > 0 ? "bg-green-500 text-white" : ""}
                >
                  {roomType.availableRooms > 0 ? "Available" : "Fully Booked"}
                </Badge>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-sm font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {roomType.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 text-xs bg-background border px-2 py-1 rounded"
                    >
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => handleViewRooms(roomType)}>
                  View Rooms
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredRoomTypes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No room types found matching your search criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {filteredRoomTypes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRoomTypes.length)} of{" "}
              {filteredRoomTypes.length} room types
            </p>
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm whitespace-nowrap">
                Show:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRecycleBinDialogOpen(true)} title="Recycle Bin">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Room Type Summary</CardTitle>
          <CardDescription>Overview of all room types and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{roomTypes.length}</div>
              <p className="text-sm text-muted-foreground">Total Room Types</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0)}</div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0)}</div>
              <p className="text-sm text-muted-foreground">Available Now</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {roomTypes.length > 0
                  ? formatCurrency(Math.round(roomTypes.reduce((sum, rt) => sum + rt.basePrice, 0) / roomTypes.length))
                  : formatCurrency(0)}
              </div>
              <p className="text-sm text-muted-foreground">Average Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Rooms Dialog */}
      <Dialog open={viewRoomsDialogOpen} onOpenChange={setViewRoomsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRoomType?.name} Rooms</DialogTitle>
            <DialogDescription>All rooms under this category with pagination</DialogDescription>
          </DialogHeader>

          {selectedRoomType &&
            (() => {
              const roomsForType = getRoomsForType(selectedRoomType.name)
              const totalPages = Math.ceil(roomsForType.length / viewRoomsItemsPerPage)
              const startIndex = (viewRoomsCurrentPage - 1) * viewRoomsItemsPerPage
              const paginatedRooms = roomsForType.slice(startIndex, startIndex + viewRoomsItemsPerPage)

              return (
                <div className="space-y-4">
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedRooms.map((room) => (
                      <div key={room.id} className="p-4 border rounded-lg text-center">
                        <p className="font-medium mb-2">Room {room.number}</p>
                        <Badge className={`${getStatusColor(room.status)} text-xs`}>{room.status}</Badge>
                      </div>
                    ))}
                  </div>

                  {roomsForType.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No rooms found for this room type.</p>
                    </div>
                  )}

                  {/* Pagination for View Rooms */}
                  {roomsForType.length > viewRoomsItemsPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + viewRoomsItemsPerPage, roomsForType.length)}{" "}
                        of {roomsForType.length} rooms
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewRoomsCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={viewRoomsCurrentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm px-2">
                          Page {viewRoomsCurrentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewRoomsCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={viewRoomsCurrentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Room Type Details - {selectedRoomType?.name}</DialogTitle>
            <DialogDescription>Complete information about this room type</DialogDescription>
          </DialogHeader>
          {selectedRoomType && (
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedRoomType.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bed Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedRoomType.bedType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Base Price</Label>
                  <p className="text-sm text-muted-foreground">{formatCurrency(selectedRoomType.basePrice)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Max Occupancy</Label>
                  <p className="text-sm text-muted-foreground">{selectedRoomType.maxOccupancy} guests</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Room Size</Label>
                  <p className="text-sm text-muted-foreground">{selectedRoomType.size}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Rooms</Label>
                  <p className="text-sm text-muted-foreground">{selectedRoomType.totalRooms}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRoomType.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRoomType.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Room Type Dialog */}
      <Dialog open={editRoomTypeDialogOpen} onOpenChange={setEditRoomTypeDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room Type</DialogTitle>
            <DialogDescription>Update room type specifications</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRoomType} className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Room Type Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Deluxe Suite"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bedType">Bed Type *</Label>
                <Select
                  value={formData.bedType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, bedType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Bed">Single Bed</SelectItem>
                    <SelectItem value="Double Bed">Double Bed</SelectItem>
                    <SelectItem value="Queen Bed">Queen Bed</SelectItem>
                    <SelectItem value="King Bed">King Bed</SelectItem>
                    <SelectItem value="King Bed + Sofa Bed">King Bed + Sofa Bed</SelectItem>
                    <SelectItem value="Twin Beds">Twin Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the room type..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Base Price (UGX) *</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  placeholder="150000"
                  value={formData.basePrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxOccupancy">Max Occupancy *</Label>
                <Input
                  id="edit-maxOccupancy"
                  type="number"
                  placeholder="2"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxOccupancy: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-size">Room Size *</Label>
              <Input
                id="edit-size"
                placeholder="e.g., 300 sq ft"
                value={formData.size}
                onChange={(e) => setFormData((prev) => ({ ...prev, size: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                {availableAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`edit-${amenity}`} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditRoomTypeDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Update Room Type
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will move the room type
              {roomTypeToDelete && ` "${roomTypeToDelete.name}"`} to the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Room Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recycle Bin Dialog */}
      <Dialog open={recycleBinDialogOpen} onOpenChange={setRecycleBinDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Recycle Bin
            </DialogTitle>
            <DialogDescription>
              Deleted room types - {deletedRoomTypes.length} item{deletedRoomTypes.length !== 1 ? "s" : ""} found
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {deletedRoomTypes.length > 0 ? (
              deletedRoomTypes.map((roomType) => (
                <div key={roomType.id} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{roomType.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{roomType.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Deleted: {new Date(roomType.deletedAt || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreRoomType(roomType)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(roomType)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Price:</span> {formatCurrency(roomType.basePrice)}
                    </div>
                    <div>
                      <span className="font-medium">Occupancy:</span> {roomType.maxOccupancy} guests
                    </div>
                    <div>
                      <span className="font-medium">Total Rooms:</span> {roomType.totalRooms}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Trash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No deleted room types found.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Type History Dialog */}
      <Dialog open={roomTypeHistoryDialogOpen} onOpenChange={setRoomTypeHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Room Type History - {selectedRoomType?.name}
            </DialogTitle>
            <DialogDescription>Complete history of changes for this room type</DialogDescription>
          </DialogHeader>

          {selectedRoomType &&
            (() => {
              const typeHistory = roomTypeHistory.filter((entry) => entry.roomTypeId === selectedRoomType.id)
              const totalPages = Math.ceil(typeHistory.length / historyItemsPerPage)
              const startIndex = (historyCurrentPage - 1) * historyItemsPerPage
              const paginatedHistory = typeHistory.slice(startIndex, startIndex + historyItemsPerPage)

              const getActionColor = (action: string) => {
                switch (action) {
                  case "created":
                    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  case "edited":
                    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  case "deleted":
                    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  case "restored":
                    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  default:
                    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                }
              }

              return (
                <div className="space-y-4">
                  {paginatedHistory.length > 0 ? (
                    <div className="space-y-4">
                      {paginatedHistory.map((entry) => (
                        <div key={entry.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getActionColor(entry.action)}>
                                {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">by {entry.performedBy}</span>
                          </div>

                          {entry.changes && entry.changes.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Changes made:</p>
                              {entry.changes.map((change, index) => (
                                <div key={index} className="text-sm bg-muted p-2 rounded">
                                  <span className="font-medium">{change.field}:</span>
                                  <span className="text-red-600 line-through ml-2">{change.oldValue}</span>
                                  <span className="text-green-600 ml-2">→ {change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No history found for this room type.</p>
                    </div>
                  )}

                  {/* Pagination for History */}
                  {typeHistory.length > historyItemsPerPage && (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to {Math.min(startIndex + historyItemsPerPage, typeHistory.length)}{" "}
                          of {typeHistory.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="history-items-per-page" className="text-sm whitespace-nowrap">
                            Show:
                          </Label>
                          <Select
                            value={historyItemsPerPage.toString()}
                            onValueChange={(value) => {
                              setHistoryItemsPerPage(Number(value))
                              setHistoryCurrentPage(1)
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 10, 15, 20].map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={historyCurrentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm px-2">
                          Page {historyCurrentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={historyCurrentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
