import { getCurrentGuests } from "@/actions/guest"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GuestsTable } from "@/components/guests/guests-table"

export default async function GuestsPage() {
  const guestsResult = await getCurrentGuests()
  const guests = Array.isArray(guestsResult?.data) && guestsResult.success ? guestsResult.data : []

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Current Guests</h1>
          <p className="text-muted-foreground">Manage guests currently staying at the hotel</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Bookings</CardTitle>
          <CardDescription>
            View and manage all guests with active bookings. You can check out guests and search for specific guests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestsTable initialGuests={guests} />
        </CardContent>
      </Card>
    </div>
  )
}
