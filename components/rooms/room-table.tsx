"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Clock,
  LayoutGrid,
  GalleryHorizontal,
  Loader2,
} from "lucide-react"
import { EditRoomDialog } from "@/components/rooms/edit-room-dialog"
import { ImageGallery } from "@/components/rooms/image-gallery"
import { deleteRoom } from "@/actions/room"
import { toast } from "react-hot-toast"

// Define types based on Prisma models
interface RoomCategory {
  id: string
  name: string
  createdAt: Date
}

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: RoomCategory
}

interface RoomTableProps {
  initialRooms: Room[]
  roomCategories: RoomCategory[]
}

type SortField = "roomNumber" | "category" | "price" | "createdAt"
type SortDirection = "asc" | "desc"

interface SortOption {
  label: string
  field: SortField
  direction: SortDirection
  icon: React.ReactNode
}

export function RoomTable({ initialRooms, roomCategories }: RoomTableProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [showRowsMenu, setShowRowsMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
 

  // Update rooms when initialRooms changes
  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  // Sort options
  const sortOptions: SortOption[] = [
    { label: "Room Number (A-Z)", field: "roomNumber", direction: "asc", icon: <ArrowUp className="h-4 w-4 ml-2" /> },
    {
      label: "Room Number (Z-A)",
      field: "roomNumber",
      direction: "desc",
      icon: <ArrowDown className="h-4 w-4 ml-2" />,
    },
    { label: "Category (A-Z)", field: "category", direction: "asc", icon: <ArrowUp className="h-4 w-4 ml-2" /> },
    { label: "Category (Z-A)", field: "category", direction: "desc", icon: <ArrowDown className="h-4 w-4 ml-2" /> },
    { label: "Price (Low to High)", field: "price", direction: "asc", icon: <ArrowUp className="h-4 w-4 ml-2" /> },
    { label: "Price (High to Low)", field: "price", direction: "desc", icon: <ArrowDown className="h-4 w-4 ml-2" /> },
    { label: "Newest First", field: "createdAt", direction: "desc", icon: <Clock className="h-4 w-4 ml-2" /> },
    { label: "Oldest First", field: "createdAt", direction: "asc", icon: <Clock className="h-4 w-4 ml-2" /> },
  ]

  useEffect(() => {
    // Filter and sort rooms
    let result = [...rooms]

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim()
      result = result.filter((room) => {
        const categoryName = getCategoryName(room.categoryId).toLowerCase()
        return (
          room.roomNumber.toLowerCase().includes(term) ||
          categoryName.includes(term) ||
          room.description.toLowerCase().includes(term)
        )
      })
    }

    // Apply sorting
    result = sortRooms(result, sortField, sortDirection)

    setFilteredRooms(result)
    // Reset to first page when search or sort changes
    setCurrentPage(1)
  }, [searchTerm, rooms, sortField, sortDirection])

  // Function to sort rooms
  const sortRooms = (roomsToSort: Room[], field: SortField, direction: SortDirection): Room[] => {
    return [...roomsToSort].sort((a, b) => {
      let comparison = 0

      switch (field) {
        case "roomNumber":
          comparison = a.roomNumber.localeCompare(b.roomNumber)
          break
        case "category":
          const categoryA = getCategoryName(a.categoryId)
          const categoryB = getCategoryName(b.categoryId)
          comparison = categoryA.localeCompare(categoryB)
          break
        case "price":
          comparison = a.price - b.price
          break
        case "createdAt":
          // Convert to timestamps for comparison
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = timeA - timeB
          break
      }

      return direction === "asc" ? comparison : -comparison
    })
  }

  // Function to handle sort selection
  const handleSortSelect = (option: SortOption) => {
    setSortField(option.field)
    setSortDirection(option.direction)
    setShowSortMenu(false)
  }

  // Function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = roomCategories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  // Function to truncate description to about 3 words
  const truncateDescription = (description: string) => {
    const words = description.split(" ")
    if (words.length <= 3) return description
    return words.slice(0, 3).join(" ") + "..."
  }

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailsOpen(true)
  }

  const handleEdit = (room: Room) => {
    setRoomToEdit(room)
    setIsEditOpen(true)
  }

  

  const handleDelete = async (roomId: string) => {
    setRoomToDelete(roomId);
};

  const handleViewGallery = (room: Room) => {
    setSelectedRoom(room)
    setIsGalleryOpen(true)
  }

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.field === sortField && opt.direction === sortDirection)
    return option ? option.label : "Sort Rooms"
  }

  // Pagination logic
  const indexOfLastRoom = currentPage * rowsPerPage
  const indexOfFirstRoom = indexOfLastRoom - rowsPerPage
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom)
  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage)

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms by number, category, or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Rows per page selector */}
          <div className="relative">
            <button
              type="button"
              className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => setShowRowsMenu(!showRowsMenu)}
            >
              <span className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span>No of Rows</span>
              </span>
            </button>

            {showRowsMenu && (
              <div className="absolute right-0 z-50 mt-1 w-36 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                <div className="p-1">
                  {[5, 10, 15, 20, 50, 100].map((value) => (
                    <div
                      key={value}
                      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                        rowsPerPage === value ? "bg-accent text-accent-foreground" : ""
                      }`}
                      onClick={() => {
                        setRowsPerPage(value)
                        setShowRowsMenu(false)
                        setCurrentPage(1) // Reset to first page when changing rows per page
                      }}
                    >
                      {value} rows
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort selector */}
          <div className="relative">
            <button
              type="button"
              className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <span className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <span>Sort</span>
              </span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 z-50 mt-1 w-56 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                <div className="p-1">
                  {sortOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                        sortField === option.field && sortDirection === option.direction
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                      onClick={() => handleSortSelect(option)}
                    >
                      <span className="flex items-center justify-between w-full">
                        {option.label}
                        {option.icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Room Number</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (UGX)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm.trim() !== "" ? `No rooms found matching "${searchTerm}"` : "No rooms found."}
                </TableCell>
              </TableRow>
            ) : (
              currentRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={room.images[0] || "/placeholder.svg"}
                        alt={`Room ${room.roomNumber}`}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted flex items-center justify-center rounded-md">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>{getCategoryName(room.categoryId)}</TableCell>
                  <TableCell>{formatCurrency(room.price, "UGX")}</TableCell>
                  <TableCell className="max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {truncateDescription(room.description)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(room)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(room)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewGallery(room)}>
                          <GalleryHorizontal className="mr-2 h-4 w-4" />
                          View Images
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(room.id)} className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstRoom + 1}-{Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length}{" "}
            rooms ({rowsPerPage} per page)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Room Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Room Details</DialogTitle>
            <DialogDescription>Detailed information about the room.</DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto pr-1 flex-1">
                <div className="space-y-4 py-4">
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="mb-4">
                      <img
                        src={selectedRoom.images[0] || "/placeholder.svg"}
                        alt={`Room ${selectedRoom.roomNumber}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md mb-4">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Room Number:</div>
                    <div className="col-span-2">{selectedRoom.roomNumber}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Category:</div>
                    <div className="col-span-2">{getCategoryName(selectedRoom.categoryId)}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Price:</div>
                    <div className="col-span-2">{formatCurrency(selectedRoom.price, "UGX")}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-medium">Description:</div>
                    <div className="col-span-2">{selectedRoom.description}</div>
                  </div>
                  {selectedRoom.createdAt && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Created:</div>
                      <div className="col-span-2">{new Date(selectedRoom.createdAt).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 pt-4 border-t mt-2">
                <div className="flex flex-wrap justify-end gap-2 w-full">
                  <Button variant="outline" onClick={() => handleViewGallery(selectedRoom)}>
                    <GalleryHorizontal className="mr-2 h-4 w-4" />
                    View Images
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(selectedRoom)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => setRoomToDelete(selectedRoom.id)} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditRoomDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        room={roomToEdit}
        roomCategories={roomCategories}
        onRoomUpdated={(updatedRoom) => {
          // Update the room in the local state
          setRooms(rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)))

          // If this room is currently selected in the details view, update it there too
          if (selectedRoom && selectedRoom.id === updatedRoom.id) {
            setSelectedRoom(updatedRoom)
          }
        }}
      />

      {selectedRoom && (
        <ImageGallery images={selectedRoom.images || []} open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
      )}




      {roomToDelete && (
  <Dialog open={true}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Are you sure you want to delete this room?</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setRoomToDelete(null)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            setIsDeleting(true);
            try {
              const result = await deleteRoom(roomToDelete);
              if (result.success) {
                setRooms(rooms.filter((room) => room.id !== roomToDelete));
                toast.success("The room has been successfully deleted");
                if (isDetailsOpen && selectedRoom?.id === roomToDelete) {
                  setIsDetailsOpen(false);
                }
              } else {
                toast.error("Failed to delete room");
              }
            } catch (error) {
              toast.error("An unexpected error occurred");
            } finally {
              setIsDeleting(false);
              setRoomToDelete(null);
            }
          }}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
)}
    </>
  )
}
