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
import { useAuth } from "@/hooks/use-auth";
import { authValidations } from "@/lib/validations";
import { OAuthButtons } from "./oauth-buttons";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertTriangle } from "lucide-react";

type SignInFormData = z.infer<typeof authValidations.signIn>;

interface SignInFormProps {
  className?: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SignInForm({
  className,
  onSuccess,
  redirectTo,
}: SignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { login, isLoading: authLoading, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(authValidations.signIn),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Pre-fill email if provided in URL params
  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      form.setValue("email", email);
    }
  }, [searchParams, form]);

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);

    try {
      const success = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (success) {
        // Handle successful login
        if (onSuccess) {
          onSuccess();
        } else {
          const redirect = redirectTo || searchParams.get("redirect") || "/";
          router.push(redirect);
        }
      }
    } catch (error) {
      // Error is already handled by the useAuth hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;
  const error = authError || form.formState.errors.root?.message;

  return (
    <Card className={className}>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">
          {t("auth.signin.title")}
        </CardTitle>
        <CardDescription>{t("auth.signin.description")}</CardDescription>
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

        {/* Sign In Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.signin.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t("auth.signin.emailPlaceholder")}
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

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.signin.password")}</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.signin.passwordPlaceholder")}
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
                <span className="sr-only">
                  {showPassword
                    ? t("auth.hidePassword")
                    : t("auth.showPassword")}
                </span>
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              disabled={isLoading}
              checked={form.watch("rememberMe")}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked as boolean)
              }
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal cursor-pointer"
            >
              {t("auth.rememberMe")}
            </Label>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.signin.button")}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {t("auth.signin.noAccount")}{" "}
          </span>
          <Link
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            {t("auth.signin.signUp")}
          </Link>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-muted-foreground">
          <span>{t("auth.bySigningIn")}</span>{" "}
          <Link href="/terms" className="hover:underline">
            {t("auth.termsOfService")}
          </Link>{" "}
          {t("common.and")}{" "}
          <Link href="/privacy" className="hover:underline">
            {t("auth.privacyPolicy")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
