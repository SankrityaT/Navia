// AI Request Queue System with Rate Limiting
// Prevents overwhelming APIs and provides better UX

interface QueuedRequest {
  id: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  provider: 'groq' | 'gemini';
  timestamp: number;
}

class AIRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastGroqRequest = 0;
  private lastGeminiRequest = 0;
  
  // Rate limits (milliseconds between requests)
  private readonly GROQ_DELAY = 1000; // 1 second between Groq requests
  private readonly GEMINI_DELAY = 500; // 0.5 seconds between Gemini requests
  
  // Queue status callbacks
  private statusCallbacks: Array<(status: QueueStatus) => void> = [];

  async addRequest(
    execute: () => Promise<any>,
    provider: 'groq' | 'gemini' = 'groq'
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${provider}-${Date.now()}-${Math.random()}`,
        execute,
        resolve,
        reject,
        provider,
        timestamp: Date.now(),
      };

      this.queue.push(request);
      this.notifyStatusChange();
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue[0];
      
      // Check rate limit
      const now = Date.now();
      const delay = request.provider === 'groq' ? this.GROQ_DELAY : this.GEMINI_DELAY;
      const lastRequest = request.provider === 'groq' ? this.lastGroqRequest : this.lastGeminiRequest;
      const timeSinceLastRequest = now - lastRequest;
      
      if (timeSinceLastRequest < delay) {
        // Wait for rate limit
        await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastRequest));
      }
      
      // Execute request
      try {
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      
      // Update last request time
      if (request.provider === 'groq') {
        this.lastGroqRequest = Date.now();
      } else {
        this.lastGeminiRequest = Date.now();
      }
      
      // Remove from queue
      this.queue.shift();
      this.notifyStatusChange();
    }
    
    this.processing = false;
  }

  onStatusChange(callback: (status: QueueStatus) => void) {
    this.statusCallbacks.push(callback);
  }

  private notifyStatusChange() {
    const status: QueueStatus = {
      queueLength: this.queue.length,
      processing: this.processing,
      estimatedWaitTime: this.queue.length * 1000, // Rough estimate
    };
    
    this.statusCallbacks.forEach(cb => cb(status));
  }

  getStatus(): QueueStatus {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      estimatedWaitTime: this.queue.length * 1000,
    };
  }
}

export interface QueueStatus {
  queueLength: number;
  processing: boolean;
  estimatedWaitTime: number;
}

// Singleton instance
export const aiQueue = new AIRequestQueue();
