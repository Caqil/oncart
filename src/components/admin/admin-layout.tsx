"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminBreadcrumb } from "./admin-breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({
  children,
  title,
  description,
}: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { canAccessAdminPanel } = useAuth() as any; // or call useAuth().canAccessAdminPanel() directly if it's a function
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

  // Redirect if not authenticated or doesn't have admin access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin?redirect=/admin");
      return;
    }

    if (!isLoading && isAuthenticated && !canAccessAdminPanel()) {
      router.push("/");
      return;
    }
  }, [isLoading, isAuthenticated, canAccessAdminPanel, router]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdminPanel()) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the admin panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"}
        ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <AdminSidebar
          isCollapsed={!isMobile && sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-auto">
          <div className="container py-6 space-y-6">
            {(title || description) && (
              <div className="space-y-2">
                <AdminBreadcrumb />
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                )}
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

// src/components/admin/admin-breadcrumb.tsx
("use client");

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import LoadingSpinner from "../common/loading-spinner";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Remove 'admin' from segments if it's the first segment
  const adminIndex = segments.indexOf("admin");
  const breadcrumbSegments =
    adminIndex !== -1 ? segments.slice(adminIndex + 1) : segments;

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      {
        name: "Dashboard",
        href: "/admin",
        isLast: breadcrumbSegments.length === 0,
      },
    ];

    let currentPath = "/admin";

    breadcrumbSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === breadcrumbSegments.length - 1;

      // Beautify segment names
      const name = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      breadcrumbs.push({
        name,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <BreadcrumbItem key={breadcrumb.href}>
            {breadcrumb.isLast ? (
              <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink asChild>
                  <Link
                    href={breadcrumb.href}
                    className="flex items-center gap-1"
                  >
                    {index === 0 && <Home className="h-4 w-4" />}
                    {breadcrumb.name}
                  </Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
