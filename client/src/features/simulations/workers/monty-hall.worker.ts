import type {
  WorkerRequestMessage,
  WorkerResponseMessage,
  MontyHallWorkerParams,
  MontyHallWorkerResult,
} from './types';
import { runMontyHallChunk } from './simulation-engines';

interface WorkerGlobalContext {
  postMessage: (message: WorkerResponseMessage<MontyHallWorkerResult>) => void;
  onmessage: ((event: MessageEvent<WorkerRequestMessage<MontyHallWorkerParams>>) => void) | null;
}

const ctx = self as unknown as WorkerGlobalContext;

let activeRequestId: string | null = null;
let isAborted = false;
let pendingTimerId: ReturnType<typeof setTimeout> | null = null;

let totalTrials = 0;
let completedTrials = 0;
let switchPlays = 0;
let switchWins = 0;
let stayPlays = 0;
let stayWins = 0;
let batchSize = 1000;

function cleanup(): void {
  if (pendingTimerId !== null) {
    clearTimeout(pendingTimerId);
    pendingTimerId = null;
  }
  activeRequestId = null;
  isAborted = false;
}

function getSnapshot(): MontyHallWorkerResult {
  return {
    switchPlays,
    switchWins,
    stayPlays,
    stayWins,
    totalTrials,
    completedTrials,
    switchWinRate: switchPlays > 0 ? switchWins / switchPlays : 0,
    stayWinRate: stayPlays > 0 ? stayWins / stayPlays : 0,
  };
}

function processNextChunk(): void {
  if (isAborted || !activeRequestId) {
    return;
  }

  const remaining = totalTrials - completedTrials;
  const currentChunkSize = Math.min(batchSize, remaining);

  const chunk = runMontyHallChunk(currentChunkSize);
  switchPlays += chunk.switchPlays;
  switchWins += chunk.switchWins;
  stayPlays += chunk.stayPlays;
  stayWins += chunk.stayWins;
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

ctx.onmessage = (event: MessageEvent<WorkerRequestMessage<MontyHallWorkerParams>>) => {
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
    totalTrials = Math.max(1, message.parameters?.trials ?? 1000);
    completedTrials = 0;
    switchPlays = 0;
    switchWins = 0;
    stayPlays = 0;
    stayWins = 0;
    isAborted = false;

    // Default batch size: 5% of trials or user-specified batchSize (minimum 50, maximum 10000)
    const fivePercent = Math.max(50, Math.floor(totalTrials / 20));
    batchSize = message.batchSize ?? Math.min(10000, fivePercent);

    pendingTimerId = setTimeout(processNextChunk, 0);
  }
};
