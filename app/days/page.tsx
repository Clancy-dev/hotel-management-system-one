import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingCalendar } from "@/components/days/booking-calendar"
import { getAllRooms } from "@/actions/room"
import { getAllBookings } from "@/actions/booking"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Days View | Hotel Management",
  description: "Calendar view of room bookings by day",
}

async function DaysContent() {
  const roomsResult = await getAllRooms()
  const bookingsResult = await getAllBookings()

  const rooms = roomsResult.success ? roomsResult.data : []
  const bookings = bookingsResult.success ? bookingsResult.data : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Days View</CardTitle>
          <CardDescription>
            View room bookings by day. Click on a date to see all bookings for that day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingCalendar rooms={rooms} bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function DaysPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Days View</h1>
      </div>

      <Suspense fallback={<DaysLoadingSkeleton />}>
        <DaysContent />
      </Suspense>
    </div>
  )
}

function DaysLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
