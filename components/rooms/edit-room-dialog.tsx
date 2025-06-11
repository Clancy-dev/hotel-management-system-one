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
import { updateRoom } from "@/actions/room"
import { ImageUploader } from "@/components/rooms/image-uploader"
import { X, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { usePolicy } from "@/hooks/use-policy"
import { Badge } from "@/components/ui/badge"

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
  standardPolicy?: any
  customPolicy?: any
  mixedPolicy?: any
}

interface EditRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  roomCategories: RoomCategory[]
  onRoomUpdated?: (room: Room) => void
}

interface FormValues {
  roomNumber: string
  categoryId: string
  price: string
  description: string
}

export function EditRoomDialog({ open, onOpenChange, room, roomCategories, onRoomUpdated }: EditRoomDialogProps) {
  const { currency, formatPrice } = useCurrency()
  const { policySettings } = usePolicy()
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

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

  // Load room data when room changes
  useEffect(() => {
    if (room && open) {
      // Convert price from UGX to current currency for display
      const displayPrice = currency.code === "UGX" ? room.price : room.price * currency.exchangeRate

      setValue("roomNumber", room.roomNumber)
      setValue("categoryId", room.categoryId)
      setValue("price", displayPrice.toString())
      setValue("description", room.description)
      setImages(room.images || [])
      setServerError(null)
    }
  }, [room, open, currency, setValue])

  // Save form data to localStorage when values change (for edit persistence)
  useEffect(() => {
    if (open && room) {
      saveFormToLocalStorage()
    }
  }, [watchedValues, images, open, room])

  const saveFormToLocalStorage = () => {
    if (room) {
      const formData = {
        ...watchedValues,
        images,
        roomId: room.id,
      }
      localStorage.setItem(`editRoomFormData_${room.id}`, JSON.stringify(formData))
    }
  }

  const loadFormFromLocalStorage = () => {
    if (room) {
      const savedData = localStorage.getItem(`editRoomFormData_${room.id}`)
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
    }
    return false
  }

  const resetFormData = () => {
    if (room) {
      // Convert price from UGX to current currency for display
      const displayPrice = currency.code === "UGX" ? room.price : room.price * currency.exchangeRate

      reset({
        roomNumber: room.roomNumber,
        categoryId: room.categoryId,
        price: displayPrice.toString(),
        description: room.description,
      })
      setImages(room.images || [])
      setServerError(null)
      localStorage.removeItem(`editRoomFormData_${room.id}`)
      toast.success("Form has been reset to original values")
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!room) return

    setIsSubmitting(true)
    setServerError(null)

    try {
      // Convert price back to UGX (base currency) before saving
      const priceInUGX =
        currency.code === "UGX" ? Number.parseFloat(data.price) : Number.parseFloat(data.price) / currency.exchangeRate

      const roomData: any = {
        roomNumber: data.roomNumber.trim(),
        categoryId: data.categoryId,
        price: priceInUGX,
        description: data.description,
        images,
        policyType: policySettings.type,
      }

      // Add policy-specific data
      if (policySettings.type === "standard") {
        roomData.standardPolicy = policySettings.standardPolicy
      } else if (policySettings.type === "custom") {
        roomData.customPolicy = policySettings.customPolicy
      } else if (policySettings.type === "mixed") {
        roomData.mixedPolicy = policySettings.mixedPolicy
      }

      const result = await updateRoom(room.id, roomData)

      if (result.success) {
        // Clear saved form data
        localStorage.removeItem(`editRoomFormData_${room.id}`)
        onOpenChange(false)
        toast.success("Room has been successfully updated with policy configuration")
        if (onRoomUpdated && result.data) {
          onRoomUpdated(result.data)
        }
      } else {
        // Handle server error
        setServerError(result.error || "Failed to update room")
        toast.error(result.error || "Failed to update room")
      }
    } catch (error) {
      setServerError("An unexpected error occurred")
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

  // Calculate padding based on currency symbol length
  const getSymbolPadding = () => {
    const symbolLength = currency.symbol.length
    // Base padding is 8 (2rem) plus extra for longer symbols
    return `${Math.max(10, symbolLength * 4 + 8)}px`
  }

  if (!room) return null

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
          loadFormFromLocalStorage()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-lg sm:text-xl">Edit Room</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update the details for Room {room.roomNumber}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-4 sm:space-y-6">
              {/* Display server errors */}
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{serverError}</AlertDescription>
                </Alert>
              )}

              {/* Display form validation errors */}
              {Object.keys(errors).length > 0 && !serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {errors.roomNumber?.message ||
                      errors.categoryId?.message ||
                      errors.price?.message ||
                      "Please check the form for errors"}
                  </AlertDescription>
                </Alert>
              )}

              {/* Room Number */}
              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-sm font-medium">
                  Room Number
                </Label>
                <Input
                  id="roomNumber"
                  {...register("roomNumber", {
                    required: "Room number is required",
                  })}
                  className={`${errors.roomNumber ? "border-red-500" : ""}`}
                  disabled={isSubmitting}
                  placeholder="Enter room number"
                />
                {errors.roomNumber && <p className="text-red-500 text-xs sm:text-sm">{errors.roomNumber.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    className={`flex h-10 w-full items-center justify-between rounded-md border ${
                      errors.categoryId ? "border-red-500" : "border-input"
                    } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    disabled={isSubmitting}
                  >
                    <span className="truncate">{getCategoryName(watchedValues.categoryId)}</span>
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
                      className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${
                        showCategoryDropdown ? "rotate-180" : ""
                      }`}
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
                {errors.categoryId && <p className="text-red-500 text-xs sm:text-sm">{errors.categoryId.message}</p>}
              </div>

              {/* Price and Policy */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pricing Configuration</Label>
                  <Badge variant="secondary" className="text-xs">
                    {policySettings.type} policy
                  </Badge>
                </div>

                {policySettings.type === "standard" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price per Night ({currency.code})</Label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            paddingRight: "4px",
                            borderRight: "1px solid #e2e8f0",
                            paddingLeft: "2px",
                          }}
                        >
                          {currency.symbol}
                        </div>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price", {
                            required: "Price is required",
                            validate: (value) =>
                              (!isNaN(Number(value)) && Number(value) > 0) ||
                              "Please enter a valid price greater than 0",
                          })}
                          style={{
                            paddingLeft: getSymbolPadding(),
                          }}
                          className={`${errors.price ? "border-red-500" : ""}`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs sm:text-sm">{errors.price.message}</p>}
                    </div>

                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                      <p>
                        <strong>Policy Details:</strong>
                      </p>
                      <p>
                        • Night: {policySettings.standardPolicy.nightStart} - {policySettings.standardPolicy.nightEnd}
                      </p>
                      <p>
                        • Check-in: {policySettings.standardPolicy.checkInStart} -{" "}
                        {policySettings.standardPolicy.checkInEnd}
                      </p>
                      <p>
                        • Check-out: {policySettings.standardPolicy.checkOutStart} -{" "}
                        {policySettings.standardPolicy.checkOutEnd}
                      </p>
                      <p>• Late checkout rates: {policySettings.standardPolicy.lateCheckOutRates.length} configured</p>
                      <p>• Early check-in rates: {policySettings.standardPolicy.earlyCheckInRates.length} configured</p>
                    </div>
                  </div>
                )}

                {policySettings.type === "custom" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Hour ({currency.code})</Label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            paddingRight: "4px",
                            borderRight: "1px solid #e2e8f0",
                            paddingLeft: "2px",
                          }}
                        >
                          {currency.symbol}
                        </div>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price", {
                            required: "Price is required",
                            validate: (value) =>
                              (!isNaN(Number(value)) && Number(value) > 0) ||
                              "Please enter a valid price greater than 0",
                          })}
                          style={{
                            paddingLeft: getSymbolPadding(),
                          }}
                          className={`${errors.price ? "border-red-500" : ""}`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs sm:text-sm">{errors.price.message}</p>}
                    </div>

                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                      <p>
                        <strong>Policy Details:</strong>
                      </p>
                      <p>• Base duration: {policySettings.customPolicy.baseHours} hours</p>
                      <p>• Overtime rates: {policySettings.customPolicy.overtimeRates.length} configured</p>
                      {policySettings.customPolicy.earlyCheckOutRate && (
                        <p>• Early checkout fee: {formatPrice(policySettings.customPolicy.earlyCheckOutRate)}</p>
                      )}
                    </div>
                  </div>
                )}

                {policySettings.type === "mixed" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="price">Base Price ({currency.code})</Label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                            paddingRight: "4px",
                            borderRight: "1px solid #e2e8f0",
                            paddingLeft: "2px",
                          }}
                        >
                          {currency.symbol}
                        </div>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...register("price", {
                            required: "Price is required",
                            validate: (value) =>
                              (!isNaN(Number(value)) && Number(value) > 0) ||
                              "Please enter a valid price greater than 0",
                          })}
                          style={{
                            paddingLeft: getSymbolPadding(),
                          }}
                          className={`${errors.price ? "border-red-500" : ""}`}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.price && <p className="text-red-500 text-xs sm:text-sm">{errors.price.message}</p>}
                    </div>

                    <div className="p-3 bg-muted rounded-md text-sm space-y-1">
                      <p>
                        <strong>Mixed Policy Active:</strong>
                      </p>
                      <p>• Default mode: {policySettings.mixedPolicy.defaultMode}</p>
                      <p>• Both nightly and hourly rates available</p>
                      <p>• Flexible booking options for guests</p>
                    </div>
                  </div>
                )}

                {watchedValues.price && !isNaN(Number(watchedValues.price)) && Number(watchedValues.price) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Preview:{" "}
                    {formatPrice(
                      currency.code === "UGX"
                        ? Number(watchedValues.price)
                        : Number(watchedValues.price) / currency.exchangeRate,
                    )}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="min-h-[80px] sm:min-h-[100px] resize-none"
                  placeholder="Detailed description of the room"
                  disabled={isSubmitting}
                />
              </div>

              {/* Room Images */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Room Images</Label>
                <div className="space-y-3">
                  <ImageUploader onImageAdded={handleAddImage} />

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Room image ${index + 1}`}
                            className="h-20 sm:h-24 w-full object-cover rounded-md border"
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
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={resetFormData}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
              <Button type="submit" className="w-full sm:w-auto order-1 sm:order-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Room"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
