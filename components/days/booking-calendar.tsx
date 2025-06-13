"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, isSameDay } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"

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

interface Booking {
  id: string
  roomId: string
  guestId: string
  checkInDate: Date
  checkOutDate: Date
  duration: number
  numberOfGuests: number
  purposeOfStay: string
  purposeDetails?: string
  vehicleRegistration?: string
  vehicleType?: string
  parkingRequired: boolean
  company?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  room?: Room
  guest?: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

interface BookingCalendarProps {
  rooms: Room[]
  bookings: Booking[]
}

export function BookingCalendar({ rooms, bookings }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookingDates, setBookingDates] = useState<Date[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [viewMode, setViewMode] = useState<"list" | "rooms">("list")
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Extract all dates with bookings
  useEffect(() => {
    const dates: Date[] = []
    bookings.forEach((booking) => {
      const checkIn = new Date(booking.checkInDate)
      const checkOut = new Date(booking.checkOutDate)

      // Add all dates between check-in and check-out
      const currentDate = new Date(checkIn)
      while (currentDate <= checkOut) {
        // Check if this date is already in our array
        if (!dates.some((date) => isSameDay(date, currentDate))) {
          dates.push(new Date(currentDate))
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    setBookingDates(dates)
  }, [bookings])

  // Filter bookings for the selected date
  useEffect(() => {
    if (!selectedDate) return

    const filteredBookings = bookings.filter((booking) => {
      const checkIn = new Date(booking.checkInDate)
      const checkOut = new Date(booking.checkOutDate)

      // Check if selected date falls between check-in and check-out dates (inclusive)
      return selectedDate >= checkIn && selectedDate <= checkOut
    })

    setDayBookings(filteredBookings)
  }, [selectedDate, bookings])

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const isBookingDate = bookingDates.some((date) => isSameDay(date, day))

    return (
      <div
        className={`w-full h-full flex items-center justify-center rounded-md ${isBookingDate ? "bg-blue-100" : ""}`}
      >
        <span>{day.getDate()}</span>
      </div>
    )
  }

  // Group bookings by room for the room view
  const bookingsByRoom = rooms
    .map((room) => {
      const roomBookings = dayBookings.filter((booking) => booking.roomId === room.id)
      return {
        room,
        bookings: roomBookings,
      }
    })
    .filter((item) => item.bookings.length > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select a Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => <button {...props}>{renderDay(date)}</button>,
              }}
            />
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-100 mr-2"></div>
                <span>Has bookings</span>
              </div>
              <div>
                <Badge variant="outline">
                  {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Bookings for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "rooms")}>
                <TabsList className="grid w-[180px] grid-cols-2">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="rooms">Room View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {dayBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <p className="text-muted-foreground">No bookings for this date</p>
                </div>
              ) : viewMode === "list" ? (
                <div className="space-y-4">
                  {dayBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-4 md:p-6 flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {booking.guest?.firstName} {booking.guest?.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">{booking.guest?.phoneNumber}</p>
                            </div>
                            <Badge className="mt-2 md:mt-0 w-fit">
                              {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? "s" : ""}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Room</p>
                              <p className="text-sm">
                                {booking.room?.roomNumber} ({booking.room?.category?.name})
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-sm">{booking.duration} night(s)</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Check-in</p>
                              <p className="text-sm">{format(new Date(booking.checkInDate), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Check-out</p>
                              <p className="text-sm">{format(new Date(booking.checkOutDate), "MMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Purpose</p>
                              <p className="text-sm">{booking.purposeOfStay}</p>
                            </div>
                            {booking.company && (
                              <div>
                                <p className="text-sm font-medium">Company</p>
                                <p className="text-sm">{booking.company}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {bookingsByRoom.map(({ room, bookings }) => (
                    <Card key={room.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Room {room.roomNumber} - {room.category?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {bookings.map((booking) => (
                            <div key={booking.id} className="border-l-4 border-blue-500 pl-3 py-1">
                              <p className="font-medium">
                                {booking.guest?.firstName} {booking.guest?.lastName}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>Check-in: {format(new Date(booking.checkInDate), "MMM d")}</span>
                                <span>Check-out: {format(new Date(booking.checkOutDate), "MMM d")}</span>
                                <span>{booking.numberOfGuests} guest(s)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
