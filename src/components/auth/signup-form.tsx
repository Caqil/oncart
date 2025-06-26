"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { authValidations } from "@/lib/validations";
import { OAuthButtons } from "./oauth-buttons";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Phone,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

type SignUpFormData = z.infer<typeof authValidations.signUp>;

interface SignUpFormProps {
  className?: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignUpForm({
  className,
  onSuccess,
  redirectTo,
}: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { register, isLoading: authLoading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(authValidations.signUp),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      acceptTerms: false,
      newsletter: false,
    },
  });

  // Calculate password strength
  useEffect(() => {
    const password = form.watch("password");
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[@$!%*?&]/.test(password)) score += 10;

    setPasswordStrength(score);
  }, [form.watch("password")]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);

    try {
      const success = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone,
        acceptTerms: data.acceptTerms,
        newsletter: data.newsletter,
      });

      if (success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(
            "/auth/verify-email?email=" + encodeURIComponent(data.email)
          );
        }
      }
    } catch (error) {
      // Error is already handled by the useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-destructive";
    if (passwordStrength < 60) return "bg-yellow-500";
    if (passwordStrength < 80) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return t("auth.password.weak");
    if (passwordStrength < 60) return t("auth.password.fair");
    if (passwordStrength < 80) return t("auth.password.good");
    return t("auth.password.strong");
  };

  const isLoading = isSubmitting || authLoading;
  const error = authError || form.formState.errors.root?.message;

  return (
    <Card className={className}>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">
          {t("auth.signup.title")}
        </CardTitle>
        <CardDescription>{t("auth.signup.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OAuth Buttons */}
        <OAuthButtons isLoading={isLoading} redirectTo={redirectTo} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth.continueWith")}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign Up Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.signup.name")}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder={t("auth.signup.namePlaceholder")}
                disabled={isLoading}
                className="pl-10"
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.signup.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t("auth.signup.emailPlaceholder")}
                disabled={isLoading}
                className="pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              {t("auth.signup.phone")}{" "}
              <span className="text-muted-foreground">
                ({t("common.optional")})
              </span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder={t("auth.signup.phonePlaceholder")}
                disabled={isLoading}
                className="pl-10"
                {...form.register("phone")}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.signup.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.signup.passwordPlaceholder")}
                disabled={isLoading}
                className="pl-10 pr-10"
                {...form.register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 px-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {form.watch("password") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("auth.password.strength")}:
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength >= 80
                        ? "text-green-600"
                        : passwordStrength >= 60
                          ? "text-blue-600"
                          : passwordStrength >= 30
                            ? "text-yellow-600"
                            : "text-destructive"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <Progress value={passwordStrength} className="h-2" />
              </div>
            )}

            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t("auth.signup.confirmPassword")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                disabled={isLoading}
                className="pl-10 pr-10"
                {...form.register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 px-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Password Match Indicator */}
            {form.watch("confirmPassword") && (
              <div className="flex items-center gap-2 text-xs">
                {form.watch("password") === form.watch("confirmPassword") ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      {t("auth.password.match")}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">
                      {t("auth.password.noMatch")}
                    </span>
                  </>
                )}
              </div>
            )}

            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                disabled={isLoading}
                checked={form.watch("acceptTerms")}
                onCheckedChange={(checked) =>
                  form.setValue("acceptTerms", checked as boolean)
                }
                className="mt-1"
              />
              <Label
                htmlFor="acceptTerms"
                className="text-sm font-normal cursor-pointer leading-5"
              >
                {t("auth.signup.acceptTerms")}{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {t("auth.termsOfService")}
                </Link>{" "}
                {t("common.and")}{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t("auth.privacyPolicy")}
                </Link>
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-destructive">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Newsletter Subscription */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              disabled={isLoading}
              checked={form.watch("newsletter")}
              onCheckedChange={(checked) =>
                form.setValue("newsletter", checked as boolean)
              }
            />
            <Label
              htmlFor="newsletter"
              className="text-sm font-normal cursor-pointer"
            >
              {t("auth.signup.newsletter")}
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !form.watch("acceptTerms")}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.signup.button")}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth.signup.hasAccount")}{" "}
          </span>
          <Link
            href="/auth/signin"
            className="text-primary hover:underline font-medium"
          >
            {t("auth.signup.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
