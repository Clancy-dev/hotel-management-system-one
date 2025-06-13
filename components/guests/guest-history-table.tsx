"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMediaQuery } from "@/hooks/use-media-query"
import { format } from "date-fns"
import { Search, Calendar, User, Home, Phone } from "lucide-react"

interface Guest {
  id: string
  firstName: string
  lastName: string
  nationality: string
  gender: string
  phoneNumber: string
  email?: string
  bookings: Booking[]
}

interface Booking {
  id: string
  checkInDate: Date
  checkOutDate: Date
  actualCheckIn?: Date
  actualCheckOut?: Date
  duration: number
  numberOfGuests: number
  purposeOfStay: string
  status: string
  room: {
    id: string
    roomNumber: string
    category?: {
      id: string
      name: string
    }
  }
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  totalBill: number
  status: string
}

interface GuestHistoryTableProps {
  guests: Guest[]
}

export function GuestHistoryTable({ guests }: GuestHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedGuest, setExpandedGuest] = useState<string | null>(null)

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter guests based on search query
  const filteredGuests = guests.filter((guest) => {
    const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
    const searchLower = searchQuery.toLowerCase()

    return (
      fullName.includes(searchLower) ||
      guest.phoneNumber.includes(searchLower) ||
      guest.email?.toLowerCase().includes(searchLower) ||
      guest.nationality.toLowerCase().includes(searchLower) ||
      guest.bookings.some(
        (booking) =>
          booking.room.roomNumber.includes(searchLower) ||
          booking.room.category?.name.toLowerCase().includes(searchLower),
      )
    )
  })

  const toggleExpandGuest = (guestId: string) => {
    if (expandedGuest === guestId) {
      setExpandedGuest(null)
    } else {
      setExpandedGuest(guestId)
    }
  }

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredGuests.map((guest) => (
        <Card key={guest.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {guest.firstName} {guest.lastName}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {guest.phoneNumber}
                </p>
              </div>
              <Badge>{guest.nationality}</Badge>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={() => toggleExpandGuest(guest.id)}>
              {expandedGuest === guest.id ? "Hide" : "Show"} Booking History ({guest.bookings.length})
            </Button>

            {expandedGuest === guest.id && (
              <div className="mt-4 space-y-3 border-t pt-3">
                {guest.bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <span>Room {booking.room.roomNumber}</span>
                      </div>
                      <Badge variant={booking.status === "checked_out" ? "outline" : "default"}>
                        {booking.status === "checked_out" ? "Checked Out" : "Active"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Check In</p>
                        <p className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(booking.checkInDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check Out</p>
                        <p className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(booking.checkOutDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p>{booking.duration} night(s)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Guests</p>
                        <p>{booking.numberOfGuests}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purpose</p>
                        <p>{booking.purposeOfStay}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p>
                          {booking.payments.length > 0
                            ? booking.payments[0].status.charAt(0).toUpperCase() + booking.payments[0].status.slice(1)
                            : "None"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {filteredGuests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No guest history found</p>
        </div>
      )}
    </div>
  )

  const renderDesktopView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest Name</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Stays</TableHead>
            <TableHead>Last Stay</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGuests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No guest history found.
              </TableCell>
            </TableRow>
          ) : (
            filteredGuests.map((guest) => (
              <>
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </TableCell>
                  <TableCell>{guest.nationality}</TableCell>
                  <TableCell>
                    <div>
                      <p>{guest.phoneNumber}</p>
                      {guest.email && <p className="text-sm text-muted-foreground">{guest.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{guest.bookings.length}</TableCell>
                  <TableCell>
                    {guest.bookings.length > 0 && (
                      <div>
                        <p>
                          {format(
                            new Date(
                              guest.bookings.reduce((latest, booking) => {
                                const bookingDate = new Date(booking.checkOutDate)
                                return bookingDate > latest ? bookingDate : latest
                              }, new Date(0)),
                            ),
                            "MMM d, yyyy",
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Room {guest.bookings[0].room.roomNumber}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleExpandGuest(guest.id)}>
                      {expandedGuest === guest.id ? "Hide" : "View"} History
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedGuest === guest.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0 border-t-0">
                      <div className="bg-muted/50 p-4">
                        <h4 className="font-medium mb-2">Booking History</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Room</TableHead>
                              <TableHead>Check In</TableHead>
                              <TableHead>Check Out</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Purpose</TableHead>
                              <TableHead>Payment</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {guest.bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell>
                                  {booking.room.roomNumber}
                                  <span className="text-sm text-muted-foreground block">
                                    {booking.room.category?.name}
                                  </span>
                                </TableCell>
                                <TableCell>{format(new Date(booking.checkInDate), "MMM d, yyyy")}</TableCell>
                                <TableCell>{format(new Date(booking.checkOutDate), "MMM d, yyyy")}</TableCell>
                                <TableCell>{booking.duration} night(s)</TableCell>
                                <TableCell>{booking.purposeOfStay}</TableCell>
                                <TableCell>
                                  {booking.payments.length > 0 ? (
                                    <Badge
                                      variant={
                                        booking.payments[0].status === "completed"
                                          ? "default"
                                          : booking.payments[0].status === "partial"
                                            ? "secondary"
                                            : "outline"
                                      }
                                    >
                                      {booking.payments[0].status.charAt(0).toUpperCase() +
                                        booking.payments[0].status.slice(1)}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">No payment</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guests by name, phone, room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">{isMobile ? renderMobileView() : renderDesktopView()}</ScrollArea>
    </div>
  )
}
