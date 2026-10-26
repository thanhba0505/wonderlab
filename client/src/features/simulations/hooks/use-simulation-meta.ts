'use client';

import * as React from 'react';
import { useTranslation } from '@/i18n';
import { getSimulationBySlug } from '../registry';
import { SimulationMeta } from '../types';

export function useSimulationMeta(slug: string): SimulationMeta | undefined {
  const { locale } = useTranslation();
  return React.useMemo(() => getSimulationBySlug(slug, locale), [slug, locale]);
}
