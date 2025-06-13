"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"
import { updateGuest } from "@/actions/guest"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Guest {
  id: string
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date | null
  phoneNumber: string
  email?: string | null
  address?: string | null
  nextOfKin?: string | null
  ninNumber?: string | null
  passportNumber?: string | null
  visaType?: string | null
  visaNumber?: string | null
  drivingPermit?: string | null
  emergencyContact?: string | null
  createdAt: Date
  updatedAt: Date
}

interface EditGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: Guest | null
  onGuestUpdated: (guest: any) => void
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
  } = useForm({
    defaultValues: {
      firstName: guest?.firstName || "",
      lastName: guest?.lastName || "",
      nationality: guest?.nationality || "",
      gender: guest?.gender || "male",
      dateOfBirth: guest?.dateOfBirth || undefined,
      phoneNumber: guest?.phoneNumber || "",
      email: guest?.email || "",
      address: guest?.address || "",
      nextOfKin: guest?.nextOfKin || "",
      ninNumber: guest?.ninNumber || "",
      passportNumber: guest?.passportNumber || "",
      visaType: guest?.visaType || "",
      visaNumber: guest?.visaNumber || "",
      drivingPermit: guest?.drivingPermit || "",
      emergencyContact: guest?.emergencyContact || "",
    },
  })

  // Reset form when guest changes
  useState(() => {
    if (guest) {
      reset({
        firstName: guest.firstName || "",
        lastName: guest.lastName || "",
        nationality: guest.nationality || "",
        gender: guest.gender || "male",
        dateOfBirth: guest.dateOfBirth || undefined,
        phoneNumber: guest.phoneNumber || "",
        email: guest.email || "",
        address: guest.address || "",
        nextOfKin: guest.nextOfKin || "",
        ninNumber: guest.ninNumber || "",
        passportNumber: guest.passportNumber || "",
        visaType: guest.visaType || "",
        visaNumber: guest.visaNumber || "",
        drivingPermit: guest.drivingPermit || "",
        emergencyContact: guest.emergencyContact || "",
      })
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: any) => {
    if (!guest) return

    setIsSubmitting(true)
    try {
      const result = await updateGuest(guest.id, data)
      if (result.success && result.data) {
        toast.success("Guest updated successfully")
        // Pass only the updated guest data without requiring bookings
        onGuestUpdated({
          ...guest,
          ...result.data,
        })
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update guest")
      }
    } catch (error) {
      console.error("Error updating guest:", error)
      toast.error("An error occurred while updating the guest")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!guest) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Guest</DialogTitle>
          <DialogDescription>Update guest information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                      <Label htmlFor={`gender-${option.value}`}>{option.label}</Label>
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
                      {watchedValues.dateOfBirth ? format(new Date(watchedValues.dateOfBirth), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedValues.dateOfBirth ? new Date(watchedValues.dateOfBirth) : undefined}
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identification Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ninNumber">National ID (NIN) Number</Label>
                <Input id="ninNumber" {...register("ninNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input id="passportNumber" {...register("passportNumber")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Input id="visaType" {...register("visaType")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visaNumber">Visa Number</Label>
                <Input id="visaNumber" {...register("visaNumber")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="drivingPermit">Driving Permit</Label>
                <Input id="drivingPermit" {...register("drivingPermit")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" {...register("emergencyContact")} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
