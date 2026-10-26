import { Injectable } from '@nestjs/common';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  ServerDictionary,
  SupportedLocale,
} from './i18n.types';
import { viTranslations } from './locales/vi';
import { enTranslations } from './locales/en';

@Injectable()
export class I18nService {
  private readonly dictionaries: Record<SupportedLocale, ServerDictionary> = {
    vi: viTranslations,
    en: enTranslations,
  };

  /**
   * Resolves a SupportedLocale from an Accept-Language header, raw locale string, or query param.
   * Defaults to 'vi' if unrecognized.
   */
  resolveLocale(rawLocale?: string | null): SupportedLocale {
    if (!rawLocale) {
      return DEFAULT_LOCALE;
    }

    const normalized = rawLocale.toLowerCase().trim();

    // Direct match
    if (normalized.startsWith('en')) {
      return 'en';
    }
    if (normalized.startsWith('vi')) {
      return 'vi';
    }

    // Parse standard Accept-Language header (e.g. 'en-US,en;q=0.9,vi;q=0.8')
    const parts = normalized.split(',').map(p => p.split(';')[0]?.trim() || '');
    for (const part of parts) {
      for (const loc of SUPPORTED_LOCALES) {
        if (part === loc || part.startsWith(`${loc}-`)) {
          return loc;
        }
      }
    }

    return DEFAULT_LOCALE;
  }

  /**
   * Retrieves the full dictionary for the given locale.
   */
  getDictionary(locale: SupportedLocale = DEFAULT_LOCALE): ServerDictionary {
    return this.dictionaries[locale] || this.dictionaries[DEFAULT_LOCALE];
  }

  /**
   * Translates a dot-notated key (e.g. 'auth.invalid_credentials')
   * with optional parameter interpolation {name}.
   */
  t(
    key: string,
    locale?: string | null,
    params?: Record<string, string | number>,
  ): string {
    const resolvedLocale = this.resolveLocale(locale);
    const dict = this.getDictionary(resolvedLocale);

    const segments = key.split('.');
    let current: unknown = dict;

    for (const segment of segments) {
      if (
        current &&
        typeof current === 'object' &&
        segment in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        // Fallback to Vietnamese dictionary
        let fallback: unknown = this.dictionaries[DEFAULT_LOCALE];
        for (const fbSegment of segments) {
          if (
            fallback &&
            typeof fallback === 'object' &&
            fbSegment in (fallback as Record<string, unknown>)
          ) {
            fallback = (fallback as Record<string, unknown>)[fbSegment];
          } else {
            return key;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    let text = current;
    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        text = text.replaceAll(`{${paramKey}}`, String(paramVal));
      }
    }

    return text;
  }
}
