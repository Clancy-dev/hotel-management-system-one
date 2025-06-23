"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Wifi, Coffee, Tv, Bath, Plus, Edit, Trash2, Download, Loader2 } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"
import { useState } from "react"

export default function RoomTypesPage() {
  const [isExporting, setIsExporting] = useState(false)

  const roomTypes = [
    {
      id: 1,
      name: "Standard Single",
      description: "Comfortable single room with essential amenities",
      basePrice: 120,
      maxOccupancy: 1,
      totalRooms: 25,
      availableRooms: 8,
      amenities: ["WiFi", "TV", "AC", "Private Bathroom"],
      bedType: "Single Bed",
      size: "200 sq ft",
    },
    {
      id: 2,
      name: "Deluxe Double",
      description: "Spacious double room with premium amenities",
      basePrice: 180,
      maxOccupancy: 2,
      totalRooms: 20,
      availableRooms: 5,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "City View"],
      bedType: "Queen Bed",
      size: "300 sq ft",
    },
    {
      id: 3,
      name: "Family Suite",
      description: "Large suite perfect for families with children",
      basePrice: 280,
      maxOccupancy: 4,
      totalRooms: 10,
      availableRooms: 3,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "Kitchenette", "Balcony"],
      bedType: "King Bed + Sofa Bed",
      size: "450 sq ft",
    },
    {
      id: 4,
      name: "Executive Suite",
      description: "Luxury suite with premium amenities and services",
      basePrice: 450,
      maxOccupancy: 2,
      totalRooms: 8,
      availableRooms: 2,
      amenities: ["WiFi", "TV", "AC", "Mini Bar", "Private Bathroom", "Jacuzzi", "Ocean View", "Butler Service"],
      bedType: "King Bed",
      size: "600 sq ft",
    },
  ]

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

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const pdfData = roomTypes.map((room) => ({
        name: room.name,
        description: room.description,
        basePrice: `$${room.basePrice}`,
        maxOccupancy: room.maxOccupancy,
        totalRooms: room.totalRooms,
        availableRooms: room.availableRooms,
        bedType: room.bedType,
        size: room.size,
        amenities: room.amenities.join(", "),
      }))

      await generatePDF({
        title: "Room Types Report",
        subtitle: "Complete overview of all room categories and configurations",
        columns: [
          { header: "Room Type", dataKey: "name", width: 30 },
          { header: "Base Price", dataKey: "basePrice", width: 20 },
          { header: "Max Guests", dataKey: "maxOccupancy", width: 15 },
          { header: "Total Rooms", dataKey: "totalRooms", width: 15 },
          { header: "Available", dataKey: "availableRooms", width: 15 },
          { header: "Bed Type", dataKey: "bedType", width: 25 },
          { header: "Size", dataKey: "size", width: 20 },
        ],
        data: pdfData,
        filename: "room-types-report",
        orientation: "landscape",
      })
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground">Manage different room categories and their configurations</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={exportToPDF} disabled={isExporting} className="w-full sm:w-auto">
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Room Type
          </Button>
        </div>
      </div>

      {/* Room Types Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {roomTypes.map((roomType) => (
          <Card key={roomType.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{roomType.name}</CardTitle>
                  <CardDescription className="mt-1">{roomType.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing and Occupancy */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">${roomType.basePrice}</p>
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
                <Badge variant={roomType.availableRooms > 0 ? "default" : "secondary"}>
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
                <Button variant="outline" className="flex-1">
                  View Rooms
                </Button>
                <Button className="flex-1">Edit Type</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Room Type Summary</CardTitle>
          <CardDescription>Overview of all room types and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">4</div>
              <p className="text-sm text-muted-foreground">Total Room Types</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">63</div>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">18</div>
              <p className="text-sm text-muted-foreground">Available Now</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$257</div>
              <p className="text-sm text-muted-foreground">Average Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
