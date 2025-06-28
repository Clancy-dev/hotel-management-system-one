"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Search,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingDown,
  Plus,
  Edit,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { OutOfOrderDetailsDialog } from "@/components/out-of-order-details-dialog"
import { EditOutOfOrderDialog } from "@/components/edit-out-of-order-dialog"
import Image from "next/image"
import { Toaster, toast } from "react-hot-toast"
import { OutOfOrderDetailsDialog } from "@/components/out-of-order-details-dialog"

interface Room {
  id: string
  number: string
  type: string
  status: string
  price: number
  amenities: string[]
  images: string[]
  bedType?: string
  size?: string
  maxOccupancy?: number
  outOfOrderDate?: string
  outOfOrderReason?: string
  outOfOrderDetails?: string
}

export default function OutOfOrderPage() {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [confirmAvailableOpen, setConfirmAvailableOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [roomToMarkAvailable, setRoomToMarkAvailable] = useState<Room | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")

  // Available rooms for selection
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])

  // Form state with persistence
  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("out-of-order-form-data")
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData)
      } catch {
        return {
          roomId: "",
          reason: "",
          details: "",
        }
      }
    }
    return {
      roomId: "",
      reason: "",
      details: "",
    }
  })

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("out-of-order-form-data", JSON.stringify(formData))
  }, [formData])

  // Sample out of order rooms data
  const [outOfOrderRooms, setOutOfOrderRooms] = useState<Room[]>([
    {
      id: "1",
      number: "103",
      type: "Standard Single",
      status: "out-of-order",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      outOfOrderDate: "2024-01-10T08:30:00Z",
      outOfOrderReason: "Plumbing issues - major pipe burst requiring extensive repairs",
      outOfOrderDetails:
        "Major pipe burst in the bathroom wall causing significant water damage to the room. The incident occurred during the night and affected the flooring, walls, and electrical systems. Professional plumbers and contractors have been contacted for assessment. Estimated repair time is 2-3 weeks including drying time, wall repairs, flooring replacement, and electrical system inspection. Room will remain closed until all safety inspections are completed and the room meets hotel standards.",
    },
    {
      id: "2",
      number: "205",
      type: "Deluxe Double",
      status: "out-of-order",
      price: 300000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
      outOfOrderDate: "2024-01-05T14:15:00Z",
      outOfOrderReason: "Fire damage from electrical fault - safety inspection required",
      outOfOrderDetails:
        "Electrical fault in the air conditioning unit caused a small fire that damaged the ceiling and walls. Fire department responded quickly and contained the damage to one room. However, smoke damage affected furniture and carpeting. Insurance assessment is ongoing. Room requires complete electrical rewiring, ceiling repair, wall repainting, carpet replacement, and furniture replacement. Fire safety inspection must be completed before room can be reopened. Estimated completion time is 4-6 weeks.",
    },
    {
      id: "3",
      number: "302",
      type: "Suite",
      status: "out-of-order",
      price: 650000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "King Bed",
      size: "600 sq ft",
      maxOccupancy: 2,
      outOfOrderDate: "2024-01-15T10:00:00Z",
      outOfOrderReason: "Pest infestation beyond control - professional treatment needed",
      outOfOrderDetails:
        "Severe bed bug infestation discovered during routine inspection. The infestation has spread throughout the room including furniture, carpeting, and wall fixtures. Professional pest control company has been engaged for comprehensive treatment. All furniture and soft furnishings must be professionally treated or replaced. Multiple treatment sessions are required over several weeks to ensure complete elimination. Room will undergo deep cleaning and sanitization before reopening. Health department inspection required before guests can be accommodated.",
    },
    {
      id: "4",
      number: "108",
      type: "Standard Single",
      status: "out-of-order",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      outOfOrderDate: "2024-01-20T16:45:00Z",
      outOfOrderReason: "Structural damage - ceiling collapse risk assessment ongoing",
      outOfOrderDetails:
        "Structural engineer identified potential ceiling collapse risk during routine building inspection. Visible cracks in the ceiling and supporting beams require immediate attention. Room has been evacuated as a safety precaution. Structural assessment is ongoing to determine the extent of repairs needed. May require major construction work including beam reinforcement and ceiling reconstruction. Timeline depends on engineering report and availability of specialized contractors. Safety is the top priority and room will remain closed until certified safe by qualified engineers.",
    },
    {
      id: "5",
      number: "401",
      type: "Deluxe Double",
      status: "out-of-order",
      price: 300000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Queen Bed",
      size: "320 sq ft",
      maxOccupancy: 2,
      outOfOrderDate: "2024-01-12T09:20:00Z",
      outOfOrderReason: "Water damage from storm - extensive repairs required",
      outOfOrderDetails:
        "Heavy storm caused roof leak resulting in significant water damage to the room. Water penetrated through the ceiling causing damage to flooring, furniture, and electrical systems. Mold assessment is being conducted as a precautionary measure. Repairs include roof repair, ceiling replacement, flooring restoration, furniture replacement, and electrical system inspection. Dehumidification equipment is running to prevent mold growth. Insurance claim is being processed. Estimated repair time is 3-4 weeks depending on weather conditions and material availability.",
    },
    {
      id: "6",
      number: "215",
      type: "Suite",
      status: "out-of-order",
      price: 650000,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Balcony"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "King Bed",
      size: "600 sq ft",
      maxOccupancy: 2,
      outOfOrderDate: "2024-01-08T11:30:00Z",
      outOfOrderReason: "HVAC system failure - complete replacement needed",
      outOfOrderDetails:
        "Complete failure of the HVAC system serving this suite. The system is beyond repair and requires full replacement. This involves removing old ductwork, installing new air conditioning units, and updating electrical connections. Work requires coordination with multiple contractors and may affect adjacent rooms temporarily. New system will be more energy efficient and provide better climate control. Installation requires several days of intensive work and testing. Room temperature cannot be maintained at acceptable levels until new system is operational.",
    },
    {
      id: "7",
      number: "320",
      type: "Standard Single",
      status: "out-of-order",
      price: 150000,
      amenities: ["WiFi", "TV", "AC"],
      images: ["/placeholder.svg?height=200&width=300"],
      bedType: "Single Bed",
      size: "200 sq ft",
      maxOccupancy: 1,
      outOfOrderDate: "2024-01-18T13:10:00Z",
      outOfOrderReason: "Compliance issues - accessibility upgrades required by law",
      outOfOrderDetails:
        "Recent accessibility compliance audit identified several issues that must be addressed to meet current regulations. Required upgrades include bathroom modifications for wheelchair accessibility, door width adjustments, installation of grab bars, accessible light switches and controls, and emergency communication systems. These modifications are mandatory under updated accessibility laws. Work involves bathroom renovation, electrical updates, and structural modifications. Compliance certification required before room can be reopened. Estimated completion time is 2-3 weeks.",
    },
  ])

  // Load available rooms from localStorage (from room status page)
  useEffect(() => {
    const savedRooms = localStorage.getItem("hotel-rooms")
    if (savedRooms) {
      const allRooms = JSON.parse(savedRooms)
      const availableForOutOfOrder = allRooms.filter(
        (room: Room) => room.status === "available" || room.status === "dirty" || room.status === "maintenance",
      )
      setAvailableRooms(availableForOutOfOrder)
    }
  }, [])

  // Filter rooms based on search term
  const filteredRooms = outOfOrderRooms.filter((room) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      room.number.toLowerCase().includes(searchLower) ||
      room.type.toLowerCase().includes(searchLower) ||
      (room.outOfOrderReason && room.outOfOrderReason.toLowerCase().includes(searchLower))
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage)

  // Calculate statistics
  const totalOutOfOrder = outOfOrderRooms.length
  const totalLostRevenue = outOfOrderRooms.reduce((sum, room) => {
    const daysOutOfOrder = getDaysOutOfOrder(room.outOfOrderDate || "")
    return sum + room.price * daysOutOfOrder
  }, 0)

  const averageDaysOutOfOrder =
    totalOutOfOrder > 0
      ? Math.round(
          outOfOrderRooms.reduce((sum, room) => sum + getDaysOutOfOrder(room.outOfOrderDate || ""), 0) /
            totalOutOfOrder,
        )
      : 0

  const longestClosure = Math.max(...outOfOrderRooms.map((room) => getDaysOutOfOrder(room.outOfOrderDate || "")))

  function getDaysOutOfOrder(dateString: string): number {
    if (!dateString) return 0
    const outOfOrderDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - outOfOrderDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  function truncateText(text: string, maxLength = 60): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setDetailsDialogOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setEditDialogOpen(true)
  }

  const handleMarkAvailableClick = (room: Room) => {
    setRoomToMarkAvailable(room)
    setConfirmAvailableOpen(true)
  }

  const handleConfirmMarkAvailable = () => {
    if (!roomToMarkAvailable) return

    try {
      // Remove from out of order list
      setOutOfOrderRooms((prev) => prev.filter((room) => room.id !== roomToMarkAvailable.id))

      // Update room status in main rooms data
      const savedRooms = localStorage.getItem("hotel-rooms")
      if (savedRooms) {
        const allRooms = JSON.parse(savedRooms)
        const updatedRooms = allRooms.map((room: Room) =>
          room.id === roomToMarkAvailable.id
            ? {
                ...room,
                status: "available",
                outOfOrderDate: undefined,
                outOfOrderReason: undefined,
                outOfOrderDetails: undefined,
              }
            : room,
        )
        localStorage.setItem("hotel-rooms", JSON.stringify(updatedRooms))
      }

      setConfirmAvailableOpen(false)
      setRoomToMarkAvailable(null)
      toast.success(`Room ${roomToMarkAvailable.number} marked as available!`)
    } catch (error) {
      toast.error("Failed to mark room as available. Please try again.")
    }
  }

  const handleSubmitOutOfOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.roomId || !formData.reason || !formData.details) {
      toast.error("Please fill in all required fields")
      return
    }

    const selectedRoom = availableRooms.find((room) => room.id === formData.roomId)
    if (!selectedRoom) {
      toast.error("Selected room not found")
      return
    }

    try {
      const newOutOfOrderRoom: Room = {
        ...selectedRoom,
        status: "out-of-order",
        outOfOrderDate: new Date().toISOString(),
        outOfOrderReason: formData.reason,
        outOfOrderDetails: formData.details,
      }

      // Add to out of order list
      setOutOfOrderRooms((prev) => [newOutOfOrderRoom, ...prev])

      // Update room status in main rooms data
      const savedRooms = localStorage.getItem("hotel-rooms")
      if (savedRooms) {
        const allRooms = JSON.parse(savedRooms)
        const updatedRooms = allRooms.map((room: Room) => (room.id === formData.roomId ? newOutOfOrderRoom : room))
        localStorage.setItem("hotel-rooms", JSON.stringify(updatedRooms))
      }

      // Clear form and close dialog
      handleClearForm()
      setAddDialogOpen(false)
      toast.success(`Room ${selectedRoom.number} marked as out of order!`)
    } catch (error) {
      toast.error("Failed to mark room as out of order. Please try again.")
    }
  }

  const handleClearForm = () => {
    const clearedForm = {
      roomId: "",
      reason: "",
      details: "",
    }
    setFormData(clearedForm)
    localStorage.setItem("out-of-order-form-data", JSON.stringify(clearedForm))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: string) => {
    setItemsPerPage(Number.parseInt(items))
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">Out of Order Rooms</h1>
          <p className="text-muted-foreground">Rooms temporarily closed for repairs and maintenance</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Mark Room Out of Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mark Room Out of Order</DialogTitle>
              <DialogDescription>Select a room and provide details for marking it out of order</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitOutOfOrder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-select">Select Room *</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, roomId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room to mark out of order" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} - {room.type} ({room.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Input
                  id="reason"
                  placeholder="Brief reason for marking out of order"
                  value={formData.reason}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Detailed Explanation *</Label>
                <Textarea
                  id="details"
                  placeholder="Provide detailed explanation of why this room is being marked out of order..."
                  value={formData.details}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, details: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1 bg-transparent">
                  Clear Form
                </Button>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark Out of Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Out of Order</CardTitle>
            <AlertTriangle className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalOutOfOrder}</div>
            <p className="text-xs text-gray-600">Rooms currently closed</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Average Days Closed</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{averageDaysOutOfOrder}</div>
            <p className="text-xs text-orange-600">Days per room</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Revenue Impact</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{formatCurrency(totalLostRevenue)}</div>
            <p className="text-xs text-yellow-600">Total lost revenue</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Longest Closure</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{longestClosure}</div>
            <p className="text-xs text-gray-600">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms, types, or reasons..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedRooms.map((room) => (
          <Card key={room.id} className="relative hover:shadow-lg transition-shadow border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-black">Room {room.number}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAvailableClick(room)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Available
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
                  className="object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <Badge className="bg-black text-white">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    OUT OF ORDER
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">Out of Order Since:</span>
                  <Badge variant="outline" className="text-xs border-gray-400 text-black">
                    {getDaysOutOfOrder(room.outOfOrderDate || "")} days
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(room.outOfOrderDate || "")}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-black">Reason:</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {truncateText(room.outOfOrderReason || "No reason provided")}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-black">Lost Revenue:</span>
                <span className="text-sm font-bold text-black">
                  {formatCurrency(room.price * getDaysOutOfOrder(room.outOfOrderDate || ""))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No out of order rooms found matching your search criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">of {filteredRooms.length} rooms</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="text-muted-foreground">...</span>
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <OutOfOrderDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} room={selectedRoom} />

      <EditOutOfOrderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        room={selectedRoom}
        onUpdate={(updatedRoom) => {
          setOutOfOrderRooms((prev) => prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))
          toast.success(`Room ${updatedRoom.number} updated successfully!`)
        }}
      />

      {/* Confirmation Dialog for Mark as Available */}
      <AlertDialog open={confirmAvailableOpen} onOpenChange={setConfirmAvailableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Room as Available?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark Room {roomToMarkAvailable?.number} as available? This will remove it from
              the out of order list and make it available for guests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMarkAvailable} className="bg-green-600 hover:bg-green-700">
              Mark as Available
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
