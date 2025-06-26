"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ArrowRight, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompletionStepProps {
  data: any;
}

export function CompletionStep({ data }: CompletionStepProps) {
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Extract credentials from setup data
    if (data.admin) {
      setCredentials({
        email: data.admin.email,
        password: data.admin.password,
        storeUrl: data.settings?.siteUrl || window.location.origin,
      });
    }
  }, [data]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const goToAdmin = () => {
    window.location.href = "/admin";
  };

  const goToStore = () => {
    window.location.href = "/";
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Setup Complete!
        </h2>
        <p className="text-lg text-gray-600">
          Your OnCart multi-vendor ecommerce platform is now ready to use.
        </p>
      </div>

      {credentials && (
        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle className="text-red-600">
              🔐 Important: Save Your Admin Credentials
            </CardTitle>
            <CardDescription>
              Save these credentials safely. You'll need them to access your
              admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 font-mono text-gray-900">
                    {credentials.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">Password:</span>
                  <span className="ml-2 font-mono text-gray-900">
                    {credentials.password}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(credentials.password, "Password")
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700">Admin URL:</span>
                  <span className="ml-2 font-mono text-gray-900">
                    {credentials.storeUrl}/admin
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `${credentials.storeUrl}/admin`,
                      "Admin URL"
                    )
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span>Set up payment gateways</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span>Configure shipping methods</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span>Add your first products</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span>Invite vendors to join</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span>Customize your store theme</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-2">
            <a
              href="#"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Documentation
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Video Tutorials
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Support Forum
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              API Documentation
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={goToAdmin}
          size="lg"
          className="flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Go to Admin Panel
        </Button>

        <Button
          onClick={goToStore}
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Your Store
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> Bookmark your admin panel URL and keep your
          credentials secure. You can always change your password later from the
          admin settings.
        </p>
      </div>
    </div>
  );
}
