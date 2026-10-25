'use client';

import * as React from 'react';
import { fetchAdminOverview } from '@/lib/admin-api';
import { SimulationsView } from '../components/simulations-view';

export default function AdminSimulationsPage() {
  const [stats, setStats] = React.useState<Record<string, { runs: number; trials: number }>>({});

  React.useEffect(() => {
    fetchAdminOverview().then(overview => {
      if (overview?.bySimulation) {
        setStats(overview.bySimulation);
      }
    });
  }, []);

  return <SimulationsView simulationStats={stats} />;
}
