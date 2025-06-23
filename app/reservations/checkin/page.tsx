"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Search, User, Key, Edit, Trash2, Eye } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useCurrency } from "@/contexts/currency-context"

export default function CheckInPage() {
  const { formatCurrency } = useCurrency()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  const [pendingCheckIns, setPendingCheckIns] = useState([
    {
      id: "RES001",
      guestName: "John Smith",
      room: "101",
      checkInTime: "3:00 PM",
      nights: 3,
      guests: 2,
      status: "confirmed",
      amount: 450,
    },
    {
      id: "RES002",
      guestName: "Sarah Johnson",
      room: "205",
      checkInTime: "2:30 PM",
      nights: 4,
      guests: 1,
      status: "pending",
      amount: 680,
    },
    {
      id: "RES003",
      guestName: "Michael Brown",
      room: "301",
      checkInTime: "4:00 PM",
      nights: 2,
      guests: 3,
      status: "confirmed",
      amount: 320,
    },
  ])

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, id })
  }

  const confirmDelete = () => {
    if (deleteDialog.id) {
      setPendingCheckIns((prev) => prev.filter((item) => item.id !== deleteDialog.id))
    }
    setDeleteDialog({ open: false, id: null })
  }

  const handleCheckIn = (id: string) => {
    setPendingCheckIns((prev) => prev.map((item) => (item.id === id ? { ...item, status: "checked-in" } : item)))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Check-in Management</h1>
          <p className="text-muted-foreground">Process guest check-ins for today</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reservations..." className="pl-8 w-full sm:w-64" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Before 3:00 PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms Ready</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Available now</p>
          </CardContent>
        </Card>
      </div>

      {/* Check-in List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Check-ins</CardTitle>
          <CardDescription>Guests scheduled to check-in today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCheckIns.map((reservation) => (
              <div
                key={reservation.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{reservation.guestName}</p>
                      <Badge variant={reservation.status === "confirmed" ? "default" : "secondary"}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 text-xs text-muted-foreground">
                      <span>Room {reservation.room}</span>
                      <span>{reservation.nights} nights</span>
                      <span>{reservation.guests} guests</span>
                      <span>Expected: {reservation.checkInTime}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-primary">{formatCurrency(reservation.amount)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">View Details</span>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(reservation.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                  <Button size="sm" onClick={() => handleCheckIn(reservation.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Check In</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Check-in Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-in</CardTitle>
          <CardDescription>Process a walk-in guest or manual check-in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input id="guest-name" placeholder="Enter guest name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-number">Room Number</Label>
              <Input id="room-number" placeholder="Room number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nights">Number of Nights</Label>
              <Input id="nights" type="number" placeholder="3" />
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <CheckCircle className="mr-2 h-4 w-4" />
            Process Check-in
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="Delete Reservation"
        description="Are you sure you want to delete this reservation? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
