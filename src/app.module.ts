import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PQueueModule } from './pqueue/pqueue.module';
import { TaskController } from './tasks/task.controller';
import { TaskService } from './tasks/task.service';
import { MetricsService } from './metrics/metrics.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullTaskProcessor } from './bull/bull.processor';
import { BullMQModule } from './bullmq/bullmq.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'taskQueue',
    }),
    BullMQModule,
    PQueueModule,
  ],
  controllers: [AppController, TaskController],
  providers: [AppService, TaskService, MetricsService, BullTaskProcessor],
})
export class AppModule {}
