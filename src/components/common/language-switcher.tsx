'use client';

import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showFlags?: boolean;
  showProgress?: boolean;
}

export function LanguageSwitcher({
  variant = 'default',
  align = 'end',
  className,
  showFlags = true,
  showProgress = false,
}: LanguageSwitcherProps) {
  const {
    languages,
    currentLanguage,
    setLanguage,
    getAvailableLanguages,
    isLoading,
  } = useLanguage();

  const availableLanguages = getAvailableLanguages();

  if (isLoading || !currentLanguage) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="h-4 w-4" />
        {variant === 'default' && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  const formatLanguageDisplay = (language: any) => {
    switch (variant) {
      case 'compact':
        return language.code.toUpperCase();
      case 'icon-only':
        return showFlags ? language.flag : language.code.toUpperCase();
      default:
        return language.nativeName;
    }
  };

  const getLanguageFlag = (language: any) => {
    if (language.flag) {
      return language.flag;
    }
    // Fallback flags based on language code
    const flags: Record<string, string> = {
      en: '🇺🇸',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
      ar: '🇸🇦',
      zh: '🇨🇳',
      ja: '🇯🇵',
      ko: '🇰🇷',
      pt: '🇵🇹',
      ru: '🇷🇺',
      it: '🇮🇹',
      nl: '🇳🇱',
    };
    return flags[language.code] || '🌐';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2', className)}
        >
          <Globe className="h-4 w-4" />
          {variant !== 'icon-only' && (
            <>
              {showFlags && (
                <span className="text-base">{getLanguageFlag(currentLanguage)}</span>
              )}
              <span>{formatLanguageDisplay(currentLanguage)}</span>
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {showFlags && (
                <span className="text-lg">{getLanguageFlag(language)}</span>
              )}
              <div>
                <div className="font-medium">{language.nativeName}</div>
                <div className="text-xs text-muted-foreground">{language.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showProgress && (
                <Badge variant="outline" className="text-xs">
                  {language.completeness}%
                </Badge>
              )}
              {currentLanguage.code === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
          {availableLanguages.length} languages available
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
