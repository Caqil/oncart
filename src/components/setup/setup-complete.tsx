"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SetupStepProps } from "./setup-wizard";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  ArrowRight,
  Database,
  User,
  Settings,
  Store,
  Globe,
  Shield,
  Zap,
  ExternalLink,
  Download,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface SetupSummary {
  database: {
    tablesCreated: number;
    migrationsApplied: number;
    seedDataLoaded: boolean;
  };
  admin: {
    email: string;
    name: string;
  };
  store: {
    name: string;
    url: string;
    currency: string;
    language: string;
    multivendorEnabled: boolean;
  };
  nextSteps: string[];
}

export function SetupComplete({
  onNext,
  onPrevious,
  onComplete,
  setupData,
  isLoading: parentLoading,
}: SetupStepProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [summary, setSummary] = useState<SetupSummary>({
    database: {
      tablesCreated: 0,
      migrationsApplied: 0,
      seedDataLoaded: false,
    },
    admin: {
      email: setupData.admin.email,
      name: setupData.admin.name,
    },
    store: {
      name: setupData.settings.siteName,
      url: setupData.settings.siteUrl,
      currency: setupData.settings.currency,
      language: setupData.settings.language,
      multivendorEnabled: true,
    },
    nextSteps: [],
  });

  useEffect(() => {
    loadSetupSummary();
  }, []);

  const loadSetupSummary = async () => {
    try {
      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to load setup summary:", error);
    }
  };

  const handleCompleteSetup = async () => {
    setIsLoading(true);

    try {
      await onComplete(setupData);
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to complete setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToAdmin = () => {
    router.push("/admin");
  };

  const handleGoToStore = () => {
    window.open(summary.store.url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          🎉 Setup Complete!
        </h2>
        <p className="text-gray-600 text-lg">
          Your multi-vendor ecommerce platform is ready to go
        </p>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Summary</CardTitle>
          <CardDescription>
            Here's what we've configured for your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Database */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Database Initialized</p>
              <p className="text-sm text-gray-500">
                {summary.database.tablesCreated} tables created,{" "}
                {summary.database.migrationsApplied} migrations applied
              </p>
            </div>
            <Badge variant="secondary">Ready</Badge>
          </div>

          <Separator />

          {/* Admin Account */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Administrator Account</p>
              <p className="text-sm text-gray-500">
                {summary.admin.name} ({summary.admin.email})
              </p>
            </div>
            <Badge variant="secondary">Created</Badge>
          </div>

          <Separator />

          {/* Store Settings */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{summary.store.name}</p>
              <p className="text-sm text-gray-500">
                {summary.store.currency} •{" "}
                {summary.store.language.toUpperCase()} • Multi-vendor{" "}
                {summary.store.multivendorEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <Badge variant="secondary">Configured</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleGoToAdmin}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Admin Dashboard</h3>
                <p className="text-sm text-gray-500">
                  Manage products, orders, and vendors
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={handleGoToStore}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Visit Store</h3>
                <p className="text-sm text-gray-500">
                  See your store from customer perspective
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Next Steps
          </CardTitle>
          <CardDescription>
            Here's what you should do next to get your store running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="font-medium">Configure Payment Gateways</p>
                <p className="text-sm text-gray-500">
                  Set up Stripe, PayPal, or other payment methods in Settings →
                  Payments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="font-medium">Add Product Categories</p>
                <p className="text-sm text-gray-500">
                  Create categories to organize your products in Products →
                  Categories
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="font-medium">Invite Vendors</p>
                <p className="text-sm text-gray-500">
                  Start inviting vendors to sell on your platform in Vendors →
                  Add New
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">4</span>
              </div>
              <div>
                <p className="font-medium">Customize Your Store</p>
                <p className="text-sm text-gray-500">
                  Upload your logo, set up your theme, and customize your
                  storefront
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Helpful Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-gray-500">Complete setup guide</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Support</p>
                  <p className="text-sm text-gray-500">
                    Get help when you need it
                  </p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Sample Data</p>
                  <p className="text-sm text-gray-500">Import demo products</p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Advanced Settings</p>
                  <p className="text-sm text-gray-500">
                    Fine-tune your platform
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Notice */}
      {!isCompleted && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Click "Complete Setup" to finalize the installation and start using
            your store.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading || parentLoading || isCompleted}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <Button variant="outline" onClick={handleGoToStore}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Store
              </Button>
              <Button onClick={handleGoToAdmin}>
                <Shield className="h-4 w-4 mr-2" />
                Go to Admin
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={isLoading || parentLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Completing..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
