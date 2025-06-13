import { getGuestHistory } from "@/actions/guest"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GuestHistoryTable } from "@/components/guests/guest-history-table"

export default async function GuestHistoryPage() {
  const historyResult = await getGuestHistory()
  const guestHistory = Array.isArray(historyResult?.data) && historyResult.success ? historyResult.data : []

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Guest History</h1>
          <p className="text-muted-foreground">View all past guests who have checked out</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Guests</CardTitle>
          <CardDescription>
            Complete history of guests who have stayed at the hotel. Search, filter, and print guest records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestHistoryTable initialGuestHistory={guestHistory} />
        </CardContent>
      </Card>
    </div>
  )
}
