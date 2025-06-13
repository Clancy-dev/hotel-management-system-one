import { AddGuestForm } from "@/components/guests/add-guest-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getRooms } from "@/actions/room"
import { getRoomStatuses } from "@/actions/room-status"

export default async function AddGuestPage() {
  const roomsResult = await getRooms()
  const rooms = roomsResult.success ? roomsResult.data : []

  const statusesResult = await getRoomStatuses()
  const statuses = statusesResult.success ? statusesResult.data : []

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Add New Guest</h1>
          <p className="text-muted-foreground">Create a new guest and book a room</p>
        </div>
        <div className="w-full md:w-auto">
          <Link href="/guests">
            <Button variant="outline" className="w-full md:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guests
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
          <CardDescription>Enter the guest details and room booking information</CardDescription>
        </CardHeader>
        <CardContent>
          <AddGuestForm rooms={rooms} statuses={statuses} />
        </CardContent>
      </Card>
    </div>
  )
}
