import * as React from 'react';
import { AppTag } from '@/components/ui';
import { SimulationRequestStatus } from '@/lib/simulation-requests-api';
import { STATUS_CONFIG } from '../constants';

interface RequestStatusBadgeProps {
  status: SimulationRequestStatus;
  size?: 'sm' | 'md';
}

export function RequestStatusBadge({ status, size = 'sm' }: RequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <AppTag variant={config.variant} size={size}>
      {config.label}
    </AppTag>
  );
}
