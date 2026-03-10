// Retry/backoff utilities for agent tasks

export class RetryPolicy {
  static DEFAULT_MAX_RETRIES = 3;
  static DEFAULT_BASE_DELAY = 1000; // 1 second
  static DEFAULT_MAX_DELAY = 30000; // 30 seconds

  static getDelay(attempt: number): number {
    const baseDelay = RetryPolicy.DEFAULT_BASE_DELAY;
    const maxDelay = RetryPolicy.DEFAULT_MAX_DELAY;
    return Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1));
  }
}

export class TaskRetryHandler {
  static async executeWithRetry(
    supabase: any,
    task: any,
    handler: (supabase: any, task: any) => Promise<any>,
    maxRetries: number = RetryPolicy.DEFAULT_MAX_RETRIES
  ) {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      try {
        // Mark task as running
        await supabase
          .from('agent_tasks')
          .update({ status: 'running', error: null })
          .eq('id', task.id);

        // Execute task
        const result = await handler(supabase, task);

        // Mark task as completed
        await supabase
          .from('agent_tasks')
          .update({ status: 'completed', result, error: null })
          .eq('id', task.id);

        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt >= maxRetries) {
          // Mark task as failed
          await supabase
            .from('agent_tasks')
            .update({ status: 'failed', error: lastError.message })
            .eq('id', task.id);
          
          throw lastError;
        }

        // Wait before retry
        const delay = RetryPolicy.getDelay(attempt);
        console.log(`Retrying task ${task.id} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
