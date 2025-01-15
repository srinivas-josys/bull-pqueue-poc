import { Injectable } from '@nestjs/common';
import { BullTaskProcessor } from '../bull/bull.processor';
import { PQueueService } from '../pqueue/pqueue.service';
import { BullMQService } from 'src/bullmq/bullmq.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly bullProcessor: BullTaskProcessor,
    private readonly pQueueService: PQueueService,
    private readonly bullMQService: BullMQService,
  ) {}

  async addTaskToBull(data: any, simulateFailure = false): Promise<void> {
    const taskQueue = this.bullProcessor.getQueue();
    const { workload, taskData, priority } = data;

    if (!workload || !taskData || priority === undefined) {
      throw new Error('Missing required task data');
    }

    // Validate taskData based on workload type
    if (workload === 'primes' && !taskData.count) {
      throw new Error('Missing "count" in taskData for primes workload');
    }

    if (workload === 'matrix' && !taskData.matrixSize) {
      throw new Error('Missing "matrixSize" in taskData for matrix workload');
    }

    if (simulateFailure) {
      await taskQueue.add(
        {
          workload,
          taskData,
          priority,
          simulateFailure, // Add simulateFailure flag
        },
        {
          priority, // Set the priority
          attempts: 3, // Set the number of retry attempts
          backoff: 100, // Retry after 100ms on failure
        },
      );
    } else {
      await taskQueue.add(
        {
          workload,
          taskData,
          priority,
          simulateFailure, // Add simulateFailure flag
        },
        {
          priority, // Set the priority
        },
      );
    }

    console.log(`Task added to Bull with priority: ${priority}`);
  }

  async addTaskToBullMQ(
    data: any,
    simulateFailure = false,
    retries = 3,
  ): Promise<void> {
    const { workload, taskData, priority } = data;

    if (!workload || !taskData || priority === undefined) {
      throw new Error('Missing required task data');
    }

    // Validate taskData based on workload type
    if (workload === 'primes' && !taskData.count) {
      throw new Error('Missing "count" in taskData for primes workload');
    }

    if (workload === 'matrix' && !taskData.matrixSize) {
      throw new Error('Missing "matrixSize" in taskData for matrix workload');
    }

    // Add task to BullMQ queue
    await this.bullMQService.addTask(
      {
        workload,
        taskData,
        priority,
        simulateFailure,
      },
      priority, // Pass the priority explicitly
      simulateFailure,
      retries,
    );

    console.log(`Task added to BullMQ with priority: ${priority}`);
  }

  async addTaskToPQueue(
    data: any,
    priority = 1,
    simulateFailure: boolean = false,
  ): Promise<void> {
    await this.pQueueService.addTask(data, priority, simulateFailure);
  }

  async enqueueTask(
    workload: string,
    taskData: any,
    priority: number,
    simulateFailure = false,
  ): Promise<void> {
    const task = { workload, taskData, priority };
    await this.addTaskToBull(task, simulateFailure);
    await this.addTaskToBullMQ(task, simulateFailure);
    await this.addTaskToPQueue(task, priority, simulateFailure);
  }
}
