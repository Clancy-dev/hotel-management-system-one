"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createGuest, createBooking } from "@/actions/guest"
import { createPayment } from "@/actions/payment"
import { updateRoomCurrentStatus } from "@/actions/room-status"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: {
    id: string
    name: string
  }
  currentStatus?: {
    id: string
    name: string
    color: string
  }
}

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface AddGuestFormProps {
  rooms: Room[]
  statuses: RoomStatus[]
}

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date
  phoneNumber: string
  email?: string
  address?: string
  nextOfKin?: string

  // Identification
  ninNumber?: string
  passportNumber?: string
  visaType?: string
  visaNumber?: string
  drivingPermit?: string

  // Booking Information
  roomId: string
  checkInDate: Date
  checkOutDate: Date
  numberOfGuests: number
  purposeOfStay: string
  purposeDetails?: string

  // Vehicle Details
  vehicleRegistration?: string
  vehicleType?: string
  parkingRequired: boolean

  // Payment Details
  paymentMode: string
  depositPaid?: number
  discountType?: string
  discountAmount?: number
  company?: string
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string

  // Emergency Contact
  emergencyContact?: string
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
]

const purposeOptions = [
  { value: "business", label: "Business" },
  { value: "leisure", label: "Leisure" },
  { value: "transit", label: "Transit" },
  { value: "event", label: "Attending an Event" },
  { value: "other", label: "Other" },
]

const paymentModeOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

const mobileMoneyProviders = [
  { value: "MTN_MoMo", label: "MTN Mobile Money" },
  { value: "Airtel_Money", label: "Airtel Money" },
]

const discountTypes = [
  { value: "none", label: "No Discount" },
  { value: "corporate", label: "Corporate Discount" },
  { value: "promo", label: "Promotional Discount" },
]

