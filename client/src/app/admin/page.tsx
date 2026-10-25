'use client';

import * as React from 'react';
import { AdminOverviewData, fetchAdminOverview } from '@/lib/admin-api';
import { DashboardView } from './components/dashboard-view';

export default function AdminDashboardPage() {
  const [overview, setOverview] = React.useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const loadOverview = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  return <DashboardView overview={overview} isLoading={isLoading} onRefresh={loadOverview} />;
}
