import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Wifi, Coffee, Tv, Bath, Plus, Settings } from "lucide-react"

export default function RoomsPage() {
  const roomStats = [
    { status: "Available", count: 23, color: "bg-green-500" },
    { status: "Occupied", count: 127, color: "bg-blue-500" },
    { status: "Maintenance", count: 3, color: "bg-orange-500" },
    { status: "Out of Order", count: 2, color: "bg-red-500" },
  ]

  const rooms = [
    {
      number: "101",
      type: "Standard Single",
      status: "available",
      price: "$120/night",
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "2 hours ago",
      nextReservation: "Tomorrow 3:00 PM",
    },
    {
      number: "205",
      type: "Deluxe Double",
      status: "occupied",
      price: "$180/night",
      amenities: ["Wifi", "TV", "AC", "Mini Bar"],
      lastCleaned: "Yesterday",
      nextReservation: "Jan 20, 11:00 AM",
    },
    {
      number: "301",
      type: "Suite",
      status: "maintenance",
      price: "$350/night",
      amenities: ["Wifi", "TV", "AC", "Mini Bar", "Balcony"],
      lastCleaned: "3 days ago",
      nextReservation: "Jan 18, 2:00 PM",
    },
    {
      number: "102",
      type: "Standard Single",
      status: "available",
      price: "$120/night",
      amenities: ["Wifi", "TV", "AC"],
      lastCleaned: "1 hour ago",
      nextReservation: "No upcoming reservations",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "occupied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "out-of-order":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-3 h-3" />
      case "tv":
        return <Tv className="w-3 h-3" />
      case "ac":
        return <Coffee className="w-3 h-3" />
      case "mini bar":
        return <Coffee className="w-3 h-3" />
      case "balcony":
        return <Bath className="w-3 h-3" />
      default:
        return <Settings className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms Management</h1>
          <p className="text-muted-foreground">Monitor room status, availability, and maintenance</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Room Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {roomStats.map((stat) => (
          <Card key={stat.status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.status}</CardTitle>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">{((stat.count / 155) * 100).toFixed(1)}% of total rooms</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.number} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room {room.number}</CardTitle>
                <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{room.price}</span>
                <Bed className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Cleaned:</span>
                  <span>{room.lastCleaned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Reservation:</span>
                  <span className="text-right">{room.nextReservation}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Room Status Legend</CardTitle>
          <CardDescription>Understanding room status indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Available</p>
                <p className="text-xs text-muted-foreground">Ready for new guests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">Occupied</p>
                <p className="text-xs text-muted-foreground">Currently has guests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <p className="font-medium">Maintenance</p>
                <p className="text-xs text-muted-foreground">Under repair or cleaning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">Out of Order</p>
                <p className="text-xs text-muted-foreground">Not available for booking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
