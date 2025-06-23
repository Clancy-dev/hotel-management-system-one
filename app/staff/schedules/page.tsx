"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, Search, Edit, Users, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function SchedulesPage() {
  const schedules = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Front Desk Manager",
      department: "Front Desk",
      monday: "8:00 AM - 4:00 PM",
      tuesday: "8:00 AM - 4:00 PM",
      wednesday: "8:00 AM - 4:00 PM",
      thursday: "8:00 AM - 4:00 PM",
      friday: "8:00 AM - 4:00 PM",
      saturday: "Off",
      sunday: "Off",
      totalHours: 40,
    },
    {
      id: 2,
      name: "Mike Wilson",
      position: "Housekeeping Supervisor",
      department: "Housekeeping",
      monday: "6:00 AM - 2:00 PM",
      tuesday: "6:00 AM - 2:00 PM",
      wednesday: "6:00 AM - 2:00 PM",
      thursday: "6:00 AM - 2:00 PM",
      friday: "6:00 AM - 2:00 PM",
      saturday: "6:00 AM - 2:00 PM",
      sunday: "Off",
      totalHours: 48,
    },
    {
      id: 3,
      name: "Lisa Chen",
      position: "Maintenance Technician",
      department: "Maintenance",
      monday: "2:00 PM - 10:00 PM",
      tuesday: "2:00 PM - 10:00 PM",
      wednesday: "2:00 PM - 10:00 PM",
      thursday: "2:00 PM - 10:00 PM",
      friday: "Off",
      saturday: "Off",
      sunday: "2:00 PM - 10:00 PM",
      totalHours: 40,
    },
  ]

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Front Desk":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Housekeeping":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Maintenance":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const exportToPDF = () => {
    const pdfData = schedules.map((schedule) => ({
      name: schedule.name,
      position: schedule.position,
      department: schedule.department,
      monday: schedule.monday,
      tuesday: schedule.tuesday,
      wednesday: schedule.wednesday,
      thursday: schedule.thursday,
      friday: schedule.friday,
      saturday: schedule.saturday,
      sunday: schedule.sunday,
      totalHours: `${schedule.totalHours}h`,
    }))

    generatePDF({
      title: "Staff Schedules Report",
      subtitle: "Work schedules and shifts for all staff members",
      columns: [
        { header: "Name", dataKey: "name", width: 25 },
        { header: "Position", dataKey: "position", width: 30 },
        { header: "Monday", dataKey: "monday", width: 20 },
        { header: "Tuesday", dataKey: "tuesday", width: 20 },
        { header: "Wednesday", dataKey: "wednesday", width: 20 },
        { header: "Thursday", dataKey: "thursday", width: 20 },
        { header: "Friday", dataKey: "friday", width: 20 },
        { header: "Saturday", dataKey: "saturday", width: 20 },
        { header: "Sunday", dataKey: "sunday", width: 20 },
        { header: "Total Hours", dataKey: "totalHours", width: 15 },
      ],
      data: pdfData,
      filename: "staff-schedules-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Schedules</h1>
          <p className="text-muted-foreground">Manage work schedules and shifts for all staff members</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search staff..." className="pl-8 w-full sm:w-48" />
          </div>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Week of January 15 - 21, 2024</CardTitle>
              <CardDescription>Current week schedule overview</CardDescription>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="px-4">
                This Week
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,920</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Scheduled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Out of 48 staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Extra hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Need coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Staff work schedules for the current week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Staff Member</th>
                    <th className="text-center p-2 font-medium">Mon</th>
                    <th className="text-center p-2 font-medium">Tue</th>
                    <th className="text-center p-2 font-medium">Wed</th>
                    <th className="text-center p-2 font-medium">Thu</th>
                    <th className="text-center p-2 font-medium">Fri</th>
                    <th className="text-center p-2 font-medium">Sat</th>
                    <th className="text-center p-2 font-medium">Sun</th>
                    <th className="text-center p-2 font-medium">Total</th>
                    <th className="text-center p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-sm text-muted-foreground">{schedule.position}</p>
                          <Badge className={`${getDepartmentColor(schedule.department)} text-xs`}>
                            {schedule.department}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.monday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.monday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.tuesday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.tuesday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.wednesday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.wednesday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.thursday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.thursday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.friday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.friday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.saturday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.saturday}
                        </div>
                      </td>
                      <td className="p-2 text-center text-sm">
                        <div className={schedule.sunday === "Off" ? "text-muted-foreground" : ""}>
                          {schedule.sunday}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={schedule.totalHours > 40 ? "destructive" : "default"}>
                          {schedule.totalHours}h
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Schedule Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Schedule</CardTitle>
              <CardDescription>Create or modify a staff schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-select">Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Wilson</SelectItem>
                    <SelectItem value="lisa">Lisa Chen</SelectItem>
                    <SelectItem value="david">David Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-type">Shift Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                    <SelectItem value="day">Day (8 AM - 4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                    <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                    <SelectItem value="custom">Custom Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input id="start-time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input id="end-time" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <Button key={day} variant="outline" size="sm" className="h-8">
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Save Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Shift Coverage */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shift Coverage</CardTitle>
              <CardDescription>Daily shift coverage and staffing levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Morning Shift</h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Full</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">6:00 AM - 2:00 PM</p>
                    <p className="text-lg font-bold">15/15 Staff</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Day Shift</h4>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Short
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">8:00 AM - 4:00 PM</p>
                    <p className="text-lg font-bold">18/20 Staff</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Evening Shift</h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Full</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">2:00 PM - 10:00 PM</p>
                    <p className="text-lg font-bold">12/12 Staff</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Night Shift</h4>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Critical</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">10:00 PM - 6:00 AM</p>
                    <p className="text-lg font-bold">3/5 Staff</p>
                    <p className="text-sm text-red-600 mt-1">2 positions need coverage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
