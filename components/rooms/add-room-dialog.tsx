"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { createRoom } from "@/actions/room"
import { ImageUploader } from "@/components/rooms/image-uploader"
import { X, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"

interface RoomCategory {
  id: string
  name: string
}

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomCategories: RoomCategory[]
  onRoomAdded?: (room: any) => void
}

interface FormValues {
  roomNumber: string
  categoryId: string
  price: string
  description: string
}

export function AddRoomDialog({ open, onOpenChange, roomCategories, onRoomAdded }: AddRoomDialogProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
 

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      roomNumber: "",
      categoryId: "",
      price: "",
      description: "",
    },
  })

  const watchedValues = watch()

  // Load form data from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      loadFormFromLocalStorage()
    }
  }, [open])

  // Save form data to localStorage when values change
  useEffect(() => {
    if (open) {
      saveFormToLocalStorage()
    }
  }, [watchedValues, images, open])

  const saveFormToLocalStorage = () => {
    const formData = {
      ...watchedValues,
      images,
    }
    localStorage.setItem("addRoomFormData", JSON.stringify(formData))
  }

  const loadFormFromLocalStorage = () => {
    const savedData = localStorage.getItem("addRoomFormData")
    if (savedData) {
      try {
        const formData = JSON.parse(savedData)
        setValue("roomNumber", formData.roomNumber || "")
        setValue("categoryId", formData.categoryId || "")
        setValue("price", formData.price || "")
        setValue("description", formData.description || "")
        setImages(formData.images || [])
        return true
      } catch (error) {
        console.error("Error loading saved form data:", error)
      }
    }
    return false
  }

  const resetFormData = () => {
    reset({
      roomNumber: "",
      categoryId: "",
      price: "",
      description: "",
    })
    setImages([])
    localStorage.removeItem("addRoomFormData")
    toast.success("All form fields have been cleared")
  }

 const onSubmit = async (data: FormValues) => {
  setIsSubmitting(true);
  try {
    const result = await createRoom({
      roomNumber: data.roomNumber.trim(),
      categoryId: data.categoryId,
      price: Number.parseFloat(data.price),
      description: data.description,
      images,
    });
    if (result.success) {
      // Reset form without showing the "All form fields have been cleared" toast
      reset({
        roomNumber: "",
        categoryId: "",
        price: "",
        description: "",
      });
      setImages([]);
      localStorage.removeItem("addRoomFormData");
      onOpenChange(false);
      toast.success("Room has been successfully added");
      if (onRoomAdded && result.data) {
        onRoomAdded(result.data);
      }
    } else {
      toast.error("Failed to add room"); // Also changed toast.success to toast.error here for better UX
    }
  } catch (error) {
    toast.error("An unexpected error occurred"); // Also changed toast.success to toast.error here for better UX
  } finally {
    setIsSubmitting(false);
  }
};


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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          // Dialog is closing, form data is already saved via useEffect
          onOpenChange(newOpen)
        } else {
          // Dialog is opening, try to load saved data
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Enter the details for the new room.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid gap-4 py-4 overflow-y-auto pr-1 flex-1">
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.roomNumber?.message ||
                    errors.categoryId?.message ||
                    errors.price?.message ||
                    "Please check the form for errors"}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="roomNumber" className="sm:text-right">
                Room Number
              </Label>
              <div className="sm:col-span-3">
                <Input
                  id="roomNumber"
                  {...register("roomNumber", {
                    required: "Room number is required",
                  })}
                  className={`${errors.roomNumber ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                {errors.roomNumber && <p className="text-red-500 text-sm mt-1">{errors.roomNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="category" className="sm:text-right">
                Category
              </Label>
              <div className="sm:col-span-3 relative">
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md border ${
                    errors.categoryId ? "border-red-500" : "border-input"
                  } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={isSubmitting}
                >
                  <span>{getCategoryName(watchedValues.categoryId)}</span>
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
                {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}

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
                              watchedValues.categoryId === category.id ? "bg-accent text-accent-foreground" : ""
                            }`}
                            onClick={() => {
                              setValue("categoryId", category.id, { shouldValidate: true })
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
                <input
                  type="hidden"
                  {...register("categoryId", {
                    required: "Please select a room category",
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="price" className="sm:text-right">
                Price (UGX)
              </Label>
              <div className="sm:col-span-3">
                <Input
                  id="price"
                  type="number"
                  {...register("price", {
                    required: "Price is required",
                    validate: (value) =>
                      (!isNaN(Number(value)) && Number(value) > 0) || "Please enter a valid price greater than 0",
                  })}
                  className={`${errors.price ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="description" className="sm:text-right">
                Description
              </Label>
              <div className="sm:col-span-3">
                <Textarea
                  id="description"
                  {...register("description")}
                  className="min-h-[100px]"
                  placeholder="Detailed description of the room"
                  disabled={isSubmitting}
                />
              </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={resetFormData}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Room"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
