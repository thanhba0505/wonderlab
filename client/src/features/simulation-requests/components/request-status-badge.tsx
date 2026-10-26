'use client';

import * as React from 'react';
import { AppTag } from '@/components/ui';
import { SimulationRequestStatus } from '@/lib/simulation-requests-api';
import { STATUS_CONFIG } from '../constants';
import { useTranslation } from '@/i18n';

interface RequestStatusBadgeProps {
  status: SimulationRequestStatus;
  size?: 'sm' | 'md';
}

export function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps) {
  const { dict } = useTranslation();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  const label = React.useMemo(() => {
    switch (status) {
      case 'PENDING':
        return dict.requests.status_pending;
      case 'UNDER_REVIEW':
        return dict.requests.status_under_review;
      case 'PLANNED':
        return dict.requests.status_planned;
      case 'IN_DEVELOPMENT':
        return dict.requests.status_in_progress;
      case 'COMPLETED':
        return dict.requests.status_completed;
      case 'REJECTED':
        return dict.requests.status_declined;
      default:
        return config.label;
    }
  }, [status, dict.requests, config.label]);

  return (
    <AppTag variant={config.variant} size={size}>
      {label}
    </AppTag>
  );
}
