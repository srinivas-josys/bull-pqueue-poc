import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MetricsService } from 'src/metrics/metrics.service';
import { TaskService } from 'src/tasks/task.service';
import { BullTaskProcessor } from './bull.processor';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'taskQueue',
    }),
  ],
  providers: [TaskService, BullTaskProcessor, MetricsService],
})
export class AppModule {}
