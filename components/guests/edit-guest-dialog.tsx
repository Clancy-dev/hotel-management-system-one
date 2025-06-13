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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { updateGuest } from "@/actions/guest-edit"
import { toast } from "react-hot-toast"

interface Guest {
  id: string
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date
  phoneNumber: string
  email?: string
  address?: string
  nextOfKin?: string
  ninNumber?: string
  passportNumber?: string
  visaType?: string
  visaNumber?: string
  drivingPermit?: string
  emergencyContact?: string
}

interface EditGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  onGuestUpdated?: (guest: Guest) => void
}

interface FormData {
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date
  phoneNumber: string
  email?: string
  address?: string
  nextOfKin?: string
  ninNumber?: string
  passportNumber?: string
  visaType?: string
  visaNumber?: string
  drivingPermit?: string
  emergencyContact?: string
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
]

export function EditGuestDialog({ open, onOpenChange, guest, onGuestUpdated }: EditGuestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const watchedValues = watch()

  // Reset form when guest changes
  useEffect(() => {
    if (guest) {
      setValue("firstName", guest.firstName)
      setValue("lastName", guest.lastName)
      setValue("nationality", guest.nationality)
      setValue("gender", guest.gender)
      setValue("dateOfBirth", guest.dateOfBirth ? new Date(guest.dateOfBirth) : undefined)
      setValue("phoneNumber", guest.phoneNumber)
      setValue("email", guest.email || "")
      setValue("address", guest.address || "")
      setValue("nextOfKin", guest.nextOfKin || "")
      setValue("ninNumber", guest.ninNumber || "")
      setValue("passportNumber", guest.passportNumber || "")
      setValue("visaType", guest.visaType || "")
      setValue("visaNumber", guest.visaNumber || "")
      setValue("drivingPermit", guest.drivingPermit || "")
      setValue("emergencyContact", guest.emergencyContact || "")
    }
  }, [guest, setValue])

  const onSubmit = async (data: FormData) => {
    if (!guest) return

    setIsSubmitting(true)
    try {
      const result = await updateGuest({
        id: guest.id,
        ...data,
      })

      if (result.success) {
        toast.success("Guest updated successfully!")
        onOpenChange(false)
        if (onGuestUpdated && result.data) {
          // Convert nulls to undefined for optional fields to match Guest type
          const normalizedGuest: Guest = {
            ...result.data,
            email: result.data.email ?? undefined,
            address: result.data.address ?? undefined,
            nextOfKin: result.data.nextOfKin ?? undefined,
            ninNumber: result.data.ninNumber ?? undefined,
            passportNumber: result.data.passportNumber ?? undefined,
            visaType: result.data.visaType ?? undefined,
            visaNumber: result.data.visaNumber ?? undefined,
            drivingPermit: result.data.drivingPermit ?? undefined,
            emergencyContact: result.data.emergencyContact ?? undefined,
            dateOfBirth: result.data.dateOfBirth ?? undefined,
          }
          onGuestUpdated(normalizedGuest)
        }
      } else {
        toast.error(result.error || "Failed to update guest")
      }
    } catch (error) {
      console.error("Guest update error:", error)
      toast.error("Failed to update guest")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Guest Information</DialogTitle>
          <DialogDescription>
            Update the personal and identification details for {guest.firstName} {guest.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "First name is required" })}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Last name is required" })}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    {...register("nationality", { required: "Nationality is required" })}
                    className={errors.nationality ? "border-red-500" : ""}
                  />
                  {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <RadioGroup
                    value={watchedValues.gender}
                    onValueChange={(value) => setValue("gender", value)}
                    className="flex flex-row space-x-4"
                  >
                    {genderOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`edit-${option.value}`} />
                        <Label htmlFor={`edit-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchedValues.dateOfBirth && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedValues.dateOfBirth ? format(watchedValues.dateOfBirth, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={watchedValues.dateOfBirth}
                        onSelect={(date) => setValue("dateOfBirth", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register("email")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Textarea id="address" {...register("address")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nextOfKin">Next of Kin</Label>
                  <Input id="nextOfKin" {...register("nextOfKin")} />
                </div>
              </div>
            </div>

            {/* Identification Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Identification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ninNumber">National ID (NIN) Number</Label>
                  <Input id="ninNumber" {...register("ninNumber")} placeholder="For Ugandans" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input id="passportNumber" {...register("passportNumber")} placeholder="For foreigners" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type</Label>
                  <Input id="visaType" {...register("visaType")} placeholder="For non-Ugandans" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visaNumber">Visa Number</Label>
                  <Input id="visaNumber" {...register("visaNumber")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="drivingPermit">Driving Permit</Label>
                  <Input id="drivingPermit" {...register("drivingPermit")} placeholder="If applicable" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input id="emergencyContact" {...register("emergencyContact")} />
                </div>
              </div>
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
                  Updating...
                </>
              ) : (
                "Update Guest"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
