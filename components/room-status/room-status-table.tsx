"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { UpdateRoomStatusDialog } from "./update-room-status-dialog"
import { RoomDetailsDialog } from "./room-details-dialog"
import { GuestBookingDialog } from "./guest-booking-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter } from "lucide-react"

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: {
    id: string
    name: string
  }
  currentStatus?: {
    id: string
    name: string
    color: string
    isDefault?: boolean
  }
}

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
  isActive: boolean
}

interface RoomStatusTableProps {
  rooms: Room[]
  statuses: RoomStatus[]
}

export function RoomStatusTable({ rooms, statuses }: RoomStatusTableProps) {
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    let result = [...rooms]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((room) => room.currentStatus?.id === statusFilter)
    }

    setFilteredRooms(result)
  }, [rooms, searchQuery, statusFilter])

  const handleRoomStatusUpdated = (updatedRoom: Room) => {
    // Find and update the room in our local state
    const updatedRooms = rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))

    // Re-apply filters
    let result = [...updatedRooms]

    if (searchQuery) {
      result = result.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter) {
      result = result.filter((room) => room.currentStatus?.id === statusFilter)
    }

    setFilteredRooms(result)
  }

  // This function adapts the incoming room data to match the expected type
  const handleBookingCreated = (room: any) => {
    // Convert the room to the expected format if needed
    const updatedRoom: Room = {
      ...room,
      currentStatus: room.currentStatus
        ? {
            id: room.currentStatus.id,
            name: room.currentStatus.name,
            color: room.currentStatus.color,
            isDefault: room.currentStatus.isDefault,
          }
        : undefined,
    }

    handleRoomStatusUpdated(updatedRoom)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter(null)
  }

  const getStatusColor = (status?: { color: string }) => {
    return status?.color || "#9CA3AF" // Default gray color
  }

  const renderMobileView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {filteredRooms.map((room) => (
        <Card key={room.id} className="overflow-hidden">
          <div className="h-2" style={{ backgroundColor: getStatusColor(room.currentStatus) }} />
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Room {room.roomNumber}</h3>
                <p className="text-sm text-muted-foreground">{room.category?.name}</p>
              </div>
              <Badge
                style={{
                  backgroundColor: getStatusColor(room.currentStatus),
                  color: "#fff",
                }}
              >
                {room.currentStatus?.name || "Unassigned"}
              </Badge>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedRoom(room)
                  setIsUpdateDialogOpen(true)
                }}
              >
                Update Status
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedRoom(room)
                  setIsDetailsDialogOpen(true)
                }}
              >
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedRoom(room)
                  setIsBookingDialogOpen(true)
                }}
              >
                Book Room
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderDesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No rooms found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.roomNumber}</TableCell>
                <TableCell>{room.category?.name}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: getStatusColor(room.currentStatus),
                      color: "#fff",
                    }}
                  >
                    {room.currentStatus?.name || "Unassigned"}
                  </Badge>
                </TableCell>
                <TableCell>${room.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRoom(room)
                        setIsUpdateDialogOpen(true)
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRoom(room)
                        setIsDetailsDialogOpen(true)
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRoom(room)
                        setIsBookingDialogOpen(true)
                      }}
                    >
                      Book
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">{isMobile ? renderMobileView() : renderDesktopView()}</ScrollArea>

      {selectedRoom && (
        <>
          <UpdateRoomStatusDialog
            room={
              selectedRoom
                ? {
                    ...selectedRoom,
                    currentStatus: selectedRoom.currentStatus
                      ? {
                          ...selectedRoom.currentStatus,
                          isDefault: selectedRoom.currentStatus.isDefault ?? false,
                        }
                      : undefined,
                  }
                : null
            }
            roomStatuses={statuses}
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
            onStatusUpdated={handleRoomStatusUpdated}
          />

          <RoomDetailsDialog
            room={
              selectedRoom
                ? {
                    ...selectedRoom,
                    currentStatus: selectedRoom.currentStatus
                      ? {
                          ...selectedRoom.currentStatus,
                          isDefault: selectedRoom.currentStatus.isDefault ?? false,
                        }
                      : undefined,
                  }
                : null
            }
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            statusHistory={selectedRoom && (selectedRoom as any).statusHistory ? (selectedRoom as any).statusHistory : []}
          />

          <GuestBookingDialog
            room={selectedRoom}
            open={isBookingDialogOpen}
            onOpenChange={setIsBookingDialogOpen}
            onBookingCreated={handleBookingCreated}
          />
        </>
      )}
    </div>
  )
}
