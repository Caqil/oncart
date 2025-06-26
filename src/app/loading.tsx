"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="relative h-[600px] bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container flex items-center justify-center h-full">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section Skeleton */}
        <section className="py-16 bg-muted/30">
          <div className="container space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 text-center space-y-4">
                  <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section Skeleton */}
        <section className="py-16">
          <div className="container space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vendors Section Skeleton */}
        <section className="py-16 bg-muted/30">
          <div className="container space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 text-center space-y-4">
                  <Skeleton className="h-20 w-20 mx-auto rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section Skeleton */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                  <Skeleton className="h-5 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
