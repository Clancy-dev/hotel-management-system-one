"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Upload } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { useToast } from "@/hooks/use-toast"

interface RoomFormData {
  number: string
  type: string
  status: string
  price: number
  amenities: string[]
  description: string
  bedType: string
  size: string
  maxOccupancy: number
  images: string[]
}

interface RoomFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: any
  onSubmit: (data: RoomFormData) => void
  mode: "create" | "edit"
}

const amenityOptions = [
  "WiFi",
  "TV",
  "AC",
  "Mini Bar",
  "Private Bathroom",
  "Balcony",
  "City View",
  "Ocean View",
  "Kitchenette",
  "Jacuzzi",
  "Butler Service",
]

export function RoomForm({ open, onOpenChange, room, onSubmit, mode }: RoomFormProps) {
  const { currency, formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    defaultValues: {
      number: "",
      type: "",
      status: "available",
      price: 0,
      amenities: [],
      description: "",
      bedType: "",
      size: "",
      maxOccupancy: 1,
      images: [],
    },
  })

  // Watch form values to persist them
  const watchedValues = watch()

  useEffect(() => {
    if (open) {
      const savedFormData = localStorage.getItem(`room-form-${mode}`)
      if (savedFormData && !room) {
        const parsed = JSON.parse(savedFormData)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof RoomFormData, parsed[key])
        })
        setSelectedAmenities(parsed.amenities || [])
        setImages(parsed.images || [])
      } else if (room && mode === "edit") {
        setValue("number", room.number)
        setValue("type", room.type)
        setValue("status", room.status)
        setValue("price", Number.parseFloat(room.price.replace(/[^0-9.]/g, "")))
        setValue("description", room.description || "")
        setValue("bedType", room.bedType || "")
        setValue("size", room.size || "")
        setValue("maxOccupancy", room.maxOccupancy || 1)
        setSelectedAmenities(room.amenities || [])
        setImages(room.images || [])
      }
    }
  }, [open, room, mode, setValue])

  // Save form data to localStorage on changes
  useEffect(() => {
    if (open) {
      const formData = {
        ...watchedValues,
        amenities: selectedAmenities,
        images,
      }
      localStorage.setItem(`room-form-${mode}`, JSON.stringify(formData))
    }
  }, [watchedValues, selectedAmenities, images, open, mode])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    try {
      // Simulate upload - replace with actual UploadThing implementation
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })

      const uploadedImages = await Promise.all(uploadPromises)
      setImages((prev) => [...prev, ...uploadedImages])
      toast({
        title: "Images uploaded successfully",
        description: `${files.length} image(s) added to the room.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const handleFormSubmit = (data: RoomFormData) => {
    const formData = {
      ...data,
      amenities: selectedAmenities,
      images,
    }
    onSubmit(formData)
    localStorage.removeItem(`room-form-${mode}`)
    reset()
    setSelectedAmenities([])
    setImages([])
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Room" : "Edit Room"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new room to your hotel inventory" : "Update room information and settings"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number *</Label>
              <Input
                id="number"
                {...register("number", { required: "Room number is required" })}
                placeholder="e.g., 101"
              />
              {errors.number && <p className="text-sm text-red-500">{errors.number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Room Type *</Label>
              <Select onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard Single">Standard Single</SelectItem>
                  <SelectItem value="Deluxe Double">Deluxe Double</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                  <SelectItem value="Family Room">Family Room</SelectItem>
                  <SelectItem value="Executive Suite">Executive Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Night ({currency.symbol}) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                placeholder="0.00"
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
              <Input
                id="maxOccupancy"
                type="number"
                min="1"
                {...register("maxOccupancy", {
                  required: "Max occupancy is required",
                  min: { value: 1, message: "Must accommodate at least 1 guest" },
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bedType">Bed Type</Label>
              <Input id="bedType" {...register("bedType")} placeholder="e.g., King Bed, Queen Bed" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Room Size</Label>
              <Input id="size" {...register("size")} placeholder="e.g., 300 sq ft" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the room features and amenities..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Room Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{uploading ? "Uploading..." : "Click to upload room images"}</p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Room image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {mode === "create" ? "Create Room" : "Update Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
