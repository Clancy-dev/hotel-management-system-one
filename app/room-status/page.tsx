import { getRoomStatuses, initializeDefaultStatuses } from "@/actions/room-status"
import { getRooms } from "@/actions/room"
import { getCategories } from "@/actions/category"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomStatusTable } from "@/components/room-status/room-status-table"
import { RoomStatusTopButtons } from "@/components/room-status/room-status-top-buttons"

export default async function RoomStatusPage() {
  // Initialize default statuses if they don't exist
  await initializeDefaultStatuses()

  // Fetch rooms with status and available statuses
  const roomsResult = await getRooms()
  const statusesResult = await getRoomStatuses()
  const categoriesResult = await getCategories()

  const rooms =
    Array.isArray(roomsResult?.data) && roomsResult.success
      ? roomsResult.data.map((room: any) => ({
          ...room,
          category: room.category === null ? undefined : room.category,
          currentStatus: room.currentStatus === null ? undefined : room.currentStatus,
        }))
      : []

  const statuses = Array.isArray(statusesResult?.data) && statusesResult.success ? statusesResult.data : []

  const categories = Array.isArray(categoriesResult?.data) && categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Room Status</h1>
          <p className="text-muted-foreground">Track and manage the status of all hotel rooms</p>
        </div>
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <RoomStatusTopButtons statuses={statuses.map(s => ({ ...s, description: s.description === null ? undefined : s.description }))} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Room Status Management</CardTitle>
          <CardDescription>View and update the status of all rooms in real-time</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 md:p-6">
          <RoomStatusTable
            rooms={rooms}
            statuses={statuses.map(s => ({
              ...s,
              description: s.description === null ? undefined : s.description,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
