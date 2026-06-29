import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are running in the browser
env.allowLocalModels = false;

// Point to locally hosted WASM/MJS files to avoid CDN/CORS issues
env.wasm.wasmPaths = '/wasm/';

class PipelineSingleton {
  static task = 'zero-shot-classification' as const;
  static model = 'Xenova/mobilebert-uncased-mnli';
  static instance: any = null;

  static async getInstance(progress_callback?: (x: any) => void) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { text, messageId } = event.data;

  try {
    const classifier = await PipelineSingleton.getInstance((progress: any) => {
      self.postMessage({ status: 'progress', progress });
    });

    // Fallacy labels to detect
    const candidate_labels = [
      'ad hominem',
      'strawman',
      'overgeneralization',
      'logical argument',
      'opinion',
    ];

    // Perform zero-shot classification
    const output = await classifier(text, candidate_labels, { multi_label: true });

    // Filter labels with high confidence (e.g., > 0.8) for fallacies
    const detectedFallacies = [];
    for (let i = 0; i < output.labels.length; i++) {
      const label = output.labels[i];
      const score = output.scores[i];
      if (['ad hominem', 'strawman', 'overgeneralization'].includes(label) && score > 0.6) {
        detectedFallacies.push(label);
      }
    }

    // Send the output back to the main thread
    self.postMessage({
      status: 'complete',
      messageId,
      fallacies: detectedFallacies,
    });
  } catch (err) {
    console.error('Fallacy Worker Error:', err);
    self.postMessage({
      status: 'error',
      messageId,
      error: String(err),
    });
  }
});
