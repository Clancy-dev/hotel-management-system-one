"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, X, Trash2, RefreshCw } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing"
import Image from "next/image"
import toast from "react-hot-toast"
import { getRoomTypeByName, roomTypesData } from "@/lib/room-types-data"
import { formatCurrency } from "@/lib/currency"

const roomSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  type: z.string().min(1, "Room type is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  bedType: z.string().min(1, "Bed type is required"),
  size: z.string().min(1, "Room size is required"),
  maxOccupancy: z.number().min(1, "Max occupancy must be at least 1"),
  description: z.string().optional(),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  images: z.array(z.string()).optional(),
})

type RoomFormData = z.infer<typeof roomSchema>

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RoomFormData) => void
}

const FORM_STORAGE_KEY = "add-room-form-data"

export function AddRoomDialog({ open, onOpenChange, onSubmit }: AddRoomDialogProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      number: "",
      type: "",
      price: undefined, // Changed from 0 to undefined
      bedType: "",
      size: "",
      maxOccupancy: undefined, // Changed from 1 to undefined
      description: "",
      amenities: [],
      images: [],
    },
  })

  // Watch all form values for persistence
  const watchedValues = useWatch({ control: form.control })
  const selectedRoomType = useWatch({ control: form.control, name: "type" })

  // Auto-fill form when room type changes
  useEffect(() => {
    if (selectedRoomType) {
      const roomTypeData = getRoomTypeByName(selectedRoomType)
      if (roomTypeData) {
        // Only auto-fill if the current values are empty/default
        const currentValues = form.getValues()

        if (!currentValues.price || currentValues.price === 0) {
          form.setValue("price", roomTypeData.basePrice)
        }
        if (!currentValues.bedType) {
          form.setValue("bedType", roomTypeData.bedType)
        }
        if (!currentValues.size) {
          form.setValue("size", roomTypeData.size)
        }
        if (!currentValues.maxOccupancy || currentValues.maxOccupancy === 0) {
          form.setValue("maxOccupancy", roomTypeData.maxOccupancy)
        }
        if (!currentValues.description) {
          form.setValue("description", roomTypeData.description)
        }
        if (currentValues.amenities.length === 0) {
          form.setValue("amenities", roomTypeData.amenities)
        }

        toast.success(`Auto-filled form with ${selectedRoomType} defaults`)
      }
    }
  }, [selectedRoomType, form])

  // Load saved form data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        form.reset(parsedData.formData)
        setUploadedImages(parsedData.images || [])
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }
  }, [form])

  // Save form data whenever values change
  useEffect(() => {
    if (open) {
      const dataToSave = {
        formData: watchedValues,
        images: uploadedImages,
        timestamp: Date.now(),
      }
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave))
    }
  }, [watchedValues, uploadedImages, open])

  const handleSubmit = async (data: RoomFormData) => {
    try {
      const roomData = {
        ...data,
        images: uploadedImages.length > 0 ? uploadedImages : ["/placeholder.svg?height=200&width=300"],
      }

      await onSubmit(roomData)
      handleClearForm() // This will now not show a toast
      onOpenChange(false)

      toast.success(`Room ${data.number} added successfully!`, {
        duration: 4000,
        position: "top-right",
      })
    } catch (error) {
      toast.error("Failed to add room. Please try again.", {
        duration: 4000,
        position: "top-right",
      })
    }
  }

  const handleClearForm = () => {
    form.reset({
      number: "",
      type: "",
      price: undefined,
      bedType: "",
      size: "",
      maxOccupancy: undefined,
      description: "",
      amenities: [],
      images: [],
    })
    setUploadedImages([])
    localStorage.removeItem(FORM_STORAGE_KEY)
    // Remove this line: toast.success("Form cleared successfully")
  }

  const handleImageUpload = (urls: string[]) => {
    setUploadedImages((prev) => [...prev, ...urls])
    setIsUploading(false)
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
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
    "Room Service",
    "Safe",
    "Hair Dryer",
    "Iron",
    "Coffee Maker",
  ]

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = form.getValues("amenities")
    if (currentAmenities.includes(amenity)) {
      form.setValue(
        "amenities",
        currentAmenities.filter((a) => a !== amenity),
      )
    } else {
      form.setValue("amenities", [...currentAmenities, amenity])
    }
  }

  const autoFillFromRoomType = () => {
    if (selectedRoomType) {
      const roomTypeData = getRoomTypeByName(selectedRoomType)
      if (roomTypeData) {
        form.setValue("price", roomTypeData.basePrice)
        form.setValue("bedType", roomTypeData.bedType)
        form.setValue("size", roomTypeData.size)
        form.setValue("maxOccupancy", roomTypeData.maxOccupancy)
        form.setValue("description", roomTypeData.description)
        form.setValue("amenities", roomTypeData.amenities)

        toast.success(`Form auto-filled with ${selectedRoomType} characteristics`)
      }
    } else {
      toast.error("Please select a room type first")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roomTypesData.map((roomType) => (
                          <SelectItem key={roomType.id} value={roomType.name}>
                            {roomType.name} - {formatCurrency(roomType.basePrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price per Night (UGX) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150000"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedRoomType && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={autoFillFromRoomType}
                    title="Auto-fill from room type"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name="bedType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bed type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Single Bed">Single Bed</SelectItem>
                        <SelectItem value="Double Bed">Double Bed</SelectItem>
                        <SelectItem value="Queen Bed">Queen Bed</SelectItem>
                        <SelectItem value="King Bed">King Bed</SelectItem>
                        <SelectItem value="Twin Beds">Twin Beds</SelectItem>
                        <SelectItem value="King Bed + Sofa Bed">King Bed + Sofa Bed</SelectItem>
                        <SelectItem value="King Bed + Queen Bed">King Bed + Queen Bed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 200 sq ft" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxOccupancy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Occupancy *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="2"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the room features and highlights..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities *</FormLabel>
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {amenityOptions.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={amenity}
                          checked={field.value.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Room Images (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const urls = res?.map((file) => file.url) || []
                    handleImageUpload(urls)
                    toast.success(`${urls.length} image(s) uploaded successfully!`)
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false)
                    toast.error(`Upload failed: ${error.message}`)
                  }}
                  onUploadBegin={() => {
                    setIsUploading(true)
                  }}
                />
                {isUploading && (
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Uploading images...
                    </div>
                  </div>
                )}
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Room image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>• If no images are uploaded, a placeholder image will be used</p>
                <p>• Maximum 10 images, 4MB each</p>
                <p>• Supported formats: JPG, PNG, GIF</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClearForm}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Form
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
