'use client';

import * as React from 'react';
import { Languages, Check } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  AppDropdown,
  AppDropdownItem,
  AppDropdownHeader,
  AppDropdownSeparator,
} from '@/components/ui';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className }: LanguageSwitcherProps) {
  const { locale, setLocale, dict } = useTranslation();

  if (variant === 'toggle') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-lg border border-slate-300/80 bg-slate-100/90 p-0.5 shadow-sm',
          className,
        )}
        role="group"
        aria-label={dict.header.language}
      >
        <button
          type="button"
          onClick={() => setLocale('vi')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-all duration-150 active:scale-[0.98]',
            locale === 'vi'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/90'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
          )}
          aria-pressed={locale === 'vi'}
        >
          <span>VI</span>
          <span className="sr-only">Tiếng Việt</span>
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-all duration-150 active:scale-[0.98]',
            locale === 'en'
              ? 'bg-white text-blue-700 shadow-sm border border-slate-200/90'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
          )}
          aria-pressed={locale === 'en'}
        >
          <span>EN</span>
          <span className="sr-only">English</span>
        </button>
      </div>
    );
  }

  return (
    <AppDropdown
      className={className}
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white/90 px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-700 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-[0.98]"
          aria-label={dict.header.language}
        >
          <Languages className="h-3.5 w-3.5 text-blue-600" />
          <span className="uppercase tracking-wider">{locale}</span>
        </button>
      }
    >
      <AppDropdownHeader>{dict.header.language}</AppDropdownHeader>
      <AppDropdownSeparator />
      <AppDropdownItem
        onClick={() => setLocale('vi')}
        className={cn(
          'flex items-center justify-between text-xs font-medium',
          locale === 'vi' && 'font-semibold text-blue-700 bg-blue-50/70',
        )}
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">[VI]</span>
          <span>Tiếng Việt</span>
        </span>
        {locale === 'vi' && <Check className="h-3.5 w-3.5 text-blue-600" />}
      </AppDropdownItem>
      <AppDropdownItem
        onClick={() => setLocale('en')}
        className={cn(
          'flex items-center justify-between text-xs font-medium',
          locale === 'en' && 'font-semibold text-blue-700 bg-blue-50/70',
        )}
      >
        <span className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">[EN]</span>
          <span>English</span>
        </span>
        {locale === 'en' && <Check className="h-3.5 w-3.5 text-blue-600" />}
      </AppDropdownItem>
    </AppDropdown>
  );
}
