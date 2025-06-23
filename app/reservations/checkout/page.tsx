"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LogOut, Clock, Search, User, CreditCard, Receipt, Edit, Trash2, Eye } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useCurrency } from "@/contexts/currency-context"

export default function CheckOutPage() {
  const { formatCurrency } = useCurrency()
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  const [pendingCheckOuts, setPendingCheckOuts] = useState([
    {
      id: "RES001",
      guestName: "Alice Wilson",
      room: "102",
      checkOutTime: "11:00 AM",
      totalBill: 450.0,
      paid: 350.0,
      balance: 100.0,
      status: "pending",
    },
    {
      id: "RES002",
      guestName: "Bob Johnson",
      room: "203",
      checkOutTime: "10:30 AM",
      totalBill: 680.0,
      paid: 680.0,
      balance: 0.0,
      status: "ready",
    },
    {
      id: "RES003",
      guestName: "Carol Davis",
      room: "305",
      checkOutTime: "12:00 PM",
      totalBill: 920.0,
      paid: 500.0,
      balance: 420.0,
      status: "pending",
    },
  ])

  const handleDelete = (id: string) => {
    setDeleteDialog({ open: true, id })
  }

  const confirmDelete = () => {
    if (deleteDialog.id) {
      setPendingCheckOuts((prev) => prev.filter((item) => item.id !== deleteDialog.id))
    }
    setDeleteDialog({ open: false, id: null })
  }

  const handleCheckOut = (id: string) => {
    setPendingCheckOuts((prev) => prev.map((item) => (item.id === id ? { ...item, status: "checked-out" } : item)))
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Check-out Management</h1>
          <p className="text-muted-foreground">Process guest check-outs and final billing</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by room or guest..." className="pl-8 w-full sm:w-64" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Check-outs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">After 11:00 AM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{formatCurrency(2050)}</div>
            <p className="text-xs text-muted-foreground">Today's check-outs</p>
          </CardContent>
        </Card>
      </div>

      {/* Check-out List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Check-outs</CardTitle>
          <CardDescription>Guests scheduled to check-out today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCheckOuts.map((checkout) => (
              <div key={checkout.id} className="p-4 border rounded-lg">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{checkout.guestName}</p>
                        <Badge variant={checkout.status === "ready" ? "default" : "secondary"}>{checkout.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Room {checkout.room}</span>
                        <span>Expected: {checkout.checkOutTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">View Bill</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(checkout.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                    <Button
                      size="sm"
                      disabled={checkout.status === "pending"}
                      onClick={() => handleCheckOut(checkout.id)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Check Out</span>
                    </Button>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bill</p>
                    <p className="font-medium">{formatCurrency(checkout.totalBill)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="font-medium text-green-600">{formatCurrency(checkout.paid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className={`font-medium ${checkout.balance === 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(checkout.balance)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Check-out */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-out</CardTitle>
          <CardDescription>Process a manual check-out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="room-checkout">Room Number</Label>
              <Input id="room-checkout" placeholder="Enter room number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="final-amount">Final Amount</Label>
              <Input id="final-amount" placeholder="0.00" />
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Process Check-out
          </Button>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null })}
        title="Delete Check-out"
        description="Are you sure you want to delete this check-out record? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
