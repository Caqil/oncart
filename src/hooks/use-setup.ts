
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { API_ROUTES } from '@/lib/constants';
import { SetupData, ExtendedSetupData, SetupStatusResponse } from '@/types/setup';

interface UseSetupReturn {
  setupData: ExtendedSetupData;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  checkSetupStatus: () => Promise<void>;
  updateSetupData: (data: Partial<SetupData>) => void;
  completeStep: (stepId: string, data?: any) => Promise<boolean>;
  retryStep: (stepId: string) => Promise<boolean>;
  resetSetup: () => Promise<void>;
}

export function useSetup(): UseSetupReturn {
  const [setupData, setSetupData] = useState<ExtendedSetupData>({
    database: {
      status: 'pending',
      migrationsApplied: false,
      seedDataLoaded: false,
    },
    admin: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      created: false,
    },
    settings: {
      siteName: '',
      siteUrl: '',
      currency: 'USD',
      language: 'en',
      timezone: 'UTC',
      configured: false,
    },
    completed: false,
    progress: {
      currentStep: 0,
      totalSteps: 4,
      percentage: 0,
      completedSteps: [],
      currentStepStatus: 'pending',
    },
    validation: {
      isValid: false,
      errors: {},
      warnings: {},
    },
    sampleData: {
      enabled: false,
      type: 'basic',
      loaded: false,
    },
    backups: {
      enabled: true,
      beforeSetup: false,
      afterSetup: false,
    },
    performance: {
      startTime: new Date(),
      stepDurations: {},
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSetupStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ROUTES.SETTINGS}/setup/status`);
      const data: SetupStatusResponse = await response.json();

      if (response.ok) {
        if (data.completed) {
          // Setup is already completed, redirect
          window.location.href = '/admin';
          return;
        }

        // Update setup data with current status
        setSetupData(prev => ({
          ...prev,
          ...data.setupData,
          progress: {
            ...prev.progress,
            completedSteps: data.completedSteps || [],
            currentStep: data.completedSteps?.length || 0,
            percentage: ((data.completedSteps?.length || 0) / prev.progress.totalSteps) * 100,
          },
        }));

        setCurrentStep(data.completedSteps?.length || 0);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to check setup status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetupData = useCallback((data: Partial<SetupData>) => {
    setSetupData(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  const completeStep = useCallback(async (stepId: string, data?: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const stepStartTime = Date.now();

      // Update setup data with step data
      if (data) {
        updateSetupData(data);
      }

      // Mark step as completed
      setSetupData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          completedSteps: [...prev.progress.completedSteps.filter(id => id !== stepId), stepId],
          currentStepStatus: 'completed',
        },
        performance: {
          ...prev.performance,
          stepDurations: {
            ...prev.performance.stepDurations,
            [stepId]: Date.now() - stepStartTime,
          },
        },
      }));

      toast.success(`${stepId} completed successfully`);
      return true;

    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to complete ${stepId}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateSetupData]);

  const retryStep = useCallback(async (stepId: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Remove step from completed steps to retry
      setSetupData(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          completedSteps: prev.progress.completedSteps.filter(id => id !== stepId),
          currentStepStatus: 'pending',
        },
      }));

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  const resetSetup = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Reset all setup data
      setSetupData(prev => ({
        ...prev,
        database: {
          status: 'pending',
          migrationsApplied: false,
          seedDataLoaded: false,
        },
        admin: {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          created: false,
        },
        settings: {
          siteName: '',
          siteUrl: '',
          currency: 'USD',
          language: 'en',
          timezone: 'UTC',
          configured: false,
        },
        completed: false,
        progress: {
          currentStep: 0,
          totalSteps: 4,
          percentage: 0,
          completedSteps: [],
          currentStepStatus: 'pending',
        },
        performance: {
          startTime: new Date(),
          stepDurations: {},
        },
      }));

      setCurrentStep(0);
      setError(null);
      
      toast.success('Setup reset successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to reset setup');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check setup status on mount
  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  return {
    setupData,
    currentStep,
    isLoading,
    error,
    checkSetupStatus,
    updateSetupData,
    completeStep,
    retryStep,
    resetSetup,
  };
}
