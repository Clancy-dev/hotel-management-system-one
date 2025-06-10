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
    <div className="container py-4 sm:py-8 max-w-5xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>

      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="currency" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Globe className="h-4 w-4" />
            <span>Currency</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currency">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Currency Settings</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Choose your preferred currency for displaying prices throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Current Currency</h3>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-muted rounded-md">
                    <div className="text-xl sm:text-2xl font-bold">{currency.symbol}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{currency.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{currency.code}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Select Currency</h3>

                  <div className="space-y-4 sm:space-y-6">
                    {regions.map((region) => (
                      <div key={region} className="space-y-2 sm:space-y-3">
                        <h4 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                          {region}
                        </h4>
                        <RadioGroup
                          value={selectedCurrency}
                          onValueChange={setSelectedCurrency}
                          className="grid grid-cols-1 gap-2"
                        >
                          {availableCurrencies
                            .filter((curr) => curr.region === region)
                            .map((curr) => (
                              <div key={curr.code} className="flex items-center space-x-2 sm:space-x-3">
                                <RadioGroupItem value={curr.code} id={curr.code} className="flex-shrink-0" />
                                <Label
                                  htmlFor={curr.code}
                                  className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-1 p-2 sm:p-3 rounded hover:bg-muted min-w-0"
                                >
                                  <span className="font-mono text-sm sm:text-base flex-shrink-0 min-w-[2rem]">
                                    {curr.symbol}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm sm:text-base font-medium truncate">{curr.name}</div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">{curr.code}</div>
                                  </div>
                                  {currency.code === curr.code && (
                                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  )}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveCurrency}
                    disabled={selectedCurrency === currency.code}
                    className="w-full sm:w-auto"
                  >
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
