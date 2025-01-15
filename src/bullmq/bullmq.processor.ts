import { Injectable } from '@nestjs/common';
import { Worker } from 'bullmq';
import { calculatePrimes, multiplyMatrices } from '../utils/workloads';
import { MetricsService } from '../metrics/metrics.service';
import * as os from 'os';

@Injectable()
export class BullMQProcessor {
  constructor(private readonly metricsService: MetricsService) {
    this.initializeWorker();
  }

  private initializeWorker() {
    // Define a worker to process tasks in the queue
    new Worker(
      'taskQueue',
      async (job) => {
        const { workload, taskData, simulateFailure, priority } = job.data;

        console.log('Job received by BullMQ Processor :', job.data); // Log job details

        // Simulate failure logic
        if (simulateFailure && job.attemptsMade < 3) {
          console.log(
            `Simulating failure in BullMQ (Attempt ${job.attemptsMade + 1})`,
          );
          throw new Error('Simulated failure in BullMQ');
        }

        const startCpuMetrics = this.getCPUUsage();
        const start = process.hrtime();

        try {
          if (workload === 'primes') {
            calculatePrimes(taskData.count);
          } else if (workload === 'matrix') {
            multiplyMatrices(taskData.matrixSize);
          }

          const end = process.hrtime(start);
          const endCpuMetrics = this.getCPUUsage();

          // Log task metrics
          this.metricsService.logMetrics(
            'BullMQ',
            end,
            process.memoryUsage(),
            priority,
            startCpuMetrics,
            endCpuMetrics,
          );

          console.log('BullMQ task processed successfully');
        } catch (error) {
          console.error('Error during BullMQ task execution:', error);
          throw error;
        }
      },
      {
        connection: {
          host: '127.0.0.1',
          port: 6379,
        },
      },
    );
  }

  private getCPUUsage(): { [key: string]: number }[] {
    const cpus = os.cpus();
    return cpus.map((cpu) => cpu.times);
  }
}
