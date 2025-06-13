import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GuestHistoryTable } from "@/components/guests/guest-history-table"
import { getGuestHistory } from "@/actions/guest"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Guest History | Hotel Management",
  description: "View and manage guest history",
}

async function GuestHistoryContent() {
  const guestHistoryResult = await getGuestHistory()
  const guests = guestHistoryResult.success && Array.isArray(guestHistoryResult.data)
    ? guestHistoryResult.data.map((guest: any) => ({
        ...guest,
        email: guest.email === null ? undefined : guest.email,
      }))
    : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Guest History</CardTitle>
          <CardDescription>View and search past guest stays and their booking history.</CardDescription>
        </CardHeader>
        <CardContent>
          <GuestHistoryTable guests={guests} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function GuestHistoryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Guest History</h1>
      </div>

      <Suspense fallback={<GuestHistoryLoadingSkeleton />}>
        <GuestHistoryContent />
      </Suspense>
    </div>
  )
}

function GuestHistoryLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full" />
      </CardContent>
    </Card>
  )
}
