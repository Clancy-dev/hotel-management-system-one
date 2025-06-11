"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/use-currency"
import { usePolicy } from "@/hooks/use-policy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check, Globe, Calendar, Timer, Settings, Search } from "lucide-react"
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input"
import { PolicyConfig } from "@/components/policy/policy-config"

export default function SettingsPage() {
  const { currency, setCurrency, availableCurrencies } = useCurrency()
  const { policySettings, setPolicyType } = usePolicy()
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("currency")

  // Group currencies by region
  const regions = [...new Set(availableCurrencies.map((c) => c.region))].sort()

  // Filter currencies based on search term
  const filteredCurrencies =
    searchTerm.trim() === ""
      ? availableCurrencies
      : availableCurrencies.filter(
          (curr) =>
            curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            curr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            curr.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
        )

  // Group filtered currencies by region
  const filteredRegions = [...new Set(filteredCurrencies.map((c) => c.region))].sort()

  const handleSaveCurrency = () => {
    setCurrency(selectedCurrency as any)
    toast.success(`Currency changed to ${selectedCurrency}`)
  }

  return (
    <div className="container py-4 sm:py-8 max-w-5xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="currency" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Globe className="h-4 w-4" />
            <span>Currency</span>
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Settings className="h-4 w-4" />
            <span>Hotel Policy</span>
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

                  {/* Search bar for currencies */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search currencies..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {filteredRegions.map((region) => (
                      <div key={region} className="space-y-2 sm:space-y-3">
                        <h4 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                          {region}
                        </h4>
                        <RadioGroup
                          value={selectedCurrency}
                          onValueChange={(value) => setSelectedCurrency(value as typeof selectedCurrency)}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
                        >
                          {filteredCurrencies
                            .filter((curr) => curr.region === region)
                            .map((curr) => (
                              <div key={curr.code} className="flex items-center space-x-2">
                                <RadioGroupItem value={curr.code} id={curr.code} className="flex-shrink-0" />
                                <Label
                                  htmlFor={curr.code}
                                  className="flex items-center gap-2 cursor-pointer flex-1 p-1.5 sm:p-2 rounded hover:bg-muted min-w-0"
                                >
                                  <span className="font-mono text-sm flex-shrink-0 min-w-[1.5rem]">{curr.symbol}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs sm:text-sm font-medium truncate">{curr.name}</div>
                                    <div className="text-xs text-muted-foreground">{curr.code}</div>
                                  </div>
                                  {currency.code === curr.code && (
                                    <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                                  )}
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    ))}

                    {filteredCurrencies.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No currencies found matching "{searchTerm}"
                      </div>
                    )}
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

        <TabsContent value="policy">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Hotel Policy Settings</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure your hotel's pricing policies and check-in/check-out rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <PolicyConfig />

              <div className="flex justify-end pt-6 border-t mt-6">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setPolicyType("standard")}
                    className={`flex items-center gap-2 ${policySettings.type === "standard" ? "border-primary" : ""}`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Confirm Standard Policy</span>
                    {policySettings.type === "standard" && <Check className="h-4 w-4 ml-1 text-primary" />}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setPolicyType("custom")}
                    className={`flex items-center gap-2 ${policySettings.type === "custom" ? "border-primary" : ""}`}
                  >
                    <Timer className="h-4 w-4" />
                    <span>Confirm Custom Policy</span>
                    {policySettings.type === "custom" && <Check className="h-4 w-4 ml-1 text-primary" />}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setPolicyType("mixed")}
                    className={`flex items-center gap-2 ${policySettings.type === "mixed" ? "border-primary" : ""}`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Confirm Mixed Policy</span>
                    {policySettings.type === "mixed" && <Check className="h-4 w-4 ml-1 text-primary" />}
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
