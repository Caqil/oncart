// src/components/setup/settings-setup.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SetupStepProps } from "./setup-wizard";
import {
  API_ROUTES,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Settings,
  Globe,
  DollarSign,
  Clock,
  Mail,
  CheckCircle,
  AlertTriangle,
  Store,
  Link,
  Palette,
} from "lucide-react";

interface StoreSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  currency: string;
  language: string;
  timezone: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  enableMultivendor: boolean;
  defaultShippingRate: number;
  taxRate: number;
}

interface FormErrors {
  siteName?: string;
  siteUrl?: string;
  adminEmail?: string;
  defaultShippingRate?: string;
  taxRate?: string;
  general?: string;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export function SettingsSetup({
  onNext,
  onPrevious,
  setupData,
  isLoading: parentLoading,
}: SetupStepProps) {
  const [settings, setSettings] = useState<StoreSettings>({
    siteName: setupData.settings.siteName || "My Store",
    siteDescription: "",
    siteUrl: setupData.settings.siteUrl || "https://mystore.com",
    adminEmail: setupData.admin.email || "",
    currency: setupData.settings.currency || "USD",
    language: setupData.settings.language || "en",
    timezone: setupData.settings.timezone || "UTC",
    allowRegistration: true,
    requireEmailVerification: true,
    enableMultivendor: true,
    defaultShippingRate: 10.0,
    taxRate: 0.0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(
    setupData.settings.configured || false
  );

  // Auto-fill admin email from previous step
  useEffect(() => {
    if (setupData.admin.email && !settings.adminEmail) {
      setSettings((prev) => ({ ...prev, adminEmail: setupData.admin.email }));
    }
  }, [setupData.admin.email]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!settings.siteName.trim()) {
      newErrors.siteName = "Site name is required";
    }

    if (!settings.siteUrl.trim()) {
      newErrors.siteUrl = "Site URL is required";
    } else if (!/^https?:\/\/.+/.test(settings.siteUrl)) {
      newErrors.siteUrl =
        "Please enter a valid URL starting with http:// or https://";
    }

    if (!settings.adminEmail.trim()) {
      newErrors.adminEmail = "Admin email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.adminEmail)) {
      newErrors.adminEmail = "Please enter a valid email address";
    }

    if (settings.defaultShippingRate < 0) {
      newErrors.defaultShippingRate = "Shipping rate cannot be negative";
    }

    if (settings.taxRate < 0 || settings.taxRate > 100) {
      newErrors.taxRate = "Tax rate must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof StoreSettings,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setIsSaved(true);

      onNext({
        settings: {
          ...settings,
          configured: true,
        },
      });
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isSaved) {
      onNext();
    } else {
      handleSaveSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Settings className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Configure Your Store</h2>
        <p className="text-gray-600 mt-2">
          Set up basic settings to get your store ready for business
        </p>
      </div>

      {isSaved ? (
        /* Success State */
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Store settings configured successfully! Your ecommerce platform is
            almost ready.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Site Name */}
              <div className="space-y-2">
                <Label htmlFor="site-name">Store Name</Label>
                <Input
                  id="site-name"
                  placeholder="My Awesome Store"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                  className={cn(errors.siteName && "border-red-500")}
                  disabled={isLoading || parentLoading}
                />
                {errors.siteName && (
                  <p className="text-sm text-red-500">{errors.siteName}</p>
                )}
              </div>

              {/* Site Description */}
              <div className="space-y-2">
                <Label htmlFor="site-description">Store Description</Label>
                <Textarea
                  id="site-description"
                  placeholder="A brief description of your store and what you sell..."
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleInputChange("siteDescription", e.target.value)
                  }
                  disabled={isLoading || parentLoading}
                  rows={3}
                />
              </div>

              {/* Site URL */}
              <div className="space-y-2">
                <Label htmlFor="site-url">Store URL</Label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="site-url"
                    placeholder="https://mystore.com"
                    value={settings.siteUrl}
                    onChange={(e) =>
                      handleInputChange("siteUrl", e.target.value)
                    }
                    className={cn("pl-10", errors.siteUrl && "border-red-500")}
                    disabled={isLoading || parentLoading}
                  />
                </div>
                {errors.siteUrl && (
                  <p className="text-sm text-red-500">{errors.siteUrl}</p>
                )}
              </div>

              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@mystore.com"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      handleInputChange("adminEmail", e.target.value)
                    }
                    className={cn(
                      "pl-10",
                      errors.adminEmail && "border-red-500"
                    )}
                    disabled={isLoading || parentLoading}
                  />
                </div>
                {errors.adminEmail && (
                  <p className="text-sm text-red-500">{errors.adminEmail}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization
              </CardTitle>
              <CardDescription>
                Configure currency, language, and timezone settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                  disabled={isLoading || parentLoading}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <SelectValue placeholder="Select currency" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <span>{currency.symbol}</span>
                          <span>
                            {currency.code} - {currency.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                  disabled={isLoading || parentLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        <div className="flex items-center gap-2">
                          <span>{language.flag}</span>
                          <span>{language.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    handleInputChange("timezone", value)
                  }
                  disabled={isLoading || parentLoading}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <SelectValue placeholder="Select timezone" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure how your platform operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Registration Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow User Registration</Label>
                  <p className="text-sm text-gray-500">
                    Allow new customers to create accounts
                  </p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) =>
                    handleInputChange("allowRegistration", checked)
                  }
                  disabled={isLoading || parentLoading}
                />
              </div>

              <Separator />

              {/* Email Verification */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-500">
                    Users must verify their email before accessing their account
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange("requireEmailVerification", checked)
                  }
                  disabled={isLoading || parentLoading}
                />
              </div>

              <Separator />

              {/* Multivendor */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Multi-vendor</Label>
                  <p className="text-sm text-gray-500">
                    Allow multiple vendors to sell on your platform
                  </p>
                </div>
                <Switch
                  checked={settings.enableMultivendor}
                  onCheckedChange={(checked) =>
                    handleInputChange("enableMultivendor", checked)
                  }
                  disabled={isLoading || parentLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Settings
              </CardTitle>
              <CardDescription>
                Set default rates for shipping and taxes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default Shipping Rate */}
              <div className="space-y-2">
                <Label htmlFor="shipping-rate">
                  Default Shipping Rate ({settings.currency})
                </Label>
                <Input
                  id="shipping-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10.00"
                  value={settings.defaultShippingRate}
                  onChange={(e) =>
                    handleInputChange(
                      "defaultShippingRate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={cn(errors.defaultShippingRate && "border-red-500")}
                  disabled={isLoading || parentLoading}
                />
                {errors.defaultShippingRate && (
                  <p className="text-sm text-red-500">
                    {errors.defaultShippingRate}
                  </p>
                )}
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  value={settings.taxRate}
                  onChange={(e) =>
                    handleInputChange(
                      "taxRate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className={cn(errors.taxRate && "border-red-500")}
                  disabled={isLoading || parentLoading}
                />
                {errors.taxRate && (
                  <p className="text-sm text-red-500">{errors.taxRate}</p>
                )}
                <p className="text-xs text-gray-500">
                  This can be overridden per product or vendor
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading || parentLoading}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isLoading || parentLoading}>
          {isSaved ? "Continue" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
