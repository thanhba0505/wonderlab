'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BirthdayWorkerParams,
  BirthdayWorkerResult,
  MontyHallWorkerParams,
  MontyHallWorkerResult,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from '../workers/types';
import {
  calculateTheoreticalBirthdayProbability,
  runBirthdayChunk,
  runMontyHallChunk,
} from '../workers/simulation-engines';

export interface UseSimulationWorkerOptions<TParam, TResult> {
  createWorker?: () => Worker;
  fallbackCompute?: (
    params: TParam,
    onProgress: (progress: number, partial?: Partial<TResult>) => void,
    isAborted: () => boolean,
  ) => Promise<TResult> | TResult;
  onProgress?: (progress: number, partial?: Partial<TResult>) => void;
  onComplete?: (result: TResult) => void;
  onError?: (error: Error) => void;
  onAborted?: (partial?: Partial<TResult>) => void;
}

export interface UseSimulationWorkerReturn<TParam, TResult> {
  isRunning: boolean;
  progress: number;
  result: TResult | null;
  partialResult: Partial<TResult> | null;
  error: Error | null;
  run: (params: TParam, batchSize?: number) => void;
  abort: () => void;
  reset: () => void;
}

/**
 * Universal React Hook for orchestrating Web Worker-based Monte Carlo simulations.
 * Manages worker lifecycle, progressive chunked event delivery, abort cancellation,
 * and seamless fallback when Web Workers are unavailable.
 */
