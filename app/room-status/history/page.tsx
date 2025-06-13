import { getRoomStatusHistory } from "@/actions/room-status"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomStatusHistoryTable } from "@/components/room-status/room-status-history-table"
import { getRooms } from "@/actions/room"

export default async function RoomStatusHistoryPage() {
  const historyResult = await getRoomStatusHistory()
  const roomsResult = await getRooms()

  const history = Array.isArray(historyResult?.data) && historyResult.success
    ? historyResult.data.map((item: any) => ({
        ...item,
        previousStatusId: item.previousStatusId === null ? undefined : item.previousStatusId,
      }))
    : []
  const rooms = Array.isArray(roomsResult?.data) && roomsResult.success
    ? roomsResult.data.map((room: any) => ({
        ...room,
        category:
          room.category === null
            ? undefined
            : room.category
              ? { name: room.category.name }
              : undefined,
      }))
    : []

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Room Status History</h1>
          <p className="text-muted-foreground">Track all room status changes and booking history</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Status Change History</CardTitle>
          <CardDescription>
            View and filter the complete history of room status changes, including booking details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <RoomStatusHistoryTable
            initialHistory={history}
            roomStatuses={[]} // Replace with actual room statuses if available
            roomCategories={[]} // Replace with actual room categories if available
          />
        </CardContent>
      </Card>
    </div>
  )
}
