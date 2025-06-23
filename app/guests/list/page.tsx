"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Download,
  Plus,
  Edit,
  Eye,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GuestForm } from "@/components/guest-form"
import { Pagination } from "@/components/pagination"
import { useCurrency } from "@/contexts/currency-context"
import { usePagination } from "@/contexts/pagination-context"
import { useToast } from "@/hooks/use-toast"
import { generatePDF } from "@/lib/pdf-utils"

interface Guest {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalStays: number
  totalSpent: number
  lastVisit: string
  status: string
  currentStay: string | null
  idType?: string
  idNumber?: string
  notes?: string
}

export default function GuestListPage() {
  const { formatCurrency } = useCurrency()
  const { itemsPerPage } = usePagination()
  const { toast } = useToast()

  const [guestFormOpen, setGuestFormOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY",
      totalStays: 5,
      totalSpent: 2450,
      lastVisit: "2024-01-10",
      status: "vip",
      currentStay: "Room 205",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 987-6543",
      address: "456 Oak Ave, Los Angeles, CA",
      totalStays: 2,
      totalSpent: 890,
      lastVisit: "2023-12-15",
      status: "regular",
      currentStay: null,
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "m.brown@email.com",
      phone: "+1 (555) 456-7890",
      address: "789 Pine St, Chicago, IL",
      totalStays: 8,
      totalSpent: 4200,
      lastVisit: "2024-01-12",
      status: "vip",
      currentStay: "Room 301",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 321-0987",
      address: "321 Elm St, Miami, FL",
      totalStays: 1,
      totalSpent: 320,
      lastVisit: "2023-11-20",
      status: "new",
      currentStay: null,
    },
  ])

  // Load guests from localStorage
  useEffect(() => {
    const savedGuests = localStorage.getItem("hotel-guests")
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests))
    }
  }, [])

  // Save guests to localStorage
  useEffect(() => {
    localStorage.setItem("hotel-guests", JSON.stringify(guests))
  }, [guests])

  // Filter and search guests
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.phone.includes(searchTerm)

    const matchesFilter = statusFilter === "all" || guest.status === statusFilter

    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedGuests = filteredGuests.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "regular":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "new":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "corporate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleCreateGuest = (data: any) => {
    const newGuest: Guest = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      totalStays: 0,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split("T")[0],
      status: data.status,
      currentStay: null,
      idType: data.idType,
      idNumber: data.idNumber,
      notes: data.notes,
    }

    setGuests((prev) => [...prev, newGuest])
    toast({
      title: "Guest added",
      description: `${data.name} has been successfully added to the guest list.`,
    })
  }

  const handleEditGuest = (data: any) => {
    if (!editingGuest) return

    setGuests((prev) => prev.map((guest) => (guest.id === editingGuest.id ? { ...guest, ...data } : guest)))

    toast({
      title: "Guest updated",
      description: `${data.name} has been successfully updated.`,
    })
    setEditingGuest(null)
  }

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((guest) => guest.id !== id))
    toast({
      title: "Guest deleted",
      description: "The guest has been successfully removed.",
    })
  }

  const exportToPDF = () => {
    const pdfData = guests.map((guest) => ({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      totalStays: guest.totalStays,
      totalSpent: formatCurrency(guest.totalSpent),
      lastVisit: guest.lastVisit,
      status: guest.status,
      currentStay: guest.currentStay || "Not staying",
    }))

    generatePDF({
      title: "Guest List Report",
      subtitle: "Complete list of hotel guests and their information",
      columns: [
        { header: "Name", dataKey: "name", width: 30 },
        { header: "Email", dataKey: "email", width: 40 },
        { header: "Phone", dataKey: "phone", width: 25 },
        { header: "Total Stays", dataKey: "totalStays", width: 15 },
        { header: "Total Spent", dataKey: "totalSpent", width: 20 },
        { header: "Last Visit", dataKey: "lastVisit", width: 20 },
        { header: "Status", dataKey: "status", width: 15 },
        { header: "Current Stay", dataKey: "currentStay", width: 20 },
      ],
      data: pdfData,
      filename: "guest-list-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground">Manage and view all hotel guests</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              className="pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              <SelectItem value="vip">VIP Guests</SelectItem>
              <SelectItem value="regular">Regular Guests</SelectItem>
              <SelectItem value="new">New Guests</SelectItem>
              <SelectItem value="corporate">Corporate Guests</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setGuestFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Guests</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.filter((g) => g.status === "vip").length}</div>
            <p className="text-xs text-muted-foreground">Premium members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Guests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.filter((g) => g.currentStay).length}</div>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.filter((g) => g.status === "new").length}</div>
            <p className="text-xs text-muted-foreground">First-time guests</p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List */}
      <Card>
        <CardHeader>
          <CardTitle>All Guests</CardTitle>
          <CardDescription>Complete list of hotel guests and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex flex-col lg:flex-row items-start justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4 w-full lg:w-auto">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg" alt={guest.name} />
                    <AvatarFallback>
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{guest.name}</p>
                      <Badge className={getStatusColor(guest.status)}>{guest.status}</Badge>
                      {guest.currentStay && <Badge variant="outline">Currently in {guest.currentStay}</Badge>}
                    </div>
                    <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {guest.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {guest.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {guest.address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last visit: {guest.lastVisit}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm w-full lg:w-auto">
                  <div className="text-center">
                    <p className="font-medium">{guest.totalStays}</p>
                    <p className="text-muted-foreground">Stays</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{formatCurrency(guest.totalSpent)}</p>
                    <p className="text-muted-foreground">Total Spent</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingGuest(guest)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Guest
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGuest(guest.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Guest
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Dialogs */}
      <GuestForm open={guestFormOpen} onOpenChange={setGuestFormOpen} onSubmit={handleCreateGuest} mode="create" />

      <GuestForm
        open={!!editingGuest}
        onOpenChange={(open) => !open && setEditingGuest(null)}
        guest={editingGuest}
        onSubmit={handleEditGuest}
        mode="edit"
      />
    </div>
  )
}
