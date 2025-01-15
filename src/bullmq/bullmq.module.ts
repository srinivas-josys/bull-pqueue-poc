import { Module } from '@nestjs/common';
import { MetricsService } from 'src/metrics/metrics.service';
import { BullMQService } from './bullmq.service';
import { BullMQProcessor } from './bullmq.processor';

@Module({
  providers: [BullMQService, BullMQProcessor, MetricsService],
  exports: [BullMQService],
})
export class BullMQModule {}
