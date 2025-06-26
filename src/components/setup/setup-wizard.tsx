"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatabaseStep } from "./steps/database-step";
import { AdminStep } from "./steps/admin-step";
import { SettingsStep } from "./steps/settings-step";
import { CompletionStep } from "./steps/completion-step";
import { toast } from "sonner";
import React from "react";
import { WelcomeStep } from "./welcome-step";

const SETUP_STEPS = [
  { id: "welcome", title: "Welcome", component: WelcomeStep },
  { id: "database", title: "Database", component: DatabaseStep },
  { id: "admin", title: "Admin Account", component: AdminStep },
  { id: "settings", title: "Store Settings", component: SettingsStep },
  { id: "complete", title: "Complete", component: CompletionStep },
];

interface SetupData {
  admin?: {
    name: string;
    email: string;
    password: string;
  };
  settings?: {
    siteName: string;
    siteUrl: string;
    currency: string;
    language: string;
    timezone: string;
  };
  sampleData?: {
    enabled: boolean;
    type: "basic" | "demo" | "full";
  };
}

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<SetupData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Check if setup is already completed
  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/setup");
      const result = await response.json();

      if (result.success && result.data.completed) {
        // Redirect to admin if setup is already completed
        window.location.href = "/admin";
      }
    } catch (error) {
      console.error("Failed to check setup status:", error);
    }
  };

  const updateSetupData = (stepData: Partial<SetupData>) => {
    setSetupData((prev) => ({ ...prev, ...stepData }));
  };

  const canProceedToNext = () => {
    const currentStepId = SETUP_STEPS[currentStep].id;

    if (currentStepId === "welcome") return true;
    if (currentStepId === "database")
      return completedSteps.includes("database");
    if (currentStepId === "admin")
      return (
        setupData.admin &&
        setupData.admin.name &&
        setupData.admin.email &&
        setupData.admin.password
      );
    if (currentStepId === "settings")
      return (
        setupData.settings &&
        setupData.settings.siteName &&
        setupData.settings.siteUrl
      );

    return false;
  };

  const handleNext = async () => {
    const currentStepId = SETUP_STEPS[currentStep].id;

    if (currentStepId === "database") {
      await initializeDatabase();
    } else if (currentStepId === "settings") {
      await completeSetup();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, SETUP_STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const initializeDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/setup/database", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        setCompletedSteps((prev) => [...prev, "database"]);
        setCurrentStep((prev) => prev + 1);
        toast("Database has been initialized successfully.");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initialize database");
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupData),
      });

      const result = await response.json();

      if (result.success) {
        setCurrentStep((prev) => prev + 1);
        toast("Your store has been set up successfully.");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast(error.message || "Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepComponent = SETUP_STEPS[currentStep].component;
  const progress = ((currentStep + 1) / SETUP_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to OnCart
          </h1>
          <p className="text-lg text-gray-600">
            Let's set up your multi-vendor ecommerce platform
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {SETUP_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < SETUP_STEPS.length - 1 ? "flex-1" : ""
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index <= currentStep
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index <= currentStep ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < SETUP_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {React.createElement(currentStepComponent, {
                data: setupData,
                onUpdate: updateSetupData,
                onNext: handleNext,
                isLoading,
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep !== SETUP_STEPS.length - 1 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceedToNext() || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {currentStep === SETUP_STEPS.length - 2
                ? "Complete Setup"
                : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
