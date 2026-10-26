import type {
  WorkerRequestMessage,
  WorkerResponseMessage,
  BirthdayWorkerParams,
  BirthdayWorkerResult,
} from './types';
import { calculateTheoreticalBirthdayProbability, runBirthdayChunk } from './simulation-engines';

interface WorkerGlobalContext {
  postMessage: (message: WorkerResponseMessage<BirthdayWorkerResult>) => void;
  onmessage: ((event: MessageEvent<WorkerRequestMessage<BirthdayWorkerParams>>) => void) | null;
}

const ctx = self as unknown as WorkerGlobalContext;

let activeRequestId: string | null = null;
let isAborted = false;
let pendingTimerId: ReturnType<typeof setTimeout> | null = null;

let groupSize = 23;
let totalTrials = 0;
let completedTrials = 0;
let collisions = 0;
let daysInYear = 365;
let batchSize = 1000;
let theoreticalRate = 0;

function cleanup(): void {
  if (pendingTimerId !== null) {
    clearTimeout(pendingTimerId);
    pendingTimerId = null;
  }
  activeRequestId = null;
  isAborted = false;
}

function getSnapshot(): BirthdayWorkerResult {
  return {
    n: groupSize,
    trials: totalTrials,
    completedTrials,
    collisions,
    empiricalRate: completedTrials > 0 ? collisions / completedTrials : 0,
    theoreticalRate,
  };
}

function processNextChunk(): void {
  if (isAborted || !activeRequestId) {
    return;
  }

  const remaining = totalTrials - completedTrials;
  const currentChunkSize = Math.min(batchSize, remaining);

  const chunkCollisions = runBirthdayChunk(groupSize, currentChunkSize, daysInYear);
  collisions += chunkCollisions;
  completedTrials += currentChunkSize;

  const progress = Math.min(100, Math.round((completedTrials / totalTrials) * 100));
  const snapshot = getSnapshot();

  if (completedTrials >= totalTrials) {
    const id = activeRequestId;
    cleanup();
    ctx.postMessage({
      type: 'COMPLETE',
      id,
      progress: 100,
      finalResult: snapshot,
    });
  } else {
    ctx.postMessage({
      type: 'PROGRESS',
      id: activeRequestId,
      progress,
      partialResults: snapshot,
    });

    pendingTimerId = setTimeout(processNextChunk, 0);
  }
}

ctx.onmessage = (event: MessageEvent<WorkerRequestMessage<BirthdayWorkerParams>>) => {
  const message = event.data;
  if (!message) return;

  if (message.type === 'ABORT') {
    if (activeRequestId && activeRequestId === message.id) {
      isAborted = true;
      if (pendingTimerId !== null) {
        clearTimeout(pendingTimerId);
        pendingTimerId = null;
      }
      const snapshot = getSnapshot();
      const progress =
        totalTrials > 0 ? Math.min(100, Math.round((completedTrials / totalTrials) * 100)) : 0;
      const id = activeRequestId;
      cleanup();

      ctx.postMessage({
        type: 'ABORTED',
        id,
        progress,
        partialResults: snapshot,
      });
    }
    return;
  }

  if (message.type === 'START') {
    cleanup();

    activeRequestId = message.id;
    groupSize = Math.max(1, message.parameters?.n ?? 23);
    totalTrials = Math.max(1, message.parameters?.trials ?? 1000);
    daysInYear = message.parameters?.daysInYear ?? 365;
    completedTrials = 0;
    collisions = 0;
    isAborted = false;
    theoreticalRate = calculateTheoreticalBirthdayProbability(groupSize, daysInYear);

    // Default batch size: 5% of trials or user-specified batchSize (minimum 50, maximum 10000)
    const fivePercent = Math.max(50, Math.floor(totalTrials / 20));
    batchSize = message.batchSize ?? Math.min(10000, fivePercent);

    pendingTimerId = setTimeout(processNextChunk, 0);
  }
};
