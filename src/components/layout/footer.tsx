"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { useCurrency } from "@/hooks/use-currency";
import { toast } from "sonner";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Send,
  Globe,
  DollarSign,
} from "lucide-react";
import React from "react";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations();
  const { theme } = useTheme();
  const { currentLanguage, setLanguage, getAvailableLanguages } = useLanguage();
  const { currentCurrency, setCurrency } = useCurrency();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success(t("newsletter.subscribed"));
        setEmail("");
      } else {
        toast.error(t("newsletter.error"));
      }
    } catch (error) {
      toast.error(t("newsletter.error"));
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/vendors", label: t("nav.vendors") },
    { href: "/deals", label: t("nav.deals") },
    { href: "/new-arrivals", label: t("nav.newArrivals") },
    { href: "/best-sellers", label: t("nav.bestSellers") },
  ];

  const customerService = [
    { href: "/help", label: t("footer.help") },
    { href: "/contact", label: t("footer.contact") },
    { href: "/shipping-info", label: t("footer.shipping") },
    { href: "/returns", label: t("footer.returns") },
    { href: "/size-guide", label: t("footer.sizeGuide") },
    { href: "/track-order", label: t("footer.trackOrder") },
  ];

  const company = [
    { href: "/about", label: t("footer.about") },
    { href: "/careers", label: t("footer.careers") },
    { href: "/press", label: t("footer.press") },
    { href: "/blog", label: t("footer.blog") },
    { href: "/become-vendor", label: t("footer.becomeVendor") },
    { href: "/affiliate", label: t("footer.affiliate") },
  ];

  const legal = [
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/cookies", label: t("footer.cookies") },
    { href: "/gdpr", label: t("footer.gdpr") },
    { href: "/accessibility", label: t("footer.accessibility") },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  const paymentMethods = [
    { name: "Visa", icon: "/images/payments/visa.svg" },
    { name: "Mastercard", icon: "/images/payments/mastercard.svg" },
    { name: "American Express", icon: "/images/payments/amex.svg" },
    { name: "PayPal", icon: "/images/payments/paypal.svg" },
    { name: "Apple Pay", icon: "/images/payments/apple-pay.svg" },
    { name: "Google Pay", icon: "/images/payments/google-pay.svg" },
  ];

  const features = [
    {
      icon: Truck,
      title: t("footer.features.freeShipping"),
      description: t("footer.features.freeShippingDesc"),
    },
    {
      icon: RotateCcw,
      title: t("footer.features.easyReturns"),
      description: t("footer.features.easyReturnsDesc"),
    },
    {
      icon: Shield,
      title: t("footer.features.securePayment"),
      description: t("footer.features.securePaymentDesc"),
    },
    {
      icon: Heart,
      title: t("footer.features.customerSupport"),
      description: t("footer.features.customerSupportDesc"),
    },
  ];

  return (
    <footer className={className}>
      {/* Features Section */}
      <div className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t bg-background">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-3">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">EcomStore</span>
              </Link>
              <p className="text-muted-foreground text-sm mb-4">
                {t("footer.description")}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{t("footer.address")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@ecomstore.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition-colors"
                  >
                    <social.icon className="h-4 w-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4">{t("footer.quickLinks")}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4">
                {t("footer.customerService")}
              </h3>
              <ul className="space-y-3">
                {customerService.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4">{t("footer.company")}</h3>
              <ul className="space-y-3">
                {company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-4">{t("footer.newsletter")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("footer.newsletterDesc")}
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t("footer.subscribe")}
                </Button>
              </form>

              {/* Language & Currency Selector */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Language selector logic
                  }}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {currentLanguage.name.toUpperCase()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Currency selector logic
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  {String(currentCurrency)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t bg-muted/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>© 2025 EcomStore. {t("footer.allRightsReserved")}</span>
              <div className="flex items-center gap-4">
                {legal.map((link, index) => (
                  <React.Fragment key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                    {index < legal.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground mr-2">
                {t("footer.paymentMethods")}:
              </span>
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="h-6 w-10 bg-white rounded border flex items-center justify-center"
                >
                  <Image
                    src={method.icon}
                    alt={method.name}
                    width={32}
                    height={20}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