export function AddGuestForm({ rooms, statuses }: AddGuestFormProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")

  const availableRooms = rooms.filter(
    (room) => room.currentStatus?.name === "Available" || room.currentStatus?.name === "Clean" || !room.currentStatus,
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      numberOfGuests: 1,
      gender: "male",
      purposeOfStay: "leisure",
      paymentMode: "cash",
      parkingRequired: false,
      discountType: "none",
    },
  })

  const watchedValues = watch()

  // Calculate pricing
  const calculatePricing = () => {
    const selectedRoom = rooms.find((room) => room.id === watchedValues.roomId)

    if (!selectedRoom || !watchedValues.checkInDate || !watchedValues.checkOutDate) {
      return { nights: 0, subtotal: 0, discount: 0, total: 0 }
    }

    const checkIn = new Date(watchedValues.checkInDate)
    const checkOut = new Date(watchedValues.checkOutDate)
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = nights * selectedRoom.price

    let discount = 0
    if (watchedValues.discountType === "corporate") {
      discount = watchedValues.discountAmount || 0
    } else if (watchedValues.discountType === "promo") {
      discount = watchedValues.discountAmount || 0
    }

    const total = Math.max(0, subtotal - discount)

    return { nights, subtotal, discount, total }
  }

  const pricing = calculatePricing()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Create guest
      const guestResult = await createGuest({
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        nextOfKin: data.nextOfKin,
        ninNumber: data.ninNumber,
        passportNumber: data.passportNumber,
        visaType: data.visaType,
        visaNumber: data.visaNumber,
        drivingPermit: data.drivingPermit,
        emergencyContact: data.emergencyContact,
      })

      if (!guestResult.success || !guestResult.data) {
        throw new Error(guestResult.error || "Failed to create guest")
      }

      // Create booking
      const bookingResult = await createBooking({
        roomId: data.roomId,
        guestId: guestResult.data.id,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        duration: pricing.nights,
        numberOfGuests: data.numberOfGuests,
        purposeOfStay: data.purposeOfStay,
        purposeDetails: data.purposeDetails,
        vehicleRegistration: data.vehicleRegistration,
        vehicleType: data.vehicleType,
        parkingRequired: data.parkingRequired,
        company: data.company,
      })

      if (!bookingResult.success || !bookingResult.data) {
        throw new Error(bookingResult.error || "Failed to create booking")
      }

      // Create payment record
      await createPayment({
        bookingId: bookingResult.data.id,
        amount: data.depositPaid || 0,
        paymentMode: data.paymentMode,
        depositPaid: data.depositPaid,
        roomRate: rooms.find((r) => r.id === data.roomId)?.price || 0,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        totalBill: pricing.total,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
      })

      // Update room status to "Booked"
      const bookedStatus = statuses.find((status) => status.name === "Booked")
      if (bookedStatus) {
        await updateRoomCurrentStatus(
          data.roomId,
          bookedStatus.id,
          `Booked by ${data.firstName} ${data.lastName}`,
          "system",
          bookingResult.data.id,
        )
      }

      toast.success("Guest added and room booked successfully!")
      reset()
      router.push("/guests")
      router.refresh()
    } catch (error) {
      console.error("Guest creation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create guest")
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "personal") setActiveTab("identification")
    else if (activeTab === "identification") setActiveTab("booking")
    else if (activeTab === "booking") setActiveTab("vehicle")
    else if (activeTab === "vehicle") setActiveTab("payment")
    else if (activeTab === "payment") setActiveTab("summary")
  }

  const prevTab = () => {
    if (activeTab === "identification") setActiveTab("personal")
    else if (activeTab === "booking") setActiveTab("identification")
    else if (activeTab === "vehicle") setActiveTab("booking")
    else if (activeTab === "payment") setActiveTab("vehicle")
    else if (activeTab === "summary") setActiveTab("payment")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="identification">ID</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
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
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
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
          <div className="flex justify-end mt-4">
            <Button type="button" onClick={nextTab}>
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="identification" className="space-y-4">
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
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={prevTab}>
              Previous
            </Button>
            <Button type="button" onClick={nextTab}>
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <h3 className="text-lg font-semibold">Booking & Stay Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Select Room *</Label>
              <Select value={watchedValues.roomId} onValueChange={(value) => setValue("roomId", value)}>
                <SelectTrigger className={errors.roomId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available rooms
                    </SelectItem>
                  ) : (
                    availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber} - {room.category?.name} - {formatPrice(room.price)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.roomId && <p className="text-red-500 text-sm">Please select a room</p>}
              {availableRooms.length === 0 && <p className="text-amber-500 text-sm">No available rooms</p>}
            </div>
            <div className="space-y-2">
              <Label>Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValues.checkInDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.checkInDate ? format(watchedValues.checkInDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedValues.checkInDate}
                    onSelect={(date) => setValue("checkInDate", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValues.checkOutDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValues.checkOutDate ? format(watchedValues.checkOutDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedValues.checkOutDate}
                    onSelect={(date) => setValue("checkOutDate", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfGuests">Number of Guests *</Label>
              <Input
                id="numberOfGuests"
                type="number"
                min="1"
                {...register("numberOfGuests", { required: "Number of guests is required", min: 1 })}
                className={errors.numberOfGuests ? "border-red-500" : ""}
              />
              {errors.numberOfGuests && <p className="text-red-500 text-sm">{errors.numberOfGuests.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="p-2 bg-muted rounded">
                <span className="font-medium">{pricing.nights} night(s)</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Purpose of Stay *</Label>
              <RadioGroup
                value={watchedValues.purposeOfStay}
                onValueChange={(value) => setValue("purposeOfStay", value)}
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {purposeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {watchedValues.purposeOfStay === "other" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="purposeDetails">Please specify the reason for stay</Label>
                <Textarea id="purposeDetails" {...register("purposeDetails")} />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company">Company/Sponsor (Optional)</Label>
              <Input id="company" {...register("company")} placeholder="If corporate booking" />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={prevTab}>
              Previous
            </Button>
            <Button type="button" onClick={nextTab}>
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <h3 className="text-lg font-semibold">Vehicle Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleRegistration">Vehicle Registration Number</Label>
                <Input id="vehicleRegistration" {...register("vehicleRegistration")} placeholder="License plate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type/Model</Label>
                <Input id="vehicleType" {...register("vehicleType")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parkingRequired"
                    checked={watchedValues.parkingRequired}
                    onCheckedChange={(checked) => setValue("parkingRequired", !!checked)}
                  />
                  <Label htmlFor="parkingRequired">Parking Required</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={prevTab}>
              Previous
            </Button>
            <Button type="button" onClick={nextTab}>
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <RadioGroup
                value={watchedValues.paymentMode}
                onValueChange={(value) => setValue("paymentMode", value)}
                className="grid grid-cols-2 gap-2"
              >
                {paymentModeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositPaid">Deposit Paid</Label>
              <Input id="depositPaid" type="number" step="0.01" min="0" {...register("depositPaid", { min: 0 })} />
            </div>
            {watchedValues.paymentMode === "mobile_money" && (
              <>
                <div className="space-y-2">
                  <Label>Mobile Money Provider</Label>
                  <RadioGroup
                    value={watchedValues.mobileMoneyProvider}
                    onValueChange={(value) => setValue("mobileMoneyProvider", value)}
                    className="flex flex-col space-y-2"
                  >
                    {mobileMoneyProviders.map((provider) => (
                      <div key={provider.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={provider.value} id={provider.value} />
                        <Label htmlFor={provider.value}>{provider.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileMoneyNumber">Mobile Money Number</Label>
                  <Input id="mobileMoneyNumber" {...register("mobileMoneyNumber")} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <RadioGroup
                value={watchedValues.discountType}
                onValueChange={(value) => setValue("discountType", value)}
                className="flex flex-col space-y-2"
              >
                {discountTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {watchedValues.discountType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("discountAmount", { min: 0 })}
                />
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={prevTab}>
              Previous
            </Button>
            <Button type="button" onClick={nextTab}>
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <h3 className="text-lg font-semibold">Booking Summary</h3>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Guest:</span>
                  <p>
                    {watchedValues.firstName} {watchedValues.lastName}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Phone:</span>
                  <p>{watchedValues.phoneNumber}</p>
                </div>
                <div>
                  <span className="font-medium">Room:</span>
                  <p>{rooms.find((r) => r.id === watchedValues.roomId)?.roomNumber || "Not selected"}</p>
                </div>
                <div>
                  <span className="font-medium">Room Type:</span>
                  <p>{rooms.find((r) => r.id === watchedValues.roomId)?.category?.name || "Not selected"}</p>
                </div>
                <div>
                  <span className="font-medium">Check-in:</span>
                  <p>{watchedValues.checkInDate ? format(watchedValues.checkInDate, "PPP") : "Not set"}</p>
                </div>
                <div>
                  <span className="font-medium">Check-out:</span>
                  <p>{watchedValues.checkOutDate ? format(watchedValues.checkOutDate, "PPP") : "Not set"}</p>
                </div>
                <div>
                  <span className="font-medium">Duration:</span>
                  <p>{pricing.nights} night(s)</p>
                </div>
                <div>
                  <span className="font-medium">Guests:</span>
                  <p>{watchedValues.numberOfGuests}</p>
                </div>
                <div>
                  <span className="font-medium">Purpose:</span>
                  <p>{purposeOptions.find((p) => p.value === watchedValues.purposeOfStay)?.label || "Not specified"}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Mode:</span>
                  <p>
                    {paymentModeOptions.find((p) => p.value === watchedValues.paymentMode)?.label || "Not specified"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Room Rate:</span>
                  <span>{formatPrice(rooms.find((r) => r.id === watchedValues.roomId)?.price || 0)} per night</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal ({pricing.nights} nights):</span>
                  <span>{formatPrice(pricing.subtotal)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(pricing.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(pricing.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deposit Paid:</span>
                  <span>{formatPrice(watchedValues.depositPaid || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance Due:</span>
                  <span>{formatPrice(Math.max(0, pricing.total - (watchedValues.depositPaid || 0)))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={prevTab}>
              Previous
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Booking"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
