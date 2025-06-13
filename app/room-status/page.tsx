import { getRoomsWithStatus, getRoomStatuses, initializeDefaultStatuses } from "@/actions/room-status"
import { getCategories } from "@/actions/category"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomStatusTable } from "@/components/room-status/room-status-table"
import { RoomStatusTopButtons } from "@/components/room-status/room-status-top-buttons"

export default async function RoomStatusPage() {
  // Initialize default statuses if they don't exist
  await initializeDefaultStatuses()

  // Fetch rooms with status and available statuses
  const roomsResult = await getRoomsWithStatus()
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
    <div className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Room Status</h1>
          <p className="text-muted-foreground">Track and manage the status of all hotel rooms</p>
        </div>
        <RoomStatusTopButtons
          statuses={statuses.map((status: any) => ({
            ...status,
            description: status.description === null ? undefined : status.description,
          }))}
        />
      </div>

      <Card className="overflow-x-auto">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Room Status Management</CardTitle>
          <CardDescription>View and update the status of all rooms in real-time</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <RoomStatusTable
            initialRooms={rooms}
            roomStatuses={statuses.map((status: any) => ({
              ...status,
              description: status.description === null ? undefined : status.description,
            }))}
            roomCategories={categories}
          />
        </CardContent>
      </Card>
    </div>
  )
}
