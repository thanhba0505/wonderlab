/**
 * Client Telemetry API Client — Wonderlab
 * Manages anonymous session IDs and communications with NestJS /api/v1/simulations
 */

export interface SimulationRunPayload {
  simulationSlug: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  trialsCount: number;
  durationMs?: number;
}

export interface SimulationRunItem {
  id: string;
  simulationSlug: string;
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  trialsCount: number;
  durationMs: number | null;
  clientSession: string | null;
  createdAt: string;
}

export interface SimulationGlobalStats {
  totalRuns: number;
  totalTrials: number;
  bySimulation: Record<
    string,
    {
      runs: number;
      trials: number;
      lastRunAt: string | null;
    }
  >;
  updatedAt: string;
}

const SESSION_STORAGE_KEY = 'wonderlab_client_session_id';

/**
 * Retrieves or generates an anonymous client session UUID.
 */
export function getClientSessionId(): string {
  if (typeof window === 'undefined') {
    return 'sess_ssr_placeholder';
  }

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `sess_${crypto.randomUUID()}`;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {
      // Ignore quota or private mode errors
    }
  }

  return sessionId;
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';
}

/**
 * Records a simulation run in the background. Fails gracefully if server is unreachable.
 */
export async function recordSimulationRun(
  payload: SimulationRunPayload,
): Promise<{ runId?: string; globalTrials?: number } | null> {
  try {
    const sessionId = getClientSessionId();
    const res = await fetch(`${getApiBaseUrl()}/simulations/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        ...payload,
        clientSession: sessionId,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      runId: data?.run?.id,
      globalTrials: data?.cumulative?.globalTrials,
    };
  } catch {
    // Non-blocking: background telemetry failures do not break client simulations
    return null;
  }
}

/**
 * Fetches aggregate telemetry statistics.
 */
export async function fetchSimulationStats(slug?: string): Promise<SimulationGlobalStats | null> {
  try {
    const url = new URL(`${getApiBaseUrl()}/simulations/stats`);
    if (slug) {
      url.searchParams.set('simulationSlug', slug);
    }

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches recent simulation runs for the current anonymous session.
 */
export async function fetchSimulationHistory(
  slug?: string,
  limit = 20,
): Promise<SimulationRunItem[]> {
  try {
    const sessionId = getClientSessionId();
    const url = new URL(`${getApiBaseUrl()}/simulations/runs/history`);
    if (slug) {
      url.searchParams.set('simulationSlug', slug);
    }
    url.searchParams.set('clientSession', sessionId);
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString(), {
      headers: { 'x-session-id': sessionId },
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}
