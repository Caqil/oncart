"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Database, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DatabaseStepProps {
  onNext: () => void;
  isLoading: boolean;
}

export function DatabaseStep({ onNext, isLoading }: DatabaseStepProps) {
  const [status, setStatus] = useState<"checking" | "ready" | "error">(
    "checking"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/setup/database");
      const result = await response.json();

      if (result.success) {
        setStatus("ready");
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Database connection failed");
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage("Failed to connect to database");
    }
  };

  const initializeDatabase = async () => {
    try {
      const response = await fetch("/api/setup/database", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Database Initialized",
          description: "Database setup completed successfully.",
        });
        onNext();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Database Setup Failed",
        description: error.message || "Failed to initialize database",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Database Setup
        </h2>
        <p className="text-gray-600">
          We'll initialize your database and apply the necessary migrations.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "checking" && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {status === "ready" && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {status === "error" && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "checking" && (
            <p className="text-gray-600">Checking database connection...</p>
          )}
          {status === "ready" && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                ✓ Database connection successful
              </p>
              <p className="text-gray-600">
                Ready to initialize database schema.
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">
                ✗ Database connection failed
              </p>
              <p className="text-gray-600">{errorMessage}</p>
              <Button
                variant="outline"
                onClick={checkDatabaseStatus}
                className="mt-2"
              >
                Retry Connection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">
          What happens during initialization:
        </h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• Create database tables and relationships</li>
          <li>• Apply security constraints and indexes</li>
          <li>• Set up initial system configurations</li>
          <li>• Prepare for data seeding</li>
        </ul>
      </div>

      <div className="text-center">
        <Button
          onClick={initializeDatabase}
          disabled={status !== "ready" || isLoading}
          size="lg"
          className="w-full md:w-auto px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Initializing Database...
            </>
          ) : (
            "Initialize Database"
          )}
        </Button>
      </div>
    </div>
  );
}
