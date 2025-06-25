"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Copy,
  QrCode,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string;
  className?: string;
  variant?: "button" | "icon" | "inline";
  platforms?: SocialPlatform[];
  showCopyLink?: boolean;
  showQRCode?: boolean;
  onShare?: (platform: string) => void;
}

type SocialPlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "email"
  | "copy"
  | "qr";

const defaultPlatforms: SocialPlatform[] = [
  "facebook",
  "twitter",
  "linkedin",
  "whatsapp",
  "email",
  "copy",
];

export function SocialShare({
  url,
  title = "",
  description = "",
  image = "",
  hashtags = [],
  via = "",
  className,
  variant = "button",
  platforms = defaultPlatforms,
  showCopyLink = true,
  showQRCode = false,
  onShare,
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}${hashtags.length > 0 ? `&hashtags=${hashtags.join(",")}` : ""}${via ? `&via=${via}` : ""}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
  };

  const platformConfig = {
    facebook: {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    twitter: {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    linkedin: {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
    },
    whatsapp: {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
    },
    telegram: {
      name: "Telegram",
      icon: MessageCircle,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    email: {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    copy: {
      name: "Copy Link",
      icon: Copy,
      color: "bg-gray-600 hover:bg-gray-700",
    },
    qr: {
      name: "QR Code",
      icon: QrCode,
      color: "bg-gray-600 hover:bg-gray-700",
    },
  };

  const handleShare = async (platform: SocialPlatform) => {
    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast("Link copied! The link has been copied to your clipboard.");
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast("Link copied! The link has been copied to your clipboard.");
      }
    } else if (platform === "qr") {
      // Generate QR code (implement with a QR code library)
      toast("QR code generation coming soon!");

      onShare?.(platform);
      setIsOpen(false);
    }

    if (variant === "inline") {
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <span className="text-sm font-medium">Share:</span>
          {platforms.map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;

            return (
              <Button
                key={platform}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleShare(platform)}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">Share on {config.name}</span>
              </Button>
            );
          })}
        </div>
      );
    }

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === "icon" ? "ghost" : "outline"}
            size={variant === "icon" ? "icon" : "default"}
            className={className}
          >
            <Share2 className="h-4 w-4" />
            {variant === "button" && <span className="ml-2">Share</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Share this page</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {platforms.map((platform) => {
            const config = platformConfig[platform];
            const Icon = config.icon;

            return (
              <DropdownMenuItem
                key={platform}
                onClick={() => handleShare(platform)}
                className="flex items-center gap-3"
              >
                <Icon className="h-4 w-4" />
                <span>{config.name}</span>
              </DropdownMenuItem>
            );
          })}

          {showQRCode && !platforms.includes("qr") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleShare("qr")}
                className="flex items-center gap-3"
              >
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
}
