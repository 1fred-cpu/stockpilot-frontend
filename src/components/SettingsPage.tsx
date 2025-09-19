import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Settings, User, Store, Bell, Key, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account and store preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-none border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="#profile-settings">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
              </Link>

              <Link href="#store-settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Store className="w-4 h-4 mr-2" />
                  Store Settings
                </Button>
              </Link>

              <Link href="#notifications-settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </Link>

              <Link href="#integrations">
                <Button variant="ghost" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  API & Integrations
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-white shadow-none border-0" id="profile-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/01.png" alt="Profile" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-600 mt-1">
                    JPG, PNG or GIF. Max size 1MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>

          {/* Store Settings */}
          <Card className="bg-white shadow-none border-0" id="store-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Store Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue="StockPilot Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  defaultValue="Your one-stop shop for electronics and accessories"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  defaultValue="123 Business Street, City, State 12345"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="America/New_York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" defaultValue="English" />
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Store Settings
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card
            className="bg-white shadow-none border-0"
            id="notifications-settings"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified when items are running low
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Order Notifications</p>
                    <p className="text-sm text-gray-600">
                      Receive alerts for new customer orders
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Sales Reports</p>
                    <p className="text-sm text-gray-600">
                      Get weekly sales performance summaries
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Updates</p>
                    <p className="text-sm text-gray-600">
                      Receive product updates and marketing tips
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* API & Integrations */}
          <Card className="bg-white shadow-none border-0" id="integrations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys & Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg gap-4 md:gap-0">
                  <div>
                    <p className="font-medium">StockPilot API Key</p>
                    <p className="text-sm text-gray-600">
                      For integrating with external systems
                    </p>
                    <Badge variant="outline" className="mt-1">
                      Active
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg gap-4 md:gap-0 items-start">
                  <div>
                    <p className="font-medium">Shopify Integration</p>
                    <p className="text-sm text-gray-600">
                      Sync products with your Shopify store
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Inactive
                    </Badge>
                  </div>
                  <Button variant="default" size="sm">
                    Connect
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg gap-4 md:gap-0 items-start">
                  <div>
                    <p className="font-medium">WooCommerce Integration</p>
                    <p className="text-sm text-gray-600">
                      Connect with your WooCommerce store
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Inactive
                    </Badge>
                  </div>
                  <Button variant="default" size="sm">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
