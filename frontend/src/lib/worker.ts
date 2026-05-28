import { pipeline, env } from '@xenova/transformers';

// Skip local model check since we're pulling from HuggingFace
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static task = 'feature-extraction' as const;
  static model = 'Supabase/gte-small';
  static instance: any = null;

  static async getInstance(progress_callback: Function) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  try {
    // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    const extractor = await PipelineSingleton.getInstance((x: any) => {
      // We also add a progress callback to the pipeline so that we can
      // track model loading.
      self.postMessage(x);
    });

    // Actually perform the feature extraction
    const output = await extractor(event.data.text, {
      pooling: 'mean',
      normalize: true,
    });

    // Send the output back to the main thread
    self.postMessage({
      status: 'complete',
      output: Array.from(output.data),
    });
  } catch (error: any) {
    self.postMessage({
      status: 'error',
      error: error.message,
    });
  }
});
