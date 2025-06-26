"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Users, CreditCard, BarChart3, Shield, Zap } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
    {
      icon: Store,
      title: "Multi-Vendor Platform",
      description: "Enable multiple vendors to sell on your platform",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Complete authentication and role-based access control",
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Multiple payment gateways with secure transactions",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive analytics and reporting tools",
    },
    {
      icon: Shield,
      title: "Security First",
      description: "Built with security best practices and compliance",
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Optimized for speed and scalability",
    },
  ];

  return (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to OnCart Setup
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You're about to set up a powerful multi-vendor ecommerce platform.
          This wizard will guide you through the process step by step.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="text-left">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          What you'll need:
        </h3>
        <ul className="text-left text-blue-800 space-y-1">
          <li>• Administrator email and password</li>
          <li>• Store name and basic settings</li>
          <li>• About 5 minutes of your time</li>
        </ul>
      </div>

      <Button onClick={onNext} size="lg" className="w-full md:w-auto px-8">
        Let's Get Started
      </Button>
    </div>
  );
}
