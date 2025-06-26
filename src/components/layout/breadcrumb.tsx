"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import React from "react";

interface BreadcrumbSegment {
  href: string;
  label: string;
  isLast: boolean;
}

interface StoreBreadcrumbProps {
  className?: string;
  customSegments?: BreadcrumbSegment[];
  showHome?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
}

export function StoreBreadcrumb({
  className,
  customSegments,
  showHome = true,
  maxItems = 5,
  separator,
}: StoreBreadcrumbProps) {
  const pathname = usePathname();
  const t = useTranslations();

  const generateSegments = (): BreadcrumbSegment[] => {
    if (customSegments) return customSegments;

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];

    // Skip locale if it's the first segment
    const startIndex = segments[0]?.length === 2 ? 1 : 0;

    let currentPath = "";
    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      const isLast = i === segments.length - 1;
      const label = getSegmentLabel(segment, currentPath);

      breadcrumbs.push({
        href: currentPath,
        label,
        isLast,
      });
    }

    return breadcrumbs;
  };

  const getSegmentLabel = (segment: string, path: string): string => {
    // Map common routes to translations
    const routeMap: Record<string, string> = {
      shop: t("nav.shop"),
      categories: t("nav.categories"),
      vendors: t("nav.vendors"),
      cart: t("nav.cart"),
      wishlist: t("nav.wishlist"),
      account: t("nav.account"),
      orders: t("nav.orders"),
      reviews: t("nav.reviews"),
      settings: t("nav.settings"),
      help: t("nav.help"),
      contact: t("nav.contact"),
    };

    if (routeMap[segment]) {
      return routeMap[segment];
    }

    // Decode URL segment and format
    return decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const segments = generateSegments();
  const displaySegments =
    segments.length > maxItems
      ? [...segments.slice(0, 1), ...segments.slice(-maxItems + 1)]
      : segments;

  const hasEllipsis = segments.length > maxItems;

  return (
    <Breadcrumb className={cn("", className)}>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">{t("nav.home")}</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.length > 0 && (
              <BreadcrumbSeparator>
                {separator || <ChevronRight className="h-4 w-4" />}
              </BreadcrumbSeparator>
            )}
          </>
        )}

        {displaySegments.map((segment, index) => {
          const isFirst = index === 0;
          const shouldShowEllipsis =
            hasEllipsis && isFirst && segments.length > maxItems;

          return (
            <React.Fragment key={segment.href}>
              {shouldShowEllipsis && (
                <>
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">...</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    {separator || <ChevronRight className="h-4 w-4" />}
                  </BreadcrumbSeparator>
                </>
              )}

              <BreadcrumbItem>
                {segment.isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {segment.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={segment.href}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!segment.isLast && (
                <BreadcrumbSeparator>
                  {separator || <ChevronRight className="h-4 w-4" />}
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
