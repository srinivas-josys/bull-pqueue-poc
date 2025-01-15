import { Process, InjectQueue, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { MetricsService } from 'src/metrics/metrics.service';
import { calculatePrimes, multiplyMatrices } from '../utils/workloads';
import * as os from 'os';

@Processor('taskQueue')
export class BullTaskProcessor {
  constructor(
    private readonly metricsService: MetricsService,
    @InjectQueue('taskQueue') private readonly taskQueue: Queue,
  ) {}

  getQueue(): Queue {
    return this.taskQueue;
  }

  @Process() // Default processor for the queue
  async handleTask(job: Job) {
    const { workload, taskData, priority, simulateFailure } = job.data;

    console.log('Job received by Bull Processor :', job.data); // Log job details

    // Simulate failure if the flag is set
    if (simulateFailure && job.attemptsMade < 3) {
      console.log(`Simulating failure (Attempt ${job.attemptsMade + 1})...`);
      throw new Error('Simulated failure in Bull processor'); // Trigger retry
    }

    const startCpuMetrics = this.getCPUUsage(); // Capture initial CPU metrics
    const start = process.hrtime(); // Record start time

    try {
      // Execute the actual workload
      if (workload === 'primes') {
        calculatePrimes(taskData.count);
      } else if (workload === 'matrix') {
        multiplyMatrices(taskData.matrixSize);
      }

      const end = process.hrtime(start); // Calculate task duration
      const endCpuMetrics = this.getCPUUsage(); // Capture final CPU metrics

      // Log task metrics
      this.metricsService.logMetrics(
        'Bull', // Library name
        end, // Task duration
        process.memoryUsage(), // Memory usage
        priority, // Task priority
        startCpuMetrics, // Start CPU metrics
        endCpuMetrics, // End CPU metrics
      );
    } catch (error) {
      console.error('Error during task execution:', error);
      throw error; // Rethrow the error for Bull to handle retries
    }
  }

  // Get the current CPU usage of each core
  private getCPUUsage(): { [key: string]: number }[] {
    const cpus = os.cpus();
    const cpuTimes = cpus.map((cpu) => cpu.times);
    return cpuTimes;
  }
}
