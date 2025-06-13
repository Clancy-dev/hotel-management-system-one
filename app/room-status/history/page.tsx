import { getRoomStatusHistory } from "@/actions/room-status"
import { getRooms } from "@/actions/room"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomStatusHistoryTable } from "@/components/room-status/room-status-history-table"

export default async function RoomStatusHistoryPage() {
  const historyResult = await getRoomStatusHistory()
  const roomsResult = await getRooms()

  const history = Array.isArray(historyResult?.data) && historyResult.success ? historyResult.data : []
  const rooms = Array.isArray(roomsResult?.data) && roomsResult.success ? roomsResult.data : []

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Room Status History</h1>
          <p className="text-muted-foreground">Track all room status changes and booking history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Change History</CardTitle>
          <CardDescription>
            View and filter the complete history of room status changes, including booking details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomStatusHistoryTable initialHistory={history} rooms={rooms} />
        </CardContent>
      </Card>
    </div>
  )
}
