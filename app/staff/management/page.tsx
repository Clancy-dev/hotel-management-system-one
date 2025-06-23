"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, Calendar, Clock, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generatePDF } from "@/lib/pdf-utils"

export default function StaffManagementPage() {
  const staff = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@hotel.com",
      phone: "+1 (555) 234-5678",
      position: "Front Desk Manager",
      department: "Front Desk",
      employeeId: "EMP001",
      hireDate: "2022-03-15",
      status: "active",
      shift: "Morning",
      salary: "$45,000",
    },
    {
      id: 2,
      name: "Mike Wilson",
      email: "mike.w@hotel.com",
      phone: "+1 (555) 345-6789",
      position: "Housekeeping Supervisor",
      department: "Housekeeping",
      employeeId: "EMP002",
      hireDate: "2021-08-20",
      status: "active",
      shift: "Day",
      salary: "$38,000",
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa.c@hotel.com",
      phone: "+1 (555) 456-7890",
      position: "Maintenance Technician",
      department: "Maintenance",
      employeeId: "EMP003",
      hireDate: "2023-01-10",
      status: "active",
      shift: "Evening",
      salary: "$42,000",
    },
    {
      id: 4,
      name: "David Brown",
      email: "david.b@hotel.com",
      phone: "+1 (555) 567-8901",
      position: "Night Auditor",
      department: "Front Desk",
      employeeId: "EMP004",
      hireDate: "2022-11-05",
      status: "on-leave",
      shift: "Night",
      salary: "$35,000",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Front Desk":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Housekeeping":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Food & Beverage":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const exportToPDF = () => {
    const pdfData = staff.map((member) => ({
      name: member.name,
      email: member.email,
      phone: member.phone,
      position: member.position,
      department: member.department,
      employeeId: member.employeeId,
      hireDate: member.hireDate,
      status: member.status,
      shift: member.shift,
      salary: member.salary,
    }))

    generatePDF({
      title: "Staff Management Report",
      subtitle: "Hotel staff members and their information",
      columns: [
        { header: "Name", dataKey: "name", width: 25 },
        { header: "Position", dataKey: "position", width: 30 },
        { header: "Department", dataKey: "department", width: 20 },
        { header: "Employee ID", dataKey: "employeeId", width: 20 },
        { header: "Hire Date", dataKey: "hireDate", width: 20 },
        { header: "Status", dataKey: "status", width: 15 },
        { header: "Shift", dataKey: "shift", width: 15 },
        { header: "Salary", dataKey: "salary", width: 20 },
      ],
      data: pdfData,
      filename: "staff-management-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage hotel staff members and their information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search staff..." className="pl-8 w-full sm:w-64" />
          </div>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Staff on leave</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Staff List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All hotel staff members and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                      <Avatar className="h-12 w-12 mx-auto sm:mx-0">
                        <AvatarImage src="/placeholder.svg" alt={member.name} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <Badge className={getDepartmentColor(member.department)}>{member.department}</Badge>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{member.position}</p>
                        <div className="grid gap-1 sm:grid-cols-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-center sm:justify-start gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center justify-center sm:justify-start gap-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </div>
                          <div className="text-center sm:text-left">ID: {member.employeeId}</div>
                          <div className="text-center sm:text-left">Shift: {member.shift}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{member.salary}</p>
                        <p className="text-muted-foreground">Annual</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Time Records
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Staff
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Staff Form */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Staff</CardTitle>
              <CardDescription>Register a new staff member</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name</Label>
                <Input id="staff-name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email Address</Label>
                <Input id="staff-email" type="email" placeholder="staff@hotel.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-phone">Phone Number</Label>
                <Input id="staff-phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="e.g., Front Desk Agent" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front-desk">Front Desk</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="day">Day (8 AM - 4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary</Label>
                <Input id="salary" placeholder="$40,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire-date">Hire Date</Label>
                <Input id="hire-date" type="date" />
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Staff distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-sm text-muted-foreground">Front Desk</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">15</div>
              <p className="text-sm text-muted-foreground">Housekeeping</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">10</div>
              <p className="text-sm text-muted-foreground">F&B</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">4</div>
              <p className="text-sm text-muted-foreground">Security</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">5</div>
              <p className="text-sm text-muted-foreground">Management</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
