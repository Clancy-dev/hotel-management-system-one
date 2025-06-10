import { getRooms } from "@/actions/room"
import { getCategories } from "@/actions/category"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoomTable } from "@/components/rooms/room-table"
import RoomTopButtons from "@/components/RoomTopButtons"
// import { RoomActions } from "@/components/rooms/room-actions"

export default async function RoomsPage() {
  // Fetch rooms and categories
  const roomsResult = await getRooms()
  const categoriesResult = await getCategories()

  const rooms = Array.isArray(roomsResult?.data) && roomsResult.success
    ? roomsResult.data.map((room: any) => ({
        ...room,
        category: room.category === null ? undefined : room.category,
      }))
    : []
  const roomCategories = Array.isArray(categoriesResult?.data) && categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage your hotel rooms and their categories</p>
        </div>
        <RoomTopButtons/>
      </div>
 
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Room Management</CardTitle>
          <CardDescription>View and manage all your hotel rooms</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <RoomTable initialRooms={rooms} roomCategories={roomCategories} />
        </CardContent>
      </Card>
    </div>
  )
}
