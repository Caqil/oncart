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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressIndicator } from "./progress-indicator";
import { DatabaseSetup } from "./database-setup";
import { AdminSetup } from "./admin-setup";
import { SettingsSetup } from "./settings-setup";
import { SetupComplete } from "./setup-complete";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<SetupStepProps>;
  required: boolean;
  completed: boolean;
  error?: string;
}

export interface SetupStepProps {
  onNext: (data?: any) => void;
  onPrevious: () => void;
  onComplete: (data: any) => Promise<void>;
  setupData: SetupData;
  isLoading: boolean;
  error?: string;
}

export interface SetupData {
  database: {
    status:
      | "pending"
      | "checking"
      | "migrating"
      | "seeding"
      | "completed"
      | "error";
    migrationsApplied: boolean;
    seedDataLoaded: boolean;
    error?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    created: boolean;
  };
  settings: {
    siteName: string;
    siteUrl: string;
    currency: string;
    language: string;
    timezone: string;
    configured: boolean;
  };
  completed: boolean;
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: "database",
    title: "Database Setup",
    description: "Initialize database and apply migrations",
    component: DatabaseSetup,
    required: true,
    completed: false,
  },
  {
    id: "admin",
    title: "Admin Account",
    description: "Create your administrator account",
    component: AdminSetup,
    required: true,
    completed: false,
  },
  {
    id: "settings",
    title: "Basic Settings",
    description: "Configure your store settings",
    component: SettingsSetup,
    required: true,
    completed: false,
  },
  {
    id: "complete",
    title: "Setup Complete",
    description: "Finalize installation and start using your store",
    component: SetupComplete,
    required: true,
    completed: false,
  },
];

export function SetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<SetupStep[]>(SETUP_STEPS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [setupData, setSetupData] = useState<SetupData>({
    database: {
      status: "pending",
      migrationsApplied: false,
      seedDataLoaded: false,
    },
    admin: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      created: false,
    },
    settings: {
      siteName: "",
      siteUrl: "",
      currency: "USD",
      language: "en",
      timezone: "UTC",
      configured: false,
    },
    completed: false,
  });

  // Check if setup is already completed
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/status`);
      const data = await response.json();

      if (response.ok && data.completed) {
        router.push("/admin");
        return;
      }

      // Update setup data with current status
      if (data.setupData) {
        setSetupData((prev) => ({ ...prev, ...data.setupData }));

        // Update step completion status
        setSteps((prev) =>
          prev.map((step) => ({
            ...step,
            completed: data.completedSteps?.includes(step.id) || false,
          }))
        );

        // Set current step to first incomplete step
        const firstIncompleteStep = data.completedSteps?.length || 0;
        setCurrentStep(Math.min(firstIncompleteStep, SETUP_STEPS.length - 1));
      }
    } catch (error) {
      console.error("Failed to check setup status:", error);
    }
  };

  const handleNext = (data?: any) => {
    if (data) {
      setSetupData((prev) => ({ ...prev, ...data }));
    }

    setSteps((prev) =>
      prev.map((step, index) =>
        index === currentStep
          ? { ...step, completed: true, error: undefined }
          : step
      )
    );

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async (data: any) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const finalSetupData = { ...setupData, ...data, completed: true };

      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalSetupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Setup completion failed");
      }

      setSetupData(finalSetupData);

      // Mark all steps as completed
      setSteps((prev) => prev.map((step) => ({ ...step, completed: true })));

      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      setSteps((prev) =>
        prev.map((step, index) =>
          index === currentStep ? { ...step, error: error.message } : step
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepError = (error: string) => {
    setError(error);
    setSteps((prev) =>
      prev.map((step, index) =>
        index === currentStep ? { ...step, error } : step
      )
    );
  };

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData?.component;
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Setup Your Store
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Let's get your multi-vendor ecommerce platform ready in just a few
            steps
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Setup Progress</span>
              <Badge
                variant={
                  completedSteps === steps.length ? "default" : "secondary"
                }
              >
                {completedSteps} of {steps.length} completed
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete all steps to start using your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-4" />
            <ProgressIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={(stepIndex) => {
                // Only allow going to completed steps or current step
                if (stepIndex <= currentStep || steps[stepIndex].completed) {
                  setCurrentStep(stepIndex);
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStepData?.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : currentStepData?.error ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              {currentStepData?.title}
            </CardTitle>
            <CardDescription>{currentStepData?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {CurrentStepComponent && (
              <CurrentStepComponent
                onNext={handleNext}
                onPrevious={handlePrevious}
                onComplete={handleComplete}
                setupData={setupData}
                isLoading={isLoading}
                error={currentStepData.error}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              Exit Setup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