export function useSimulationWorker<TParam, TResult>(
  createWorkerOrOptions?: (() => Worker) | UseSimulationWorkerOptions<TParam, TResult>,
  optionsArg?: UseSimulationWorkerOptions<TParam, TResult>,
): UseSimulationWorkerReturn<TParam, TResult> {
  const createWorker =
    typeof createWorkerOrOptions === 'function'
      ? createWorkerOrOptions
      : createWorkerOrOptions?.createWorker;

  const options =
    typeof createWorkerOrOptions === 'function'
      ? (optionsArg ?? {})
      : (createWorkerOrOptions ?? {});

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<TResult | null>(null);
  const [partialResult, setPartialResult] = useState<Partial<TResult> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const isAbortedRef = useRef<boolean>(false);
  const lastPartialRef = useRef<Partial<TResult> | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Cleanup worker instance when component unmounts
  useEffect(() => {
    return () => {
      isAbortedRef.current = true;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const getOrCreateWorker = useCallback((): Worker | null => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return null;
    }
    if (!createWorker) {
      return null;
    }
    if (workerRef.current) {
      return workerRef.current;
    }

    try {
      const worker = createWorker();

      worker.onmessage = (event: MessageEvent<WorkerResponseMessage<TResult>>) => {
        const message = event.data;
        if (!message || message.id !== currentRequestIdRef.current) {
          return;
        }

        switch (message.type) {
          case 'PROGRESS': {
            setProgress(message.progress);
            if (message.partialResults) {
              lastPartialRef.current = message.partialResults;
              setPartialResult(message.partialResults);
            }
            optionsRef.current.onProgress?.(message.progress, message.partialResults);
            break;
          }
          case 'COMPLETE': {
            setIsRunning(false);
            setProgress(100);
            if (message.finalResult) {
              setResult(message.finalResult);
              setPartialResult(message.finalResult);
              optionsRef.current.onComplete?.(message.finalResult);
            }
            currentRequestIdRef.current = null;
            break;
          }
          case 'ABORTED': {
            setIsRunning(false);
            setProgress(message.progress);
            if (message.partialResults) {
              lastPartialRef.current = message.partialResults;
              setPartialResult(message.partialResults);
            }
            optionsRef.current.onAborted?.(message.partialResults);
            currentRequestIdRef.current = null;
            break;
          }
          case 'ERROR': {
            setIsRunning(false);
            const err = new Error(
              message.error ?? 'Simulation Worker encountered an unhandled error',
            );
            setError(err);
            optionsRef.current.onError?.(err);
            currentRequestIdRef.current = null;
            break;
          }
        }
      };

      worker.onerror = (e: ErrorEvent) => {
        setIsRunning(false);
        const err = new Error(e.message || 'Worker thread execution error');
        setError(err);
        optionsRef.current.onError?.(err);
        currentRequestIdRef.current = null;
      };

      workerRef.current = worker;
      return worker;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      return null;
    }
  }, [createWorker]);

  const abort = useCallback(() => {
    isAbortedRef.current = true;
    setIsRunning(false);

    if (workerRef.current && currentRequestIdRef.current) {
      // Send abort message for graceful worker cleanup
      const abortMsg: WorkerRequestMessage<TParam> = {
        type: 'ABORT',
        id: currentRequestIdRef.current,
        parameters: {} as TParam,
      };
      workerRef.current.postMessage(abortMsg);
    }

    // Terminate worker to guarantee immediate cancellation and thread release
    terminateWorker();

    const snapshot = lastPartialRef.current;
    if (snapshot) {
      setPartialResult(snapshot);
      optionsRef.current.onAborted?.(snapshot);
    }

    currentRequestIdRef.current = null;
  }, [terminateWorker]);

  const run = useCallback(
    async (params: TParam, batchSize?: number) => {
      // Abort previous run if active
      if (isRunning) {
        abort();
      }

      const requestId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      currentRequestIdRef.current = requestId;
      isAbortedRef.current = false;
      setIsRunning(true);
      setProgress(0);
      setError(null);
      lastPartialRef.current = null;

      const worker = getOrCreateWorker();

      if (worker) {
        const requestMessage: WorkerRequestMessage<TParam> = {
          type: 'START',
          id: requestId,
          parameters: params,
          batchSize,
        };
        worker.postMessage(requestMessage);
      } else if (optionsRef.current.fallbackCompute) {
        try {
          const fallbackRes = await optionsRef.current.fallbackCompute(
            params,
            (prog, partial) => {
              if (isAbortedRef.current) return;
              setProgress(prog);
              if (partial) {
                lastPartialRef.current = partial;
                setPartialResult(partial);
              }
              optionsRef.current.onProgress?.(prog, partial);
            },
            () => isAbortedRef.current,
          );

          if (!isAbortedRef.current) {
            setIsRunning(false);
            setProgress(100);
            setResult(fallbackRes);
            setPartialResult(fallbackRes);
            optionsRef.current.onComplete?.(fallbackRes);
            currentRequestIdRef.current = null;
          }
        } catch (err) {
          if (!isAbortedRef.current) {
            setIsRunning(false);
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            optionsRef.current.onError?.(errorObj);
            currentRequestIdRef.current = null;
          }
        }
      } else {
        setIsRunning(false);
        const err = new Error(
          'Web Workers are not available in this runtime environment and no fallback computation was provided.',
        );
        setError(err);
        optionsRef.current.onError?.(err);
        currentRequestIdRef.current = null;
      }
    },
    [abort, getOrCreateWorker, isRunning],
  );

  const reset = useCallback(() => {
    abort();
    setProgress(0);
    setResult(null);
    setPartialResult(null);
    setError(null);
    lastPartialRef.current = null;
  }, [abort]);

  return {
    isRunning,
    progress,
    result,
    partialResult,
    error,
    run,
    abort,
    reset,
  };
}

/**
 * Fallback computation for Monty Hall when Web Workers are unavailable
 */
async function fallbackMontyHallCompute(
  params: MontyHallWorkerParams,
  onProgress: (progress: number, partial?: Partial<MontyHallWorkerResult>) => void,
  isAborted: () => boolean,
): Promise<MontyHallWorkerResult> {
  const total = Math.max(1, params.trials);
  let completed = 0;
  let switchPlays = 0;
  let switchWins = 0;
  let stayPlays = 0;
  let stayWins = 0;
  const chunkSize = Math.max(250, Math.floor(total / 20));

  while (completed < total && !isAborted()) {
    const count = Math.min(chunkSize, total - completed);
    const chunk = runMontyHallChunk(count);
    switchPlays += chunk.switchPlays;
    switchWins += chunk.switchWins;
    stayPlays += chunk.stayPlays;
    stayWins += chunk.stayWins;
    completed += count;

    const progress = Math.min(100, Math.round((completed / total) * 100));
    const snapshot: MontyHallWorkerResult = {
      switchPlays,
      switchWins,
      stayPlays,
      stayWins,
      totalTrials: total,
      completedTrials: completed,
      switchWinRate: switchPlays > 0 ? switchWins / switchPlays : 0,
      stayWinRate: stayPlays > 0 ? stayWins / stayPlays : 0,
    };
    onProgress(progress, snapshot);

    // Yield control to main thread event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return {
    switchPlays,
    switchWins,
    stayPlays,
    stayWins,
    totalTrials: total,
    completedTrials: completed,
    switchWinRate: switchPlays > 0 ? switchWins / switchPlays : 0,
    stayWinRate: stayPlays > 0 ? stayWins / stayPlays : 0,
  };
}

/**
 * Fallback computation for Birthday Paradox when Web Workers are unavailable
 */
async function fallbackBirthdayCompute(
  params: BirthdayWorkerParams,
  onProgress: (progress: number, partial?: Partial<BirthdayWorkerResult>) => void,
  isAborted: () => boolean,
): Promise<BirthdayWorkerResult> {
  const total = Math.max(1, params.trials);
  const n = Math.max(1, params.n);
  const daysInYear = params.daysInYear ?? 365;
  const theoreticalRate = calculateTheoreticalBirthdayProbability(n, daysInYear);
  let completed = 0;
  let collisions = 0;
  const chunkSize = Math.max(250, Math.floor(total / 20));

  while (completed < total && !isAborted()) {
    const count = Math.min(chunkSize, total - completed);
    const chunkCollisions = runBirthdayChunk(n, count, daysInYear);
    collisions += chunkCollisions;
    completed += count;

    const progress = Math.min(100, Math.round((completed / total) * 100));
    const snapshot: BirthdayWorkerResult = {
      n,
      trials: total,
      completedTrials: completed,
      collisions,
      empiricalRate: completed > 0 ? collisions / completed : 0,
      theoreticalRate,
    };
    onProgress(progress, snapshot);

    // Yield control to main thread event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return {
    n,
    trials: total,
    completedTrials: completed,
    collisions,
    empiricalRate: completed > 0 ? collisions / completed : 0,
    theoreticalRate,
  };
}

export function createMontyHallWorker(): Worker {
  return new Worker(new URL('../workers/monty-hall.worker.ts', import.meta.url));
}

export function createBirthdayWorker(): Worker {
  return new Worker(new URL('../workers/birthday-paradox.worker.ts', import.meta.url));
}

/**
 * Specialized hook for Monty Hall Monte Carlo simulation
 */
export function useMontyHallWorker(
  options?: Omit<
    UseSimulationWorkerOptions<MontyHallWorkerParams, MontyHallWorkerResult>,
    'createWorker'
  >,
): UseSimulationWorkerReturn<MontyHallWorkerParams, MontyHallWorkerResult> {
  return useSimulationWorker<MontyHallWorkerParams, MontyHallWorkerResult>(createMontyHallWorker, {
    ...options,
    fallbackCompute: options?.fallbackCompute ?? fallbackMontyHallCompute,
  });
}

/**
 * Specialized hook for Birthday Paradox Monte Carlo simulation
 */
export function useBirthdayWorker(
  options?: Omit<
    UseSimulationWorkerOptions<BirthdayWorkerParams, BirthdayWorkerResult>,
    'createWorker'
  >,
): UseSimulationWorkerReturn<BirthdayWorkerParams, BirthdayWorkerResult> {
  return useSimulationWorker<BirthdayWorkerParams, BirthdayWorkerResult>(createBirthdayWorker, {
    ...options,
    fallbackCompute: options?.fallbackCompute ?? fallbackBirthdayCompute,
  });
}
