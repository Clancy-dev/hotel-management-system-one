"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Plus, Trash2, Settings, DollarSign, Timer, Calendar, AlertCircle } from "lucide-react"
import { usePolicy, type LateCheckOutRate, type EarlyCheckInRate, type OvertimeRate } from "@/hooks/use-policy"
import { useCurrency } from "@/hooks/use-currency"
import { Alert, AlertDescription } from "@/components/ui/alert"


export function PolicyConfig() {
  const { policySettings, setPolicyType, updateStandardPolicy, updateCustomPolicy, updateMixedPolicy } = usePolicy()
  const { currency, formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState(policySettings.type)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Standard Policy Functions
  const addLateCheckOutRate = () => {
    const newRate: LateCheckOutRate = {
      id: generateId(),
      startTime: "11:00",
      endTime: "16:00",
      charge: 0,
      description: "Additional late checkout",
    }
    updateStandardPolicy({
      lateCheckOutRates: [...policySettings.standardPolicy.lateCheckOutRates, newRate],
    })
  }

  const removeLateCheckOutRate = (id: string) => {
    updateStandardPolicy({
      lateCheckOutRates: policySettings.standardPolicy.lateCheckOutRates.filter((rate) => rate.id !== id),
    })
  }

  const updateLateCheckOutRate = (id: string, updates: Partial<LateCheckOutRate>) => {
    updateStandardPolicy({
      lateCheckOutRates: policySettings.standardPolicy.lateCheckOutRates.map((rate) =>
        rate.id === id ? { ...rate, ...updates } : rate,
      ),
    })
  }

  const addEarlyCheckInRate = () => {
    const newRate: EarlyCheckInRate = {
      id: generateId(),
      startTime: "08:00",
      endTime: "12:00",
      charge: 0,
      description: "Additional early check-in",
    }
    updateStandardPolicy({
      earlyCheckInRates: [...policySettings.standardPolicy.earlyCheckInRates, newRate],
    })
  }

  const removeEarlyCheckInRate = (id: string) => {
    updateStandardPolicy({
      earlyCheckInRates: policySettings.standardPolicy.earlyCheckInRates.filter((rate) => rate.id !== id),
    })
  }

  const updateEarlyCheckInRate = (id: string, updates: Partial<EarlyCheckInRate>) => {
    updateStandardPolicy({
      earlyCheckInRates: policySettings.standardPolicy.earlyCheckInRates.map((rate) =>
        rate.id === id ? { ...rate, ...updates } : rate,
      ),
    })
  }

  // Custom Policy Functions
  const addOvertimeRate = () => {
    const newRate: OvertimeRate = {
      id: generateId(),
      afterHours: 3,
      upToHours: 6,
      charge: 0,
      description: "Additional overtime rate",
    }
    updateCustomPolicy({
      overtimeRates: [...policySettings.customPolicy.overtimeRates, newRate],
    })
  }

  const removeOvertimeRate = (id: string) => {
    updateCustomPolicy({
      overtimeRates: policySettings.customPolicy.overtimeRates.filter((rate) => rate.id !== id),
    })
  }

  const updateOvertimeRate = (id: string, updates: Partial<OvertimeRate>) => {
    updateCustomPolicy({
      overtimeRates: policySettings.customPolicy.overtimeRates.map((rate) =>
        rate.id === id ? { ...rate, ...updates } : rate,
      ),
    })
  }

  const handlePolicyTypeChange = (type: string) => {
    setPolicyType(type as any)
    setActiveTab(type as "standard" | "custom" | "mixed")
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Pricing Policy Configuration</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Configure your hotel's pricing policies and check-in/check-out rules
        </p>
      </div>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Policy changes will apply to all new room bookings. Current active policy:
          <Badge variant="secondary" className="ml-2">
            {policySettings.type}
          </Badge>
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={handlePolicyTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Standard Policy</span>
            <span className="sm:hidden">Standard</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Custom Policy</span>
            <span className="sm:hidden">Custom</span>
          </TabsTrigger>
          <TabsTrigger value="mixed" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Mixed Policy</span>
            <span className="sm:hidden">Mixed</span>
          </TabsTrigger>
        </TabsList>

        {/* Standard Policy Tab */}
        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Standard Policy - Night-based Pricing
              </CardTitle>
              <CardDescription>
                Traditional hotel pricing based on nightly stays with customizable check-in/check-out times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price per Night ({currency.code})</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={policySettings.standardPolicy.basePrice}
                    onChange={(e) => updateStandardPolicy({ basePrice: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Enter base price"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Night Duration</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.nightStart}
                      onChange={(e) => updateStandardPolicy({ nightStart: e.target.value })}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.nightEnd}
                      onChange={(e) => updateStandardPolicy({ nightEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Check-in/Check-out Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-in Window
                  </h3>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.checkInStart}
                      onChange={(e) => updateStandardPolicy({ checkInStart: e.target.value })}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.checkInEnd}
                      onChange={(e) => updateStandardPolicy({ checkInEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Check-out Window
                  </h3>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.checkOutStart}
                      onChange={(e) => updateStandardPolicy({ checkOutStart: e.target.value })}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={policySettings.standardPolicy.checkOutEnd}
                      onChange={(e) => updateStandardPolicy({ checkOutEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Late Check-out Rates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Late Check-out Charges
                  </h3>
                  <Button onClick={addLateCheckOutRate} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rate
                  </Button>
                </div>

                <div className="space-y-3">
                  {policySettings.standardPolicy.lateCheckOutRates.map((rate) => (
                    <Card key={rate.id} className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={rate.startTime}
                            onChange={(e) => updateLateCheckOutRate(rate.id, { startTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={rate.endTime}
                            onChange={(e) => updateLateCheckOutRate(rate.id, { endTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Charge ({currency.code})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.charge}
                            onChange={(e) =>
                              updateLateCheckOutRate(rate.id, { charge: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Actions</Label>
                          <Button
                            onClick={() => removeLateCheckOutRate(rate.id)}
                            size="sm"
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Input
                          placeholder="Description (optional)"
                          value={rate.description || ""}
                          onChange={(e) => updateLateCheckOutRate(rate.id, { description: e.target.value })}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Early Check-in Rates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Early Check-in Charges
                  </h3>
                  <Button onClick={addEarlyCheckInRate} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rate
                  </Button>
                </div>

                <div className="space-y-3">
                  {policySettings.standardPolicy.earlyCheckInRates.map((rate) => (
                    <Card key={rate.id} className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={rate.startTime}
                            onChange={(e) => updateEarlyCheckInRate(rate.id, { startTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={rate.endTime}
                            onChange={(e) => updateEarlyCheckInRate(rate.id, { endTime: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Charge ({currency.code})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.charge}
                            onChange={(e) =>
                              updateEarlyCheckInRate(rate.id, { charge: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Actions</Label>
                          <Button
                            onClick={() => removeEarlyCheckInRate(rate.id)}
                            size="sm"
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Input
                          placeholder="Description (optional)"
                          value={rate.description || ""}
                          onChange={(e) => updateEarlyCheckInRate(rate.id, { description: e.target.value })}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Policy Tab */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Custom Policy - Hour-based Pricing
              </CardTitle>
              <CardDescription>
                Flexible pricing based on hourly stays with customizable duration and overtime rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseHours">Base Hours</Label>
                  <Input
                    id="baseHours"
                    type="number"
                    min="1"
                    value={policySettings.customPolicy.baseHours}
                    onChange={(e) => updateCustomPolicy({ baseHours: Number.parseInt(e.target.value) || 1 })}
                    placeholder="Enter base hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Price per Hour ({currency.code})</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    step="0.01"
                    value={policySettings.customPolicy.pricePerHour}
                    onChange={(e) => updateCustomPolicy({ pricePerHour: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Enter hourly rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earlyCheckOutRate">Early Check-out Rate ({currency.code})</Label>
                  <Input
                    id="earlyCheckOutRate"
                    type="number"
                    step="0.01"
                    value={policySettings.customPolicy.earlyCheckOutRate || 0}
                    onChange={(e) => updateCustomPolicy({ earlyCheckOutRate: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="Early checkout fee"
                  />
                </div>
              </div>

              <Separator />

              {/* Overtime Rates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Overtime Charges
                  </h3>
                  <Button onClick={addOvertimeRate} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rate
                  </Button>
                </div>

                <div className="space-y-3">
                  {policySettings.customPolicy.overtimeRates.map((rate) => (
                    <Card key={rate.id} className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">After Hours</Label>
                          <Input
                            type="number"
                            min="1"
                            value={rate.afterHours}
                            onChange={(e) =>
                              updateOvertimeRate(rate.id, { afterHours: Number.parseInt(e.target.value) || 1 })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Up to Hours (Optional)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={rate.upToHours || ""}
                            onChange={(e) =>
                              updateOvertimeRate(rate.id, { upToHours: Number.parseInt(e.target.value) || undefined })
                            }
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Charge ({currency.code})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={rate.charge}
                            onChange={(e) =>
                              updateOvertimeRate(rate.id, { charge: Number.parseFloat(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Actions</Label>
                          <Button
                            onClick={() => removeOvertimeRate(rate.id)}
                            size="sm"
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Input
                          placeholder="Description (optional)"
                          value={rate.description || ""}
                          onChange={(e) => updateOvertimeRate(rate.id, { description: e.target.value })}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mixed Policy Tab */}
        <TabsContent value="mixed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Mixed Policy - Best of Both Worlds
              </CardTitle>
              <CardDescription>Combine both standard and custom policies for maximum flexibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Mixed policy allows you to offer both nightly and hourly rates. Configure both policies above, then
                  set the default mode for new bookings.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label>Default Booking Mode</Label>
                <div className="flex gap-4">
                  <Button
                    variant={policySettings.mixedPolicy.defaultMode === "standard" ? "default" : "outline"}
                    onClick={() => updateMixedPolicy({ defaultMode: "standard" })}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Standard (Nightly)
                  </Button>
                  <Button
                    variant={policySettings.mixedPolicy.defaultMode === "custom" ? "default" : "outline"}
                    onClick={() => updateMixedPolicy({ defaultMode: "custom" })}
                    className="flex-1"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Custom (Hourly)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Standard Policy Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Base Price: {formatPrice(policySettings.standardPolicy.basePrice)}</p>
                    <p>
                      Check-in: {policySettings.standardPolicy.checkInStart} -{" "}
                      {policySettings.standardPolicy.checkInEnd}
                    </p>
                    <p>
                      Check-out: {policySettings.standardPolicy.checkOutStart} -{" "}
                      {policySettings.standardPolicy.checkOutEnd}
                    </p>
                    <p>Late checkout rates: {policySettings.standardPolicy.lateCheckOutRates.length}</p>
                    <p>Early check-in rates: {policySettings.standardPolicy.earlyCheckInRates.length}</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Custom Policy Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Base Hours: {policySettings.customPolicy.baseHours}</p>
                    <p>Price per Hour: {formatPrice(policySettings.customPolicy.pricePerHour)}</p>
                    <p>Early Checkout: {formatPrice(policySettings.customPolicy.earlyCheckOutRate || 0)}</p>
                    <p>Overtime rates: {policySettings.customPolicy.overtimeRates.length}</p>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
