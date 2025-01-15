import { Module } from '@nestjs/common';
import { PQueueService } from './pqueue.service';
import { MetricsService } from 'src/metrics/metrics.service';

@Module({
  providers: [PQueueService, MetricsService],
  exports: [PQueueService],
})
export class PQueueModule {}
