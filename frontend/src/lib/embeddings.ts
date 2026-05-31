export type WorkerMessage = 
  | { status: 'initiate'; name: string; file: string }
  | { status: 'progress'; name: string; file: string; progress: number; loaded: number; total: number }
  | { status: 'done'; name: string; file: string }
  | { status: 'ready' }
  | { status: 'complete'; output: number[] }
  | { status: 'error'; error: string };

let worker: Worker | null = null;
let resolveEmbedding: ((value: number[]) => void) | null = null;
let rejectEmbedding: ((reason?: any) => void) | null = null;

export const generateEmbedding = async (
  text: string, 
  onProgress?: (msg: WorkerMessage) => void
): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    if (!worker) {
      worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module'
      });
    }

    resolveEmbedding = resolve;
    rejectEmbedding = reject;

    worker.onmessage = (event) => {
      const msg: WorkerMessage = event.data;
      
      if (msg.status === 'complete') {
        if (resolveEmbedding) resolveEmbedding(msg.output);
        resolveEmbedding = null;
        rejectEmbedding = null;
      } else if (msg.status === 'error') {
        if (rejectEmbedding) rejectEmbedding(new Error(msg.error));
        resolveEmbedding = null;
        rejectEmbedding = null;
      } else if (onProgress) {
        onProgress(msg);
      }
    };

    worker.onerror = (error) => {
      if (rejectEmbedding) rejectEmbedding(error);
      resolveEmbedding = null;
      rejectEmbedding = null;
    };

    worker.postMessage({ text });
  });
};
