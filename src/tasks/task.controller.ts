import { Controller, Post, Body } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('enqueue')
  async enqueueTasks(@Body() body: { library: string }): Promise<void> {
    const { library } = body;

    // Validate library and add tasks accordingly
    if (library === 'bull') {
      // Adding tasks for Bull
      await this.taskService.addTaskToBull({
        workload: 'primes',
        taskData: { count: 10000 },
        priority: 1,
      });
      await this.taskService.addTaskToBull({
        workload: 'matrix',
        taskData: { matrixSize: 200 },
        priority: 5,
      });
    } else if (library === 'pqueue') {
      // Adding tasks for PQueue
      await this.taskService.addTaskToPQueue(
        { workload: 'primes', taskData: { count: 10000 } },
        1,
      );
      await this.taskService.addTaskToPQueue(
        { workload: 'matrix', taskData: { matrixSize: 200 } },
        5,
      );
    } else if (library === 'bullmq') {
      await this.taskService.addTaskToBullMQ({
        workload: 'primes',
        taskData: { count: 10000 },
        priority: 1,
      });
      await this.taskService.addTaskToBullMQ({
        workload: 'matrix',
        taskData: { matrixSize: 200 },
        priority: 5,
      });
    } else {
      throw new Error('Invalid library specified. Use "bull" or "pqueue".');
    }
  }

  @Post('enqueue-and-compare-full-metrics')
  async enqueueAndCompareFullMetrics(): Promise<any> {
    // Timing Bull execution and collecting metrics
    const bullStart = process.hrtime();
    const bullStartCpuMetrics = this.getCPUUsage();
    const bullStartMemory = process.memoryUsage();
    await this.taskService.enqueueTask('primes', { count: 10000 }, 1);
    await this.taskService.enqueueTask('matrix', { matrixSize: 200 }, 5);
    const bullEnd = process.hrtime(bullStart);
    const bullEndCpuMetrics = this.getCPUUsage();
    const bullEndMemory = process.memoryUsage();

    // Timing PQueue execution and collecting metrics
    const pQueueStart = process.hrtime();
    const pQueueStartCpuMetrics = this.getCPUUsage();
    const pQueueStartMemory = process.memoryUsage();
    await this.taskService.enqueueTask('primes', { count: 10000 }, 1);
    await this.taskService.enqueueTask('matrix', { matrixSize: 200 }, 5);
    const pQueueEnd = process.hrtime(pQueueStart);
    const pQueueEndCpuMetrics = this.getCPUUsage();
    const pQueueEndMemory = process.memoryUsage();

    // Collect metrics for BullMQ
    const bullMQStart = process.hrtime();
    const bullMQStartCpuMetrics = this.getCPUUsage();
    const bullMQStartMemory = process.memoryUsage();
    await this.taskService.addTaskToBullMQ({
      workload: 'primes',
      taskData: { count: 10000 },
      priority: 1,
    });
    await this.taskService.addTaskToBullMQ({
      workload: 'matrix',
      taskData: { matrixSize: 200 },
      priority: 5,
    });
    const bullMQEnd = process.hrtime(bullMQStart);
    const bullMQEndCpuMetrics = this.getCPUUsage();
    const bullMQEndMemory = process.memoryUsage();

    // Collecting full metrics for comparison
    const fullMetrics = {
      bull: {
        executionTime: bullEnd,
        startCpuMetrics: bullStartCpuMetrics,
        endCpuMetrics: bullEndCpuMetrics,
        startMemoryUsage: bullStartMemory,
        endMemoryUsage: bullEndMemory,
      },
      pQueue: {
        executionTime: pQueueEnd,
        startCpuMetrics: pQueueStartCpuMetrics,
        endCpuMetrics: pQueueEndCpuMetrics,
        startMemoryUsage: pQueueStartMemory,
        endMemoryUsage: pQueueEndMemory,
      },
      bullMQ: {
        executionTime: bullMQEnd,
        startCpuMetrics: bullMQStartCpuMetrics,
        endCpuMetrics: bullMQEndCpuMetrics,
        startMemoryUsage: bullMQStartMemory,
        endMemoryUsage: bullMQEndMemory,
      },
    };

    return fullMetrics;
  }

  @Post('simulate-failure-retry')
  async simulateFailureAndRetry(
    @Body() body: { library: string; simulateFailure: boolean },
  ): Promise<any> {
    const { library, simulateFailure } = body;
    let result: any = {};

    // Handling Bull or PQueue based on the passed library and simulateFailure flag
    if (library === 'bull') {
      try {
        await this.taskService.addTaskToBull(
          {
            workload: 'primes',
            taskData: { count: 10000 },
            priority: 1,
          },
          simulateFailure, // Pass simulateFailure as a separate argument
        );
        await this.taskService.addTaskToBull(
          {
            workload: 'matrix',
            taskData: { matrixSize: 200 },
            priority: 5,
          },
          simulateFailure, // Pass simulateFailure as a separate argument
        );
        result = {
          status: 'success',
          message: 'Bull tasks processed with retries.',
        };
      } catch (error) {
        result = {
          status: 'error',
          message: `Bull task failed: ${error.message}`,
        };
      }
    } else if (library === 'pqueue') {
      try {
        await this.taskService.addTaskToPQueue(
          {
            workload: 'primes',
            taskData: { count: 10000 },
          },
          1, // Pass priority correctly
          simulateFailure, // Pass simulateFailure as a separate argument
        );
        await this.taskService.addTaskToPQueue(
          {
            workload: 'matrix',
            taskData: { matrixSize: 200 },
          },
          5, // Pass priority correctly
          simulateFailure, // Pass simulateFailure as a separate argument
        );
        result = {
          status: 'success',
          message: 'PQueue tasks processed with retries.',
        };
      } catch (error) {
        result = {
          status: 'error',
          message: `PQueue task failed: ${error.message}`,
        };
      }
    } else if (library === 'bullmq') {
      try {
        await this.taskService.addTaskToBullMQ(
          { workload: 'primes', taskData: { count: 10000 }, priority: 1 },
          simulateFailure,
        );
        await this.taskService.addTaskToBullMQ(
          { workload: 'matrix', taskData: { matrixSize: 200 }, priority: 5 },
          simulateFailure,
        );
        result = {
          status: 'success',
          message: 'BullMQ tasks processed with retries.',
        };
      } catch (error) {
        result = {
          status: 'error',
          message: `BullMQ task failed: ${error.message}`,
        };
      }
    } else {
      result = {
        status: 'error',
        message:
          'Invalid library specified. Use "bull" or "pqueue" or "bullmq".',
      };
    }

    return result;
  }

  private getCPUUsage(): { [key: string]: number }[] {
    const os = require('os');
    const cpus = os.cpus();
    return cpus.map((cpu) => cpu.times);
  }
}
