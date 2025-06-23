"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Save, Monitor, DollarSign, Loader2, List } from "lucide-react"
import { useCurrency, currencies } from "@/contexts/currency-context"
import { usePagination } from "@/contexts/pagination-context"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SystemSettingsPage() {
  const { currency, setCurrency } = useCurrency()
  const { itemsPerPage, setItemsPerPage } = usePagination()
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Form state
  const [settings, setSettings] = useState({
    systemName: "Hotel Management System",
    companyName: "Grand Plaza Hotel",
    adminEmail: "admin@grandplaza.com",
    supportEmail: "support@grandplaza.com",
    maintenanceMode: false,
    debugMode: false,
    autoUpdates: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    lockoutDuration: "15",
    twoFactorAuth: true,
    passwordComplexity: true,
    ipWhitelist: false,
    backupFrequency: "daily",
    backupRetention: "30",
    backupTime: "02:00",
    maintenanceWindow: "2-4am",
    emailNotifications: true,
    smsNotifications: false,
    systemErrors: true,
    databaseIssues: true,
    securityAlerts: true,
    backupStatus: false,
    performanceWarnings: false,
    cacheDuration: "24",
    maxConcurrentUsers: "100",
    logRetention: "90",
    cleanupFrequency: "daily",
    enableCaching: true,
    compressResponses: true,
    autoCleanup: true,
  })

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save settings to localStorage for persistence
      localStorage.setItem("hotel-system-settings", JSON.stringify(settings))

      toast({
        title: "Settings Saved",
        description: "System settings have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({
      systemName: "Hotel Management System",
      companyName: "Grand Plaza Hotel",
      adminEmail: "admin@grandplaza.com",
      supportEmail: "support@grandplaza.com",
      maintenanceMode: false,
      debugMode: false,
      autoUpdates: true,
      sessionTimeout: "30",
      maxLoginAttempts: "5",
      passwordMinLength: "8",
      lockoutDuration: "15",
      twoFactorAuth: true,
      passwordComplexity: true,
      ipWhitelist: false,
      backupFrequency: "daily",
      backupRetention: "30",
      backupTime: "02:00",
      maintenanceWindow: "2-4am",
      emailNotifications: true,
      smsNotifications: false,
      systemErrors: true,
      databaseIssues: true,
      securityAlerts: true,
      backupStatus: false,
      performanceWarnings: false,
      cacheDuration: "24",
      maxConcurrentUsers: "100",
      logRetention: "90",
      cleanupFrequency: "daily",
      enableCaching: true,
      compressResponses: true,
      autoCleanup: true,
    })

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* System Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <CardTitle>System Information</CardTitle>
            </div>
            <CardDescription>Current system status and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">System Version</Label>
                <p className="text-sm text-muted-foreground">v2.1.4</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">2024-01-10</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Server Status</Label>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Online</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Database Status</Label>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic system configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable system access for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable detailed error logging and debugging</p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, debugMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Updates</Label>
                  <p className="text-sm text-muted-foreground">Automatically install system updates</p>
                </div>
                <Switch
                  checked={settings.autoUpdates}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoUpdates: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Currency Settings</CardTitle>
            </div>
            <CardDescription>Configure the default currency for the entire system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={currencyOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg">{currency.symbol}</span>
                      <span>
                        {currency.name} ({currency.code})
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {currencies.map((curr) => (
                          <CommandItem
                            key={curr.code}
                            value={curr.code}
                            onSelect={() => {
                              setCurrency(curr)
                              setCurrencyOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", currency.code === curr.code ? "opacity-100" : "opacity-0")}
                            />
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-lg w-8">{curr.symbol}</span>
                              <span>
                                {curr.name} ({curr.code})
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This currency will be used throughout the entire application for displaying prices, revenue reports, and
                financial data. The setting is automatically saved and will persist across browser sessions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pagination Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <CardTitle>Pagination Settings</CardTitle>
            </div>
            <CardDescription>Configure how many items to display per page across the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="items-per-page">Items Per Page</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This setting controls how many items are displayed per page in all lists throughout the application
                (rooms, guests, reservations, etc.). The setting is automatically saved and applied globally.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Configure system security and access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password-min-length">Minimum Password Length</Label>
                <Input
                  id="password-min-length"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
                <Input
                  id="lockout-duration"
                  type="number"
                  value={settings.lockoutDuration}
                  onChange={(e) => setSettings({ ...settings, lockoutDuration: e.target.value })}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Complexity</Label>
                  <p className="text-sm text-muted-foreground">Require special characters and numbers</p>
                </div>
                <Switch
                  checked={settings.passwordComplexity}
                  onCheckedChange={(checked) => setSettings({ ...settings, passwordComplexity: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
                <Switch
                  checked={settings.ipWhitelist}
                  onCheckedChange={(checked) => setSettings({ ...settings, ipWhitelist: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleResetSettings} disabled={isSaving}>
            Reset to Defaults
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save System Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
