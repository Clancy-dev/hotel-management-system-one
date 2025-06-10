"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check, Globe } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const { currency, setCurrency, availableCurrencies } = useCurrency()
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currency.code)

  // Group currencies by region
  const regions = [...new Set(availableCurrencies.map((c) => c.region))].sort()

  const handleSaveCurrency = () => {
    setCurrency(selectedCurrency as any)
    toast.success(`Currency changed to ${selectedCurrency}`)
  }

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Currency</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Choose your preferred currency for displaying prices throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Current Currency</h3>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <div className="text-2xl font-bold">{currency.symbol}</div>
                    <div>
                      <div className="font-medium">{currency.name}</div>
                      <div className="text-sm text-muted-foreground">{currency.code}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Currency</h3>

                  <div className="space-y-6">
                    {regions.map((region) => (
                      <div key={region} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{region}</h4>
                        <RadioGroup
                          value={selectedCurrency}
                          onValueChange={setSelectedCurrency}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                        >
                          {availableCurrencies
                            .filter((curr) => curr.region === region)
                            .map((curr) => (
                              <div key={curr.code} className="flex items-center space-x-2">
                                <RadioGroupItem value={curr.code} id={curr.code} />
                                <Label
                                  htmlFor={curr.code}
                                  className="flex items-center gap-2 cursor-pointer flex-1 p-2 rounded hover:bg-muted"
                                >
                                  <span className="font-mono text-sm">{curr.symbol}</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{curr.name}</div>
                                    <div className="text-xs text-muted-foreground">{curr.code}</div>
                                  </div>
                                  {currency.code === curr.code && <Check className="h-4 w-4 text-green-600" />}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSaveCurrency} disabled={selectedCurrency === currency.code}>
                    Save Currency Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
