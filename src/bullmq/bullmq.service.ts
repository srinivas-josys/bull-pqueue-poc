import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullMQService {
  private readonly queue: Queue;

  constructor() {
    this.queue = new Queue('taskQueue', {
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    });
  }

  async addTask(
    taskData: any,
    priority = 1,
    simulateFailure = false,
    retries = 3,
  ) {
    await this.queue.add(
      'processTask',
      { ...taskData, simulateFailure, priority },
      {
        priority,
        attempts: retries,
        backoff: 1000, // Optional: Backoff between retries in milliseconds
      },
    );
    console.log(
      `Task added to BullMQ with priority: ${priority}, retries: ${retries}, simulateFailure: ${simulateFailure}`,
    );
  }

  getQueue(): Queue {
    return this.queue;
  }
}
