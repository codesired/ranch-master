
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Globe, 
  Key, 
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import LoadingSpinner from "@/components/shared/loading-spinner";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  healthAlerts: boolean;
  lowStockAlerts: boolean;
  weatherAlerts: boolean;
  maintenanceReminders: boolean;
  financialAlerts: boolean;
  breedingReminders: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  deviceTracking: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  compactMode: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'ranch-members';
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
  thirdPartyIntegrations: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    healthAlerts: true,
    lowStockAlerts: true,
    weatherAlerts: true,
    maintenanceReminders: true,
    financialAlerts: true,
    breedingReminders: true,
    systemUpdates: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    deviceTracking: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
    compactMode: false,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    thirdPartyIntegrations: false,
  });

  // Fetch notification settings
  const { data: notificationData } = useQuery({
    queryKey: ["/api/settings/notifications"],
    enabled: isAuthenticated,
  });

  const { data: securityData } = useQuery({
    queryKey: ["/api/settings/security"],
    enabled: isAuthenticated,
  });

  const { data: appearanceData } = useQuery({
    queryKey: ["/api/settings/appearance"],
    enabled: isAuthenticated,
  });

  const { data: privacyData } = useQuery({
    queryKey: ["/api/settings/privacy"],
    enabled: isAuthenticated,
  });

  // Update settings when data is fetched
  useEffect(() => {
    if (notificationData) setNotificationSettings(notificationData);
    if (securityData) setSecuritySettings(securityData);
    if (appearanceData) setAppearanceSettings(appearanceData);
    if (privacyData) setPrivacySettings(privacyData);
  }, [notificationData, securityData, appearanceData, privacyData]);

  // Mutations
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationSettings) => {
      return await apiRequest("/api/settings/notifications", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Notification settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSecurityMutation = useMutation({
    mutationFn: async (data: SecuritySettings) => {
      return await apiRequest("/api/settings/security", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Security settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAppearanceMutation = useMutation({
    mutationFn: async (data: AppearanceSettings) => {
      return await apiRequest("/api/settings/appearance", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Appearance settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: PrivacySettings) => {
      return await apiRequest("/api/settings/privacy", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Privacy settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string }) => {
      return await apiRequest("/api/settings/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Password changed successfully" });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordField(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/settings/export-data", { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Data export initiated. You'll receive a download link via email." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access settings.</div>;
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    updateNotificationsMutation.mutate(newSettings);
  };

  const handleSecurityChange = (key: keyof SecuritySettings, value: boolean | number) => {
    const newSettings = { ...securitySettings, [key]: value };
    setSecuritySettings(newSettings);
    updateSecurityMutation.mutate(newSettings);
  };

  const handleAppearanceChange = (key: keyof AppearanceSettings, value: string | boolean) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    updateAppearanceMutation.mutate(newSettings);
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: string | boolean) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    updatePrivacyMutation.mutate(newSettings);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ newPassword });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Settings</h1>
          <p className="text-gray-600">Customize your ranch management experience</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Notification Channels</CardTitle>
                <CardDescription>Choose how you'd like to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600">Browser and mobile push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Critical alerts via text message</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Alert Preferences</CardTitle>
                <CardDescription>Configure specific alert types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="healthAlerts">Health Alerts</Label>
                    <p className="text-sm text-gray-600">Animal health issues and veterinary reminders</p>
                  </div>
                  <Switch
                    id="healthAlerts"
                    checked={notificationSettings.healthAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("healthAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStockAlerts">Inventory Alerts</Label>
                    <p className="text-sm text-gray-600">Low stock and supply notifications</p>
                  </div>
                  <Switch
                    id="lowStockAlerts"
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("lowStockAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="financialAlerts">Financial Alerts</Label>
                    <p className="text-sm text-gray-600">Budget limits and expense notifications</p>
                  </div>
                  <Switch
                    id="financialAlerts"
                    checked={notificationSettings.financialAlerts}
                    onCheckedChange={(checked) => handleNotificationChange("financialAlerts", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="breedingReminders">Breeding Reminders</Label>
                    <p className="text-sm text-gray-600">Breeding schedules and pregnancy tracking</p>
                  </div>
                  <Switch
                    id="breedingReminders"
                    checked={notificationSettings.breedingReminders}
                    onCheckedChange={(checked) => handleNotificationChange("breedingReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Account Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSecurityChange("twoFactorEnabled", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loginNotifications">Login Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    id="loginNotifications"
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => handleSecurityChange("loginNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Select 
                    value={securitySettings.sessionTimeout.toString()} 
                    onValueChange={(value) => handleSecurityChange("sessionTimeout", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Password Management</CardTitle>
                <CardDescription>Update your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!showPasswordField ? (
                  <Button 
                    onClick={() => setShowPasswordField(true)}
                    className="w-full ranch-button-primary"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        disabled={changePasswordMutation.isPending}
                        className="ranch-button-primary flex-1"
                      >
                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowPasswordField(false);
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Select 
                    value={securitySettings.passwordExpiry.toString()} 
                    onValueChange={(value) => handleSecurityChange("passwordExpiry", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Theme & Display</CardTitle>
                <CardDescription>Customize the look and feel of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme Preference</Label>
                  <Select 
                    value={appearanceSettings.theme} 
                    onValueChange={(value) => handleAppearanceChange("theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          System Default
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={appearanceSettings.language} 
                    onValueChange={(value) => handleAppearanceChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <p className="text-sm text-gray-600">Show more information in less space</p>
                  </div>
                  <Switch
                    id="compactMode"
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) => handleAppearanceChange("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Regional Settings</CardTitle>
                <CardDescription>Configure locale-specific preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={appearanceSettings.timezone} 
                    onValueChange={(value) => handleAppearanceChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={appearanceSettings.dateFormat} 
                    onValueChange={(value) => handleAppearanceChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US)</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (EU)</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={appearanceSettings.currency} 
                    onValueChange={(value) => handleAppearanceChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Profile & Visibility</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="ranch-members">Ranch Members Only</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Receive emails about new features and updates</p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={privacySettings.marketingEmails}
                    onCheckedChange={(checked) => handlePrivacyChange("marketingEmails", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="thirdPartyIntegrations">Third-Party Integrations</Label>
                    <p className="text-sm text-gray-600">Allow integrations with external services</p>
                  </div>
                  <Switch
                    id="thirdPartyIntegrations"
                    checked={privacySettings.thirdPartyIntegrations}
                    onCheckedChange={(checked) => handlePrivacyChange("thirdPartyIntegrations", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Data & Analytics</CardTitle>
                <CardDescription>Control data collection and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dataSharing">Data Sharing</Label>
                    <p className="text-sm text-gray-600">Share anonymized data to improve the service</p>
                  </div>
                  <Switch
                    id="dataSharing"
                    checked={privacySettings.dataSharing}
                    onCheckedChange={(checked) => handlePrivacyChange("dataSharing", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analyticsTracking">Usage Analytics</Label>
                    <p className="text-sm text-gray-600">Help us improve by tracking app usage</p>
                  </div>
                  <Switch
                    id="analyticsTracking"
                    checked={privacySettings.analyticsTracking}
                    onCheckedChange={(checked) => handlePrivacyChange("analyticsTracking", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Data Management</CardTitle>
                <CardDescription>Export, import, and manage your ranch data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportDataMutation.mutate()}
                  disabled={exportDataMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportDataMutation.isPending ? "Preparing Export..." : "Export All Data"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Data Backup
                </Button>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start text-orange-600 border-orange-200">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500">
                  These actions cannot be undone. Please be certain before proceeding.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
