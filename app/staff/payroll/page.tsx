"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, Download, Search, Calendar, Clock, TrendingUp, Users } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { generatePDF } from "@/lib/pdf-utils"

export default function PayrollPage() {
  const { formatCurrency } = useCurrency()

  const payrollData = [
    {
      id: 1,
      name: "Sarah Johnson",
      employeeId: "EMP001",
      position: "Front Desk Manager",
      department: "Front Desk",
      baseSalary: 45000,
      hoursWorked: 160,
      overtimeHours: 8,
      grossPay: 3750,
      deductions: 750,
      netPay: 3000,
      status: "processed",
    },
    {
      id: 2,
      name: "Mike Wilson",
      employeeId: "EMP002",
      position: "Housekeeping Supervisor",
      department: "Housekeeping",
      baseSalary: 38000,
      hoursWorked: 168,
      overtimeHours: 8,
      grossPay: 3167,
      deductions: 633,
      netPay: 2534,
      status: "processed",
    },
    {
      id: 3,
      name: "Lisa Chen",
      employeeId: "EMP003",
      position: "Maintenance Technician",
      department: "Maintenance",
      baseSalary: 42000,
      hoursWorked: 160,
      overtimeHours: 0,
      grossPay: 3500,
      deductions: 700,
      netPay: 2800,
      status: "pending",
    },
    {
      id: 4,
      name: "David Brown",
      employeeId: "EMP004",
      position: "Night Auditor",
      department: "Front Desk",
      baseSalary: 35000,
      hoursWorked: 144,
      overtimeHours: 0,
      grossPay: 2917,
      deductions: 583,
      netPay: 2334,
      status: "pending",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const exportToPDF = () => {
    const pdfData = payrollData.map((employee) => ({
      name: employee.name,
      employeeId: employee.employeeId,
      position: employee.position,
      department: employee.department,
      hoursWorked: `${employee.hoursWorked}h`,
      overtimeHours: `${employee.overtimeHours}h`,
      grossPay: formatCurrency(employee.grossPay),
      deductions: formatCurrency(employee.deductions),
      netPay: formatCurrency(employee.netPay),
      status: employee.status,
    }))

    generatePDF({
      title: "Payroll Report",
      subtitle: "Monthly payroll summary for all staff members",
      columns: [
        { header: "Name", dataKey: "name", width: 25 },
        { header: "Employee ID", dataKey: "employeeId", width: 20 },
        { header: "Position", dataKey: "position", width: 30 },
        { header: "Hours", dataKey: "hoursWorked", width: 15 },
        { header: "Overtime", dataKey: "overtimeHours", width: 15 },
        { header: "Gross Pay", dataKey: "grossPay", width: 20 },
        { header: "Deductions", dataKey: "deductions", width: 20 },
        { header: "Net Pay", dataKey: "netPay", width: 20 },
        { header: "Status", dataKey: "status", width: 15 },
      ],
      data: pdfData,
      filename: "payroll-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground">Manage staff payroll and compensation</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select pay period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="january">January 2024</SelectItem>
              <SelectItem value="december">December 2023</SelectItem>
              <SelectItem value="november">November 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Payroll
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(142580)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(2970)}</div>
            <p className="text-xs text-muted-foreground">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Payroll Details</CardTitle>
              <CardDescription>Current pay period payroll information</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search employees..." className="pl-8 w-full sm:w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="front-desk">Front Desk</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Position</th>
                  <th className="text-left p-2">Hours</th>
                  <th className="text-left p-2">Overtime</th>
                  <th className="text-left p-2">Gross Pay</th>
                  <th className="text-left p-2">Deductions</th>
                  <th className="text-left p-2">Net Pay</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((employee) => (
                  <tr key={employee.id} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{employee.position}</p>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                    </td>
                    <td className="p-2">{employee.hoursWorked}h</td>
                    <td className="p-2">{employee.overtimeHours}h</td>
                    <td className="p-2 font-medium">{formatCurrency(employee.grossPay)}</td>
                    <td className="p-2">{formatCurrency(employee.deductions)}</td>
                    <td className="p-2 font-bold">{formatCurrency(employee.netPay)}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
            <CardDescription>Payroll costs by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { department: "Front Desk", employees: 12, cost: 38500 },
                { department: "Housekeeping", employees: 18, cost: 45200 },
                { department: "Food & Beverage", employees: 8, cost: 28900 },
                { department: "Maintenance", employees: 6, cost: 19800 },
                { department: "Management", employees: 4, cost: 32180 },
              ].map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">{dept.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(dept.cost)}</div>
                    <div className="text-xs text-muted-foreground">Monthly cost</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Actions</CardTitle>
            <CardDescription>Quick actions for payroll management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Process Current Payroll
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Generate Pay Stubs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Tax Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Clock className="mr-2 h-4 w-4" />
              Overtime Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Employee Benefits
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
