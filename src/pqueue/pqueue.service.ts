import { Injectable } from '@nestjs/common';
import { calculatePrimes, multiplyMatrices } from '../utils/workloads';
import { MetricsService } from 'src/metrics/metrics.service';
import * as os from 'os';

@Injectable()
export class PQueueService {
  private queue: any;

  constructor(private readonly metricsService: MetricsService) {}

  async initializeQueue(): Promise<void> {
    if (!this.queue) {
      const { default: PQueue } = await import('p-queue'); // Dynamic import
      this.queue = new PQueue({
        concurrency: 4, // Set concurrency level
        autoStart: true,
      });
    }
  }

  async addTask(
    taskData: any,
    priority = 1,
    simulateFailure: boolean = false,
    retries = 3,
  ): Promise<void> {
    await this.initializeQueue(); // Ensure the queue is initialized

    // Capture initial CPU metrics before task processing
    const startCpuMetrics = this.getCPUUsage();

    const start = process.hrtime();
    let attempts = 0;

    const processTask = async (): Promise<void> => {
      try {
        // Actual task processing
        console.log('Processing task...');
        console.log('Task Data : ', taskData);

        // Simulate failure up to the defined retry limit
        if (simulateFailure && attempts < retries) {
          console.log(`Simulating failure... Attempt ${attempts + 1}`);
          attempts++;
          throw new Error('Simulated failure in PQueue');
        }

        await this.queue.add(() => this.simulateWork(taskData), { priority });

        console.log('Task completed successfully.');
      } catch (error) {
        // Retry logic
        if (attempts < retries) {
          console.log(`Retrying task... Attempt ${attempts + 1}`);
          await processTask(); // Retry task
        } else {
          console.error('Task failed after all retries:', error);
        }
      }
    };

    await processTask(); // Start the task execution process

    const end = process.hrtime(start);

    // Capture final CPU metrics after task completion
    await this.delay(5); // Delay after task to allow CPU usage to settle
    const endCpuMetrics = this.getCPUUsage();

    // Log the task execution metrics
    this.metricsService.logMetrics(
      'PQueue',
      end,
      process.memoryUsage(),
      priority,
      startCpuMetrics, // Start CPU metrics
      endCpuMetrics, // End CPU metrics
    );
  }

  private async simulateWork(data: any): Promise<void> {
    if (data.workload === 'primes') {
      calculatePrimes(data.count);
    } else if (data.workload === 'matrix') {
      multiplyMatrices(data.matrixSize);
    }
    console.log(`Task ${data.workload} Processed Successfully`);
  }

  // Get the current CPU usage of each core
  private getCPUUsage(): { [key: string]: number }[] {
    const cpus = os.cpus();
    const cpuTimes = cpus.map((cpu) => cpu.times);
    return cpuTimes;
  }

  // Delay function to pause execution for a given time in ms
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
