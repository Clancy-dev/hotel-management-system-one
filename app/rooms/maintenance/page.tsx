"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, AlertTriangle, CheckCircle, Clock, Plus, Search, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function MaintenancePage() {
  const maintenanceRequests = [
    {
      id: "MNT001",
      room: "205",
      issue: "Air conditioning not working",
      priority: "high",
      status: "in-progress",
      reportedBy: "Housekeeping",
      assignedTo: "John Doe",
      reportedDate: "2024-01-15",
      estimatedCompletion: "2024-01-16",
    },
    {
      id: "MNT002",
      room: "301",
      issue: "Leaky faucet in bathroom",
      priority: "medium",
      status: "pending",
      reportedBy: "Guest",
      assignedTo: "Mike Wilson",
      reportedDate: "2024-01-14",
      estimatedCompletion: "2024-01-17",
    },
    {
      id: "MNT003",
      room: "102",
      issue: "TV remote not working",
      priority: "low",
      status: "completed",
      reportedBy: "Front Desk",
      assignedTo: "Sarah Johnson",
      reportedDate: "2024-01-13",
      estimatedCompletion: "2024-01-14",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />
      case "in-progress":
        return <Wrench className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3" />
    }
  }

  const exportToPDF = () => {
    const pdfData = maintenanceRequests.map((request) => ({
      id: request.id,
      room: request.room,
      issue: request.issue,
      priority: request.priority,
      status: request.status,
      reportedBy: request.reportedBy,
      assignedTo: request.assignedTo,
      reportedDate: request.reportedDate,
      estimatedCompletion: request.estimatedCompletion,
    }))

    generatePDF({
      title: "Maintenance Requests Report",
      subtitle: "Current and recent maintenance requests overview",
      columns: [
        { header: "Request ID", dataKey: "id", width: 20 },
        { header: "Room", dataKey: "room", width: 15 },
        { header: "Issue", dataKey: "issue", width: 40 },
        { header: "Priority", dataKey: "priority", width: 20 },
        { header: "Status", dataKey: "status", width: 20 },
        { header: "Reported By", dataKey: "reportedBy", width: 25 },
        { header: "Assigned To", dataKey: "assignedTo", width: 25 },
        { header: "Reported Date", dataKey: "reportedDate", width: 25 },
        { header: "Est. Completion", dataKey: "estimatedCompletion", width: 25 },
      ],
      data: pdfData,
      filename: "maintenance-requests-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Maintenance</h1>
          <p className="text-muted-foreground">Track and manage room maintenance requests</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." className="pl-8 w-full sm:w-48" />
          </div>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active repairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Urgent repairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Maintenance Requests List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>Current and recent maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">Room {request.room}</h4>
                          <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.issue}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Reported by:</span> {request.reportedBy}
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span> {request.assignedTo}
                      </div>
                      <div>
                        <span className="font-medium">Reported:</span> {request.reportedDate}
                      </div>
                      <div>
                        <span className="font-medium">Est. completion:</span> {request.estimatedCompletion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Maintenance Request Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>New Maintenance Request</CardTitle>
              <CardDescription>Report a new maintenance issue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-number">Room Number</Label>
                <Input id="room-number" placeholder="e.g., 205" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-type">Issue Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the issue in detail..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reported-by">Reported By</Label>
                <Input id="reported-by" placeholder="Your name" />
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
