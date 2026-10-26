export type WorkerRequestType = 'START' | 'ABORT';

export interface WorkerRequestMessage<TParam> {
  type: WorkerRequestType;
  id: string;
  parameters: TParam;
  batchSize?: number;
}

export type WorkerResponseType = 'PROGRESS' | 'COMPLETE' | 'ERROR' | 'ABORTED';

export interface WorkerResponseMessage<TResult> {
  type: WorkerResponseType;
  id: string;
  progress: number; // 0 -> 100
  partialResults?: Partial<TResult>;
  finalResult?: TResult;
  error?: string;
}

export interface MontyHallWorkerParams {
  trials: number;
}

export interface MontyHallWorkerResult {
  switchPlays: number;
  switchWins: number;
  stayPlays: number;
  stayWins: number;
  totalTrials: number;
  completedTrials: number;
  switchWinRate: number;
  stayWinRate: number;
}

export interface BirthdayWorkerParams {
  n: number;
  trials: number;
  daysInYear?: number;
}

export interface BirthdayWorkerResult {
  n: number;
  trials: number;
  completedTrials: number;
  collisions: number;
  empiricalRate: number;
  theoreticalRate: number;
}
