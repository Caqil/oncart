"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { authValidations } from "@/lib/validations";
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type ForgotPasswordFormData = z.infer<typeof authValidations.forgotPassword>;

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const t = useTranslations();
  const { forgotPassword } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(authValidations.forgotPassword),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await forgotPassword({ email: data.email });

      if (success) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || t("auth.forgotPassword.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("auth.forgotPassword.emailSent")}
          </CardTitle>
          <CardDescription>
            {t("auth.forgotPassword.checkEmail")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {t("auth.forgotPassword.emailSentTo")}{" "}
              <strong>{form.getValues("email")}</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              {t("auth.forgotPassword.sendAnother")}
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("auth.backToSignIn")}
              </Link>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            {t("auth.forgotPassword.emailNotReceived")}{" "}
            <Link href="/help/contact" className="text-primary hover:underline">
              {t("auth.contactSupport")}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">
          {t("auth.forgotPassword.title")}
        </CardTitle>
        <CardDescription>
          {t("auth.forgotPassword.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.forgotPassword.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                disabled={isSubmitting}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("auth.forgotPassword.button")}
          </Button>
        </form>

        {/* Back to Sign In */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.backToSignIn")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
