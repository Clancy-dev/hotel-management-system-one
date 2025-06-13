"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { createRoomStatus } from "@/actions/room-status"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface CreateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingStatuses: RoomStatus[]
}

interface FormData {
  name: string
  color: string
  description?: string
  isDefault: boolean
}

// 50+ color options for room statuses
const colorOptions = [
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Black", value: "#000000" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Gray", value: "#6b7280" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Lime", value: "#84cc16" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Slate", value: "#64748b" },
  { name: "Zinc", value: "#71717a" },
  { name: "Neutral", value: "#737373" },
  { name: "Stone", value: "#78716c" },
  { name: "Dark Green", value: "#166534" },
  { name: "Dark Red", value: "#991b1b" },
  { name: "Dark Blue", value: "#1e3a8a" },
  { name: "Dark Purple", value: "#581c87" },
  { name: "Dark Orange", value: "#c2410c" },
  { name: "Dark Pink", value: "#be185d" },
  { name: "Dark Teal", value: "#0f766e" },
  { name: "Light Green", value: "#bbf7d0" },
  { name: "Light Red", value: "#fecaca" },
  { name: "Light Blue", value: "#bfdbfe" },
  { name: "Light Purple", value: "#e9d5ff" },
  { name: "Light Orange", value: "#fed7aa" },
  { name: "Light Pink", value: "#fbcfe8" },
  { name: "Light Yellow", value: "#fef3c7" },
  { name: "Light Teal", value: "#ccfbf1" },
  { name: "Brown", value: "#a16207" },
  { name: "Dark Brown", value: "#78350f" },
  { name: "Light Brown", value: "#fbbf24" },
  { name: "Maroon", value: "#7f1d1d" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Olive", value: "#365314" },
  { name: "Coral", value: "#fb7185" },
  { name: "Salmon", value: "#fda4af" },
  { name: "Gold", value: "#d97706" },
  { name: "Silver", value: "#9ca3af" },
  { name: "Bronze", value: "#92400e" },
  { name: "Crimson", value: "#dc2626" },
  { name: "Forest", value: "#14532d" },
  { name: "Midnight", value: "#1f2937" },
]

export function CreateStatusDialog({ open, onOpenChange, existingStatuses }: CreateStatusDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      color: "#22c55e",
      description: "",
      isDefault: false,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createRoomStatus({
        name: data.name.trim(),
        color: data.color,
        description: data.description?.trim(),
        isDefault: data.isDefault,
      })

      if (result.success) {
        toast.success("Room status created successfully!")
        reset()
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create room status")
      }
    } catch (error) {
      console.error("Status creation error:", error)
      toast.error("Failed to create room status")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Room Status</DialogTitle>
          <DialogDescription>Add a new status option for room management with a custom color.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 space-y-6">
            {/* Status Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Status Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Status name is required",
                  validate: (value) => {
                    const trimmed = value.trim()
                    if (existingStatuses.some((status) => status.name.toLowerCase() === trimmed.toLowerCase())) {
                      return "A status with this name already exists"
                    }
                    return true
                  },
                })}
                className={errors.name ? "border-red-500" : ""}
                placeholder="e.g., Under Renovation"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label>Status Color *</Label>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                      watchedValues.color === color.value ? "border-gray-800 ring-2 ring-gray-400" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setValue("color", color.value)}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Custom color:</span>
                <input
                  type="color"
                  value={watchedValues.color}
                  onChange={(e) => setValue("color", e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{watchedValues.color}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-muted rounded-md">
                <Badge variant="secondary" className="text-white" style={{ backgroundColor: watchedValues.color }}>
                  {watchedValues.name || "Status Name"}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of when this status should be used..."
                className="min-h-[80px]"
              />
            </div>

            {/* Default Status */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={watchedValues.isDefault}
                  onCheckedChange={(checked) => setValue("isDefault", !!checked)}
                />
                <Label htmlFor="isDefault">Set as default status for new rooms</Label>
              </div>
              {watchedValues.isDefault && (
                <p className="text-sm text-muted-foreground">
                  This will replace the current default status. All new rooms will use this status by default.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Status"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
