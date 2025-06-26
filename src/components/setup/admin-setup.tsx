"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { SetupStepProps } from "./setup-wizard";
import { API_ROUTES, VALIDATION_RULES } from "@/lib/constants";
import { validationSchemas } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  EyeOff,
  Shield,
  Crown
} from "lucide-react";

interface AdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function AdminSetup({
  onNext,
  onPrevious,
  setupData,
  isLoading: parentLoading,
}: SetupStepProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: setupData.admin.name || '',
    email: setupData.admin.email || '',
    password: setupData.admin.password || '',
    confirmPassword: setupData.admin.confirmPassword || '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreated, setIsCreated] = useState(setupData.admin.created || false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
    } else if (!VALIDATION_RULES.PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateAdmin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'Email already exists' });
        } else {
          throw new Error(data.message || 'Failed to create admin account');
        }
        return;
      }

      setIsCreated(true);
      
      onNext({
        admin: {
          ...formData,
          created: true,
        }
      });

    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (isCreated) {
      onNext();
    } else {
      handleCreateAdmin();
    }
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-500' };
    if (score <= 4) return { score, label: 'Good', color: 'text-blue-500' };
    return { score, label: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Create Administrator Account</h2>
        <p className="text-gray-600 mt-2">
          This account will have full access to manage your store
        </p>
      </div>

      {isCreated ? (
        /* Success State */
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Administrator account created successfully! You can now proceed to configure your store settings.
          </AlertDescription>
        </Alert>
      ) : (
        /* Form */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administrator Details
            </CardTitle>
            <CardDescription>
              Create your super admin account to manage the entire platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.name && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading || parentLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@yourstore.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.email && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading || parentLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <Separator />

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading || parentLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={cn("text-xs font-medium", passwordStrength.color)}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className={cn(
                        "h-1 rounded-full transition-all",
                        passwordStrength.score <= 2 && "bg-red-500",
                        passwordStrength.score === 3 && "bg-yellow-500",
                        passwordStrength.score === 4 && "bg-blue-500",
                        passwordStrength.score === 5 && "bg-green-500"
                      )}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="admin-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(
                    "pl-10 pr-10",
                    errors.confirmPassword && "border-red-500 focus:border-red-500"
                  )}
                  disabled={isLoading || parentLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Notice:</strong> This account will have complete administrative access. 
                Keep your credentials secure and use a strong, unique password.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
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
        <Button
          onClick={handleNext}
          disabled={isLoading || parentLoading}
        >
          {isCreated ? 'Continue' : 'Create Admin Account'}
        </Button>
      </div>
    </div>
  );
}
