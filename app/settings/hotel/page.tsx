import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Hotel, MapPin, Clock, Wifi, Car, Coffee, Dumbbell, Save, Upload } from "lucide-react"

export default function HotelSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hotel Settings</h1>
        <p className="text-muted-foreground">Configure your hotel's basic information and amenities</p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              <CardTitle>Basic Information</CardTitle>
            </div>
            <CardDescription>Essential details about your hotel property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">Hotel Name</Label>
                <Input id="hotel-name" defaultValue="Grand Plaza Hotel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-brand">Brand/Chain</Label>
                <Input id="hotel-brand" placeholder="e.g., Marriott, Hilton" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotel-description">Description</Label>
              <Textarea
                id="hotel-description"
                placeholder="Brief description of your hotel..."
                defaultValue="A luxury hotel in the heart of downtown, offering world-class amenities and exceptional service."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="star-rating">Star Rating</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-type">Hotel Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business Hotel</SelectItem>
                    <SelectItem value="resort">Resort</SelectItem>
                    <SelectItem value="boutique">Boutique Hotel</SelectItem>
                    <SelectItem value="budget">Budget Hotel</SelectItem>
                    <SelectItem value="luxury">Luxury Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Contact Information</CardTitle>
            </div>
            <CardDescription>How guests can reach and find your hotel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" defaultValue="123 Main Street" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" defaultValue="NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP/Postal Code</Label>
                <Input id="zip" defaultValue="10001" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="info@grandplaza.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="www.grandplaza.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Operating Hours</CardTitle>
            </div>
            <CardDescription>Set your hotel's operational schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check-in-time">Check-in Time</Label>
                <Input id="check-in-time" type="time" defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-out-time">Check-out Time</Label>
                <Input id="check-out-time" type="time" defaultValue="11:00" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="front-desk-hours">Front Desk Hours</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24-7">24/7</SelectItem>
                    <SelectItem value="6-22">6:00 AM - 10:00 PM</SelectItem>
                    <SelectItem value="7-23">7:00 AM - 11:00 PM</SelectItem>
                    <SelectItem value="8-20">8:00 AM - 8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="concierge-hours">Concierge Hours</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24-7">24/7</SelectItem>
                    <SelectItem value="8-20">8:00 AM - 8:00 PM</SelectItem>
                    <SelectItem value="9-18">9:00 AM - 6:00 PM</SelectItem>
                    <SelectItem value="none">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Amenities</CardTitle>
            <CardDescription>Configure available amenities and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Amenities</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm">Free WiFi</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span className="text-sm">Parking</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      <span className="text-sm">Restaurant</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      <span className="text-sm">Fitness Center</span>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Premium Services</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Swimming Pool</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Spa & Wellness</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business Center</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Room Service</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Policies</CardTitle>
            <CardDescription>Set your hotel's rules and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation-policy"
                placeholder="Describe your cancellation policy..."
                defaultValue="Free cancellation up to 24 hours before check-in. Late cancellations will be charged one night's stay."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-policy">Pet Policy</Label>
              <Textarea
                id="pet-policy"
                placeholder="Describe your pet policy..."
                defaultValue="Pets are welcome with prior approval. Additional cleaning fee may apply."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smoking-policy">Smoking Policy</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-smoking">Non-smoking property</SelectItem>
                    <SelectItem value="designated-areas">Designated smoking areas</SelectItem>
                    <SelectItem value="smoking-rooms">Smoking rooms available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-restriction">Minimum Age</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18">18 years</SelectItem>
                    <SelectItem value="21">21 years</SelectItem>
                    <SelectItem value="none">No restriction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Images</CardTitle>
            <CardDescription>Upload and manage your hotel's photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Main Hotel Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload main image</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Click to upload logo</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">Upload gallery images</p>
                <p className="text-sm text-muted-foreground">Drag and drop multiple images or click to browse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Hotel Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
