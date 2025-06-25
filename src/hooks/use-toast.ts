import { useState, useCallback } from 'react';
import { toast as sonnerToast, ToastT } from 'sonner';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  id?: string | number;
}

interface UseToastReturn {
  toast: (message: string, options?: ToastOptions) => string | number;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string | number;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string | number;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string | number;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string | number;
  loading: (message: string, options?: Omit<ToastOptions, 'type'>) => string | number;
  dismiss: (id?: string | number) => void;
  dismissAll: () => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => Promise<T>;
}

export function useToast(): UseToastReturn {
  const toast = useCallback((message: string, options: ToastOptions = {}): string | number => {
    const { title, description, action, duration = 4000, dismissible = true, id } = options;

    return sonnerToast(message, {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      duration,
      dismissible,
      id,
    });
  }, []);

  const success = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string | number => {
    return sonnerToast.success(message, options);
  }, []);

  const error = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string | number => {
    return sonnerToast.error(message, options);
  }, []);

  const warning = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string | number => {
    return sonnerToast.warning(message, options);
  }, []);

  const info = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string | number => {
    return sonnerToast.info(message, options);
  }, []);

  const loading = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}): string | number => {
    return sonnerToast.loading(message, options);
  }, []);

  const dismiss = useCallback((id?: string | number): void => {
    sonnerToast.dismiss(id);
  }, []);

  const dismissAll = useCallback((): void => {
    sonnerToast.dismiss();
  }, []);

  const promise = useCallback(<T>(
    promiseToResolve: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    return sonnerToast.promise(promiseToResolve, options).unwrap();
  }, []);

  return {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
    promise,
  };
}
