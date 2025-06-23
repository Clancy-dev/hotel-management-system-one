"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCurrency } from "@/contexts/currency-context"
import { useToast } from "@/hooks/use-toast"

interface GuestFormData {
  name: string
  email: string
  phone: string
  address: string
  idType: string
  idNumber: string
  status: string
  notes: string
}

interface GuestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest?: any
  onSubmit: (data: GuestFormData) => void
  mode: "create" | "edit"
}

export function GuestForm({ open, onOpenChange, guest, onSubmit, mode }: GuestFormProps) {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GuestFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      idType: "",
      idNumber: "",
      status: "regular",
      notes: "",
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    if (open) {
      const savedFormData = localStorage.getItem(`guest-form-${mode}`)
      if (savedFormData && !guest) {
        const parsed = JSON.parse(savedFormData)
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof GuestFormData, parsed[key])
        })
      } else if (guest && mode === "edit") {
        setValue("name", guest.name)
        setValue("email", guest.email)
        setValue("phone", guest.phone)
        setValue("address", guest.address)
        setValue("idType", guest.idType || "")
        setValue("idNumber", guest.idNumber || "")
        setValue("status", guest.status)
        setValue("notes", guest.notes || "")
      }
    }
  }, [open, guest, mode, setValue])

  useEffect(() => {
    if (open) {
      localStorage.setItem(`guest-form-${mode}`, JSON.stringify(watchedValues))
    }
  }, [watchedValues, open, mode])

  const handleFormSubmit = (data: GuestFormData) => {
    onSubmit(data)
    localStorage.removeItem(`guest-form-${mode}`)
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Guest" : "Edit Guest"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new guest to your hotel database" : "Update guest information and preferences"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} placeholder="John Smith" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register("phone", { required: "Phone number is required" })}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Guest Status</Label>
              <Select onValueChange={(value) => setValue("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Guest</SelectItem>
                  <SelectItem value="regular">Regular Guest</SelectItem>
                  <SelectItem value="vip">VIP Guest</SelectItem>
                  <SelectItem value="corporate">Corporate Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" {...register("address")} placeholder="123 Main Street, City, State, ZIP" rows={2} />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Select onValueChange={(value) => setValue("idType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers-license">Driver's License</SelectItem>
                  <SelectItem value="national-id">National ID</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input id="idNumber" {...register("idNumber")} placeholder="ID123456789" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Any special notes or preferences..." rows={3} />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Add Guest" : "Update Guest"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
