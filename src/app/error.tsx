"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Bug,
  Mail,
  ExternalLink,
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const t = useTranslations("error");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);

    // Optionally send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  const errorMessage = error.message || t("general.message");
  const isNetworkError =
    error.message?.includes("fetch") || error.message?.includes("network");
  const isServerError =
    error.message?.includes("500") ||
    error.message?.includes("Internal Server Error");

  const handleReport = () => {
    const subject = encodeURIComponent(
      `Error Report: ${error.name || "Application Error"}`
    );
    const body = encodeURIComponent(`
Error Details:
- Message: ${errorMessage}
- Digest: ${error.digest || "N/A"}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Additional Context:
Please describe what you were doing when this error occurred.
    `);

    window.open(`mailto:support@yourstore.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="container max-w-2xl">
          <Card className="border-destructive/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-destructive">
                  {t("general.title")}
                </CardTitle>
                <CardDescription className="text-base">
                  {t("general.description")}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details */}
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>{t("details.title")}</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {errorMessage}
                  </code>
                  {error.digest && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Error ID: {error.digest}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Specific Error Messages */}
              {isNetworkError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("network.title")}</AlertTitle>
                  <AlertDescription>
                    {t("network.description")}
                  </AlertDescription>
                </Alert>
              )}

              {isServerError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("server.title")}</AlertTitle>
                  <AlertDescription>{t("server.description")}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("actions.retry")}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("actions.goBack")}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t("actions.goHome")}
                </Button>
              </div>

              {/* Additional Help */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-sm">{t("help.title")}</h3>

                <div className="grid gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReport}
                    className="justify-start h-auto p-3"
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">
                        {t("help.report.title")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("help.report.description")}
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open("/help", "_blank")}
                    className="justify-start h-auto p-3"
                  >
                    <ExternalLink className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">
                        {t("help.support.title")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("help.support.description")}
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
