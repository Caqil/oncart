"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { API_ROUTES } from "@/lib/constants";
import {
  CheckCircle,
  Mail,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface VerifyEmailProps {
  className?: string;
}

export function VerifyEmail({ className }: VerifyEmailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { refreshUser } = useAuth();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROUTES.AUTH}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("auth.verifyEmail.invalidToken"));
      }

      setIsVerified(true);
      await refreshUser(); // Refresh user session

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email || cooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch(`${API_ROUTES.AUTH}/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("auth.verifyEmail.resendFailed"));
      }

      setCooldown(60); // 60 second cooldown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  // Success state
  if (isVerified) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {t("auth.verifyEmail.success")}
          </CardTitle>
          <CardDescription>
            {t("auth.verifyEmail.successDescription")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {t("auth.verifyEmail.redirecting")}
            </AlertDescription>
          </Alert>

          <Button onClick={() => router.push("/")} className="w-full">
            {t("auth.verifyEmail.continueShopping")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verification in progress
  if (isVerifying) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("auth.verifyEmail.verifying")}
          </CardTitle>
          <CardDescription>
            {t("auth.verifyEmail.verifyingDescription")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Default state - waiting for verification
  return (
    <Card className={className}>
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t("auth.verifyEmail.title")}
        </CardTitle>
        <CardDescription>
          {email
            ? t("auth.verifyEmail.sentTo", { email })
            : t("auth.verifyEmail.description")}
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

        {/* Instructions */}
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t("auth.verifyEmail.instructions")}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{t("auth.verifyEmail.checkInbox")}</li>
            <li>{t("auth.verifyEmail.checkSpam")}</li>
            <li>{t("auth.verifyEmail.clickLink")}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {email && (
            <Button
              onClick={resendVerificationEmail}
              disabled={isResending || cooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {cooldown > 0
                ? t("auth.verifyEmail.resendCooldown", { seconds: cooldown })
                : t("auth.verifyEmail.resendEmail")}
            </Button>
          )}

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/auth/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.backToSignIn")}
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-xs text-muted-foreground">
          {t("auth.verifyEmail.problems")}{" "}
          <Link href="/help/contact" className="text-primary hover:underline">
            {t("auth.contactSupport")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
