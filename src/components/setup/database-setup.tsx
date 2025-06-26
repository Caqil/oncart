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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { SetupStepProps } from "./setup-wizard";
import { API_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileText,
  Play,
  Pause,
} from "lucide-react";

interface DatabaseStatus {
  connected: boolean;
  migrationsApplied: boolean;
  migrationsPending: string[];
  seedDataLoaded: boolean;
  tablesCreated: number;
  totalTables: number;
  error?: string;
}

interface MigrationLog {
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export function DatabaseSetup({
  onNext,
  onPrevious,
  onComplete,
  setupData,
  isLoading: parentLoading,
}: SetupStepProps) {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    migrationsApplied: false,
    migrationsPending: [],
    seedDataLoaded: false,
    tablesCreated: 0,
    totalTables: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    "checking" | "migrating" | "seeding" | "completed"
  >("checking");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    if (autoRun) {
      checkDatabase();
    }
  }, [autoRun]);

  const addLog = (level: MigrationLog["level"], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        level,
        message,
      },
    ]);
  };

  const checkDatabase = async () => {
    setIsLoading(true);
    setStep("checking");
    setProgress(10);
    addLog("info", "Starting database setup...");

    try {
      // Check database connection
      addLog("info", "Checking database connection...");
      const connectionResponse = await fetch(
        `${API_ROUTES.SETTINGS}/setup/database/check`
      );
      const connectionData = await connectionResponse.json();

      if (!connectionResponse.ok) {
        throw new Error(connectionData.message || "Database connection failed");
      }

      setStatus((prev) => ({ ...prev, ...connectionData }));
      setProgress(30);
      addLog("success", "Database connection established");

      // Apply migrations if needed
      if (
        !connectionData.migrationsApplied ||
        connectionData.migrationsPending.length > 0
      ) {
        await runMigrations();
      } else {
        addLog("info", "All migrations already applied");
        setProgress(70);
      }

      // Load seed data if needed
      if (!connectionData.seedDataLoaded) {
        await loadSeedData();
      } else {
        addLog("info", "Seed data already loaded");
        setProgress(100);
      }

      setStep("completed");
      addLog("success", "Database setup completed successfully");
    } catch (error: any) {
      addLog("error", error.message);
      setStatus((prev) => ({ ...prev, error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const runMigrations = async () => {
    setStep("migrating");
    setProgress(40);
    addLog("info", "Applying database migrations...");

    try {
      const response = await fetch(
        `${API_ROUTES.SETTINGS}/setup/database/migrate`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Migration failed");
      }

      setStatus((prev) => ({
        ...prev,
        migrationsApplied: true,
        migrationsPending: [],
        tablesCreated: data.tablesCreated || 0,
        totalTables: data.totalTables || 0,
      }));

      setProgress(60);
      addLog("success", `Applied ${data.migrationsApplied || 0} migrations`);
    } catch (error: any) {
      throw new Error(`Migration failed: ${error.message}`);
    }
  };

  const loadSeedData = async () => {
    setStep("seeding");
    setProgress(80);
    addLog("info", "Loading initial data...");

    try {
      const response = await fetch(
        `${API_ROUTES.SETTINGS}/setup/database/seed`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Seeding failed");
      }

      setStatus((prev) => ({ ...prev, seedDataLoaded: true }));
      setProgress(100);
      addLog("success", "Initial data loaded successfully");
    } catch (error: any) {
      throw new Error(`Seeding failed: ${error.message}`);
    }
  };

  const handleRetry = () => {
    setLogs([]);
    setProgress(0);
    setStatus({
      connected: false,
      migrationsApplied: false,
      migrationsPending: [],
      seedDataLoaded: false,
      tablesCreated: 0,
      totalTables: 0,
    });
    checkDatabase();
  };

  const handleNext = () => {
    if (status.connected && status.migrationsApplied && status.seedDataLoaded) {
      onNext({
        database: {
          status: "completed",
          migrationsApplied: true,
          seedDataLoaded: true,
        },
      });
    }
  };

  const isCompleted =
    status.connected && status.migrationsApplied && status.seedDataLoaded;
  const hasError = !!status.error;

  return (
    <div className="space-y-6">
      {/* Database Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database
                className={cn(
                  "h-5 w-5",
                  status.connected ? "text-green-500" : "text-gray-400"
                )}
              />
              <div>
                <p className="font-medium">Connection</p>
                <p className="text-sm text-gray-500">
                  {status.connected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText
                className={cn(
                  "h-5 w-5",
                  status.migrationsApplied ? "text-green-500" : "text-gray-400"
                )}
              />
              <div>
                <p className="font-medium">Migrations</p>
                <p className="text-sm text-gray-500">
                  {status.migrationsApplied ? "Applied" : "Pending"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play
                className={cn(
                  "h-5 w-5",
                  status.seedDataLoaded ? "text-green-500" : "text-gray-400"
                )}
              />
              <div>
                <p className="font-medium">Seed Data</p>
                <p className="text-sm text-gray-500">
                  {status.seedDataLoaded ? "Loaded" : "Not loaded"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {(isLoading || parentLoading) && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Database Setup Progress</h3>
                <Badge variant="secondary">
                  {step === "checking" && "Checking..."}
                  {step === "migrating" && "Migrating..."}
                  {step === "seeding" && "Seeding..."}
                  {step === "completed" && "Completed"}
                </Badge>
              </div>
              <Progress value={progress} />
              <p className="text-sm text-gray-500">
                This may take a few moments depending on your database size.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{status.error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success State */}
      {isCompleted && !hasError && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Database setup completed successfully! Your SQLite database is ready
            with all tables created and initial data loaded.
          </AlertDescription>
        </Alert>
      )}

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Setup Logs</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              {showLogs ? "Hide" : "Show"} Details
            </Button>
          </div>
        </CardHeader>
        {showLogs && (
          <CardContent>
            <Textarea
              readOnly
              value={logs
                .map(
                  (log) =>
                    `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`
                )
                .join("\n")}
              className="h-40 font-mono text-sm"
              placeholder="Setup logs will appear here..."
            />
          </CardContent>
        )}
      </Card>

      {/* Manual Controls */}
      {!autoRun && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Setup</CardTitle>
            <CardDescription>
              Run database setup steps manually if needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkDatabase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Run Setup
              </Button>
              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset & Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!isCompleted || isLoading || parentLoading}
        >
          {isCompleted ? "Continue" : "Complete Database Setup"}
        </Button>
      </div>
    </div>
  );
}
