"use client"

import { useState } from "react"
import { useCurrency } from "@/hooks/use-currency"
import { usePolicy } from "@/hooks/use-policy"
import { useLanguage } from "@/hooks/use-language"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Check, Globe, Calendar, Timer, Settings, Search, Languages, Eye } from "lucide-react"
import { toast } from "react-hot-toast"
import { Input } from "@/components/ui/input"
import { PolicyConfig } from "@/components/policy/policy-config"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const { currency, setCurrency, availableCurrencies } = useCurrency()
  const { policySettings, setPolicyType } = usePolicy()
  const { language, setLanguage, availableLanguages, t } = useLanguage()
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code)
  const [selectedLanguage, setSelectedLanguage] = useState(language.code)
  const [currencySearchTerm, setCurrencySearchTerm] = useState("")
  const [languageSearchTerm, setLanguageSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("currency")

  // Group currencies by region
  const regions = [...new Set(availableCurrencies.map((c) => c.region))].sort()

  // Filter currencies based on search term
  const filteredCurrencies =
    currencySearchTerm.trim() === ""
      ? availableCurrencies
      : availableCurrencies.filter(
          (curr) =>
            curr.name.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
            curr.code.toLowerCase().includes(currencySearchTerm.toLowerCase()) ||
            curr.symbol.toLowerCase().includes(currencySearchTerm.toLowerCase()),
        )

  // Group filtered currencies by region
  const filteredCurrencyRegions = [...new Set(filteredCurrencies.map((c) => c.region))].sort()

  // Filter languages based on search term
  const filteredLanguages =
    languageSearchTerm.trim() === ""
      ? availableLanguages
      : availableLanguages.filter(
          (lang) =>
            lang.name.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(languageSearchTerm.toLowerCase()),
        )

  // Group filtered languages by region
  const languageRegions = [...new Set(filteredLanguages.map((l) => l.region))].sort()

  const handleSaveCurrency = () => {
    setCurrency(selectedCurrency as any)
    toast.success(`${t("settings.currency")} ${t("language.changed")} ${selectedCurrency}`)
  }

  const handleSaveLanguage = () => {
    setLanguage(selectedLanguage as any)
    toast.success(`${t("language.changed")} ${availableLanguages.find((l) => l.code === selectedLanguage)?.name}`)
  }

  const previewLanguage = (langCode: string) => {
    const lang = availableLanguages.find((l) => l.code === langCode)
    if (lang) {
      // Temporarily show preview
      toast.success(`${t("language.preview")}: ${lang.name} (${lang.nativeName})`)
    }
  }

  return (
    <div className="container py-4 sm:py-8 max-w-5xl px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t("settings.title")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="currency" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Globe className="h-4 w-4" />
            <span>{t("settings.currency")}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Languages className="h-4 w-4" />
            <span>{t("settings.language")}</span>
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Settings className="h-4 w-4" />
            <span>{t("settings.policy")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currency">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t("settings.currency")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{t("settings.currency.description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    {t("language.current")} {t("settings.currency")}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-muted rounded-md">
                    <div className="text-xl sm:text-2xl font-bold">{currency.symbol}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{currency.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{currency.code}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">
                    {t("language.select")} {t("settings.currency")}
                  </h3>

                  {/* Search bar for currencies */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("language.search")}
                      className="pl-10"
                      value={currencySearchTerm}
                      onChange={(e) => setCurrencySearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {filteredCurrencyRegions.map((region) => (
                      <div key={region} className="space-y-2 sm:space-y-3">
                        <h4 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                          {region}
                        </h4>
                        <RadioGroup
                          value={selectedCurrency}
                          onValueChange={(value: string) => setSelectedCurrency(value as typeof selectedCurrency)}
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
                        {t("language.search")} "{currencySearchTerm}"
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
                    {t("language.save")} {t("settings.currency")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t("settings.language")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{t("settings.language.description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">{t("language.current")}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 p-3 bg-muted rounded-md">
                    <div className="text-2xl sm:text-3xl">{language.flag}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {language.name} ({language.nativeName})
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                        <span>{language.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {language.direction.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">{t("language.select")}</h3>

                  {/* Search bar for languages */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("language.search")}
                      className="pl-10"
                      value={languageSearchTerm}
                      onChange={(e) => setLanguageSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {languageRegions.map((region) => (
                      <div key={region} className="space-y-2 sm:space-y-3">
                        <h4 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                          {region}
                        </h4>
                        <RadioGroup
                          value={selectedLanguage}
                          onValueChange={(value: string) => setSelectedLanguage(value as typeof selectedLanguage)}
                          className="grid grid-cols-1 gap-2"
                        >
                          {filteredLanguages
                            .filter((lang) => lang.region === region)
                            .map((lang) => (
                              <div key={lang.code} className="flex items-center space-x-2">
                                <RadioGroupItem value={lang.code} id={lang.code} className="flex-shrink-0" />
                                <Label
                                  htmlFor={lang.code}
                                  className="flex items-center gap-3 cursor-pointer flex-1 p-2 sm:p-3 rounded hover:bg-muted min-w-0 border border-transparent hover:border-border"
                                >
                                  <span className="text-2xl sm:text-3xl flex-shrink-0">{lang.flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm sm:text-base font-medium truncate">
                                      {lang.name} ({lang.nativeName})
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="text-xs">
                                        {lang.direction.toUpperCase()}
                                      </Badge>
                                      <span className="text-xs">•</span>
                                      <span className="text-xs">{lang.region}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        previewLanguage(lang.code)
                                      }}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    {language.code === lang.code && <Check className="h-4 w-4 text-green-600" />}
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    ))}

                    {filteredLanguages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No languages found matching "{languageSearchTerm}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Language Information Panel */}
                {selectedLanguage !== language.code && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                      {t("language.preview")} - {availableLanguages.find((l) => l.code === selectedLanguage)?.name}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-800 dark:text-blue-200">
                      <div>
                        <span className="font-medium">{t("language.region")}:</span>{" "}
                        {availableLanguages.find((l) => l.code === selectedLanguage)?.region}
                      </div>
                      <div>
                        <span className="font-medium">{t("language.direction")}:</span>{" "}
                        {availableLanguages.find((l) => l.code === selectedLanguage)?.direction.toUpperCase()}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium">{t("language.font")}:</span>{" "}
                        {availableLanguages.find((l) => l.code === selectedLanguage)?.fontFamily}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleSaveLanguage}
                    disabled={selectedLanguage === language.code}
                    className="w-full sm:w-auto"
                  >
                    {t("language.save")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t("settings.policy")}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{t("settings.policy.description")}</CardDescription>
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
