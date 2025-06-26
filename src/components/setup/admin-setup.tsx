"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function AdminStep({ data, onUpdate, onNext }: AdminStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<any>({});
  const { toast } = useToast();

  const adminData = data.admin || { name: "", email: "", password: "" };

  const handleInputChange = (field: string, value: string) => {
    const updatedAdmin = { ...adminData, [field]: value };
    onUpdate({ admin: updatedAdmin });

    // Clear validation error for this field
    if (validation[field]) {
      setValidation((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = async () => {
    const errors: any = {};

    if (!adminData.name || adminData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (
      !adminData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (!adminData.password || adminData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateForm();
    if (isValid) {
      onNext();
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors and try again.",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Administrator Account
        </h2>
        <p className="text-gray-600">
          This account will have full access to manage your store.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Details</CardTitle>
          <CardDescription>
            Enter the details for your main administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admin-name"
                type="text"
                placeholder="Enter your full name"
                value={adminData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`pl-10 ${validation.name ? "border-red-500" : ""}`}
              />
            </div>
            {validation.name && (
              <p className="text-sm text-red-600">{validation.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@yourstore.com"
                value={adminData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-10 ${validation.email ? "border-red-500" : ""}`}
              />
            </div>
            {validation.email && (
              <p className="text-sm text-red-600">{validation.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                value={adminData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 pr-10 ${validation.password ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {validation.password && (
              <p className="text-sm text-red-600">{validation.password}</p>
            )}
            <p className="text-sm text-gray-500">
              Password should be at least 8 characters long
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full md:w-auto px-8"
          disabled={!adminData.name || !adminData.email || !adminData.password}
        >
          Create Admin Account
        </Button>
      </div>
    </div>
  );
}
