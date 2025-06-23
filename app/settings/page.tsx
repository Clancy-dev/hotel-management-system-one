import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Hotel,
  Users,
  SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Smartphone,
  Globe,
  Database,
  Key,
  Save,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your hotel system configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Hotel Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              <CardTitle>Hotel Information</CardTitle>
            </div>
            <CardDescription>Basic information about your hotel property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">Hotel Name</Label>
                <Input id="hotel-name" defaultValue="Grand Plaza Hotel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-phone">Phone Number</Label>
                <Input id="hotel-phone" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-address">Address</Label>
              <Textarea id="hotel-address" defaultValue="123 Main Street, Downtown District, New York, NY 10001" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hotel-email">Email</Label>
                <Input id="hotel-email" type="email" defaultValue="info@grandplaza.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-website">Website</Label>
                <Input id="hotel-website" defaultValue="www.grandplaza.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>System Configuration</CardTitle>
            </div>
            <CardDescription>Configure system-wide settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Check-in</Label>
                <p className="text-sm text-muted-foreground">Allow guests to check-in automatically at 3:00 PM</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Late Check-out Fees</Label>
                <p className="text-sm text-muted-foreground">Automatically charge fees for late check-outs</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Confirmations</Label>
                <p className="text-sm text-muted-foreground">Send automatic booking confirmations to guests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check-in-time">Standard Check-in Time</Label>
                <Input id="check-in-time" type="time" defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-out-time">Standard Check-out Time</Label>
                <Input id="check-out-time" type="time" defaultValue="11:00" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Currency Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Language & Currency</CardTitle>
            </div>
            <CardDescription>Configure system language and currency preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="system-language">System Language</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    <SelectItem value="dd-mmm-yyyy">DD-MMM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primary-currency">Primary Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="eur">EUR - Euro (€)</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound (£)</SelectItem>
                    <SelectItem value="jpy">JPY - Japanese Yen (¥)</SelectItem>
                    <SelectItem value="cad">CAD - Canadian Dollar (C$)</SelectItem>
                    <SelectItem value="aud">AUD - Australian Dollar (A$)</SelectItem>
                    <SelectItem value="chf">CHF - Swiss Franc (CHF)</SelectItem>
                    <SelectItem value="cny">CNY - Chinese Yuan (¥)</SelectItem>
                    <SelectItem value="inr">INR - Indian Rupee (₹)</SelectItem>
                    <SelectItem value="brl">BRL - Brazilian Real (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-display">Currency Display</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="symbol">Symbol ($100.00)</SelectItem>
                    <SelectItem value="code">Code (USD 100.00)</SelectItem>
                    <SelectItem value="name">Name (100.00 US Dollars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                    <SelectItem value="est">Eastern Time (GMT-5)</SelectItem>
                    <SelectItem value="cst">Central Time (GMT-6)</SelectItem>
                    <SelectItem value="mst">Mountain Time (GMT-7)</SelectItem>
                    <SelectItem value="pst">Pacific Time (GMT-8)</SelectItem>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT+0)</SelectItem>
                    <SelectItem value="cet">Central European Time (GMT+1)</SelectItem>
                    <SelectItem value="jst">Japan Standard Time (GMT+9)</SelectItem>
                    <SelectItem value="aest">Australian Eastern Time (GMT+10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number-format">Number Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select number format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">1,234.56 (US Format)</SelectItem>
                    <SelectItem value="eu">1.234,56 (European Format)</SelectItem>
                    <SelectItem value="in">1,23,456.78 (Indian Format)</SelectItem>
                    <SelectItem value="ch">1'234.56 (Swiss Format)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Multi-Currency Support</Label>
                <p className="text-sm text-muted-foreground">Allow guests to view prices in their preferred currency</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Currency Conversion</Label>
                <p className="text-sm text-muted-foreground">Automatically convert prices using live exchange rates</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive urgent notifications via SMS</p>
                </div>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Notification Types</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Reservations</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maintenance Requests</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Confirmations</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Guest Check-ins/Check-outs</span>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>Manage system users and their permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Admin Users</p>
                <p className="text-sm text-muted-foreground">Users with full system access</p>
              </div>
              <Badge variant="secondary">3 Active</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Staff Users</p>
                <p className="text-sm text-muted-foreground">Front desk and housekeeping staff</p>
              </div>
              <Badge variant="secondary">12 Active</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Manager Users</p>
                <p className="text-sm text-muted-foreground">Department managers and supervisors</p>
              </div>
              <Badge variant="secondary">5 Active</Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Manage Users & Permissions
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Configure security and access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-duration">Session Duration (minutes)</Label>
                <Input id="session-duration" type="number" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Settings</CardTitle>
            </div>
            <CardDescription>Configure payment processing and billing options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Credit Card Processing</p>
                <p className="text-sm text-muted-foreground">Stripe integration active</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Connected</Badge>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" defaultValue="8.5" step="0.1" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Payment Collection</Label>
                <p className="text-sm text-muted-foreground">Charge cards automatically at check-in</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Integrations</CardTitle>
            </div>
            <CardDescription>Manage third-party integrations and APIs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking.com</p>
                <p className="text-sm text-muted-foreground">Channel manager integration</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Expedia</p>
                <p className="text-sm text-muted-foreground">Online travel agency</p>
              </div>
              <Badge variant="secondary">Inactive</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Google Analytics</p>
                <p className="text-sm text-muted-foreground">Website analytics tracking</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Manage API Keys
            </Button>
          </CardContent>
        </Card>

        {/* Backup & Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Backup & Data Management</CardTitle>
            </div>
            <CardDescription>Configure data backup and export settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Automatic Backups</p>
                <p className="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Enabled</Badge>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Input id="backup-frequency" defaultValue="Daily" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention-period">Retention Period (days)</Label>
                <Input id="retention-period" type="number" defaultValue="30" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Database className="mr-2 h-4 w-4" />
                Create Backup Now
              </Button>
              <Button variant="outline" className="flex-1">
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
