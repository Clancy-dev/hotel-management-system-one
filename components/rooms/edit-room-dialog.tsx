"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateRoom } from "@/actions/room"
import { ImageUploader } from "@/components/rooms/image-uploader"
import { X, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"

interface RoomCategory {
  id: string
  name: string
}

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
}

interface EditRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  roomCategories: RoomCategory[]
  onRoomUpdated?: (room: Room) => void
}

export function EditRoomDialog({ open, onOpenChange, room, roomCategories, onRoomUpdated }: EditRoomDialogProps) {
  const [roomNumber, setRoomNumber] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalRoomNumber, setOriginalRoomNumber] = useState("")
  

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber)
      setOriginalRoomNumber(room.roomNumber)
      setCategoryId(room.categoryId)
      setPrice(room.price.toString())
      setDescription(room.description)
      setImages(room.images || [])
      setError(null)
    }
  }, [room])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!room) return

    if (!roomNumber.trim()) {
      setError("Room number is required")
      return
    }

    if (!categoryId) {
      setError("Please select a room category")
      return
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Please enter a valid price")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateRoom(room.id, {
        roomNumber: roomNumber.trim(),
        categoryId,
        price: Number.parseFloat(price),
        description,
        images,
      })

      if (result.success) {
        onOpenChange(false)
        toast.success("The room has been successfully updated")
        

        if (onRoomUpdated && result.data) {
          onRoomUpdated(result.data)
        }
      } else {
        setError(result.error || "Failed to update room")
        toast.error("Failed to update room")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddImage = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const getCategoryName = (id: string) => {
    const category = roomCategories.find((cat) => cat.id === id)
    return category ? category.name : "Select a category"
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>Update the details for this room.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto pr-1 flex-1">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="roomNumber" className="sm:text-right">
                Room Number
              </Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="sm:col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="category" className="sm:text-right">
                Category
              </Label>
              <div className="sm:col-span-3 relative">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={isSubmitting}
                >
                  <span>{getCategoryName(categoryId)}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="p-1">
                      {roomCategories.length === 0 ? (
                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none text-muted-foreground">
                          No categories available
                        </div>
                      ) : (
                        roomCategories.map((category) => (
                          <div
                            key={category.id}
                            className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                              categoryId === category.id ? "bg-accent text-accent-foreground" : ""
                            }`}
                            onClick={() => {
                              setCategoryId(category.id)
                              setShowCategoryDropdown(false)
                            }}
                          >
                            {category.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="price" className="sm:text-right">
                Price (UGX)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="sm:col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="description" className="sm:text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="sm:col-span-3 min-h-[100px]"
                placeholder="Detailed description of the room"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label className="sm:text-right pt-2">Room Images</Label>
              <div className="sm:col-span-3 space-y-4">
                <ImageUploader onImageAdded={handleAddImage} />

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Room image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0 pt-2 border-t">
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
