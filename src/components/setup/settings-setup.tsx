"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Store, Globe, Clock } from "lucide-react";

interface SettingsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

export function SettingsStep({ data, onUpdate, onNext }: SettingsStepProps) {
  const [validation, setValidation] = useState<any>({});

  const settingsData = data.settings || {
    siteName: "",
    siteUrl: "",
    currency: "USD",
    language: "en",
    timezone: "UTC",
  };

  const sampleDataSettings = data.sampleData || {
    enabled: false,
    type: "basic",
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedSettings = { ...settingsData, [field]: value };
    onUpdate({ settings: updatedSettings });

    if (validation[field]) {
      setValidation((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSampleDataChange = (field: string, value: any) => {
    const updatedSampleData = { ...sampleDataSettings, [field]: value };
    onUpdate({ sampleData: updatedSampleData });
  };

  const validateForm = () => {
    const errors: any = {};

    if (!settingsData.siteName) {
      errors.siteName = "Site name is required";
    }

    if (!settingsData.siteUrl) {
      errors.siteUrl = "Site URL is required";
    } else if (!/^https?:\/\/.+/.test(settingsData.siteUrl)) {
      errors.siteUrl =
        "Please enter a valid URL (starting with http:// or https://)";
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    const isValid = validateForm();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Store Settings
        </h2>
        <p className="text-gray-600">
          Configure your store's basic settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Store Name *</Label>
              <Input
                id="site-name"
                type="text"
                placeholder="My Awesome Store"
                value={settingsData.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className={validation.siteName ? "border-red-500" : ""}
              />
              {validation.siteName && (
                <p className="text-sm text-red-600">{validation.siteName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-url">Store URL *</Label>
              <Input
                id="site-url"
                type="url"
                placeholder="https://mystore.com"
                value={settingsData.siteUrl}
                onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                className={validation.siteUrl ? "border-red-500" : ""}
              />
              {validation.siteUrl && (
                <p className="text-sm text-red-600">{validation.siteUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>
              Configure currency, language, and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select
                  value={settingsData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select
                  value={settingsData.language}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settingsData.timezone}
                onValueChange={(value) => handleInputChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
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

        <Card>
          <CardHeader>
            <CardTitle>Sample Data</CardTitle>
            <CardDescription>
              Load sample data to help you get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sample-data"
                checked={sampleDataSettings.enabled}
                onCheckedChange={(checked) =>
                  handleSampleDataChange("enabled", checked)
                }
              />
              <Label htmlFor="sample-data">
                Load sample data (recommended for new stores)
              </Label>
            </div>

            {sampleDataSettings.enabled && (
              <div className="space-y-2 ml-6">
                <Label>Sample Data Type</Label>
                <Select
                  value={sampleDataSettings.type}
                  onValueChange={(value) =>
                    handleSampleDataChange("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      Basic - Categories and settings only
                    </SelectItem>
                    <SelectItem value="demo">
                      Demo - Categories, products, and vendors
                    </SelectItem>
                    <SelectItem value="full">
                      Full - Everything including sample orders
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full md:w-auto px-8"
          disabled={!settingsData.siteName || !settingsData.siteUrl}
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
