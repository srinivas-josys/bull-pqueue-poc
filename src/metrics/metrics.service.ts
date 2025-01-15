import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  async logMetrics(
    library: string,
    duration: [number, number],
    memoryUsage: NodeJS.MemoryUsage,
    priority: number,
    startCpuMetrics: { [key: string]: number }[],
    endCpuMetrics: { [key: string]: number }[],
  ): Promise<void> {
    // Log the task metrics
    console.log(`[${library}] Priority: ${priority}`);
    console.log(
      `[${library}] Duration: ${duration[0]}s ${duration[1] / 1e6}ms`,
    );
    console.log(
      `[${library}] Memory Usage: ${(memoryUsage.rss / 1e6).toFixed(2)}MB`,
    );

    // Log only the CPU metrics difference
    this.logCpuMetricsDifference(
      startCpuMetrics,
      endCpuMetrics,
      library,
      priority,
    );
  }

  private logCpuMetricsDifference(
    startCpuMetrics: any[],
    endCpuMetrics: any[],
    library: string,
    priority: number,
  ): void {
    console.log(`[${library}] CPU Metrics Difference (Priority: ${priority}):`);

    startCpuMetrics.forEach((startMetrics, index) => {
      const endMetrics = endCpuMetrics[index];

      // console.log('Start Metrics', startMetrics);
      // console.log('End Metrics', endMetrics);

      // Calculate the time difference for each state (user, system, idle)
      const userDiff = endMetrics.user - startMetrics.user;
      const systemDiff = endMetrics.sys - startMetrics.sys;
      const idleDiff = endMetrics.idle - startMetrics.idle;

      /*
      // Calculate total time difference
      const totalDiff = userDiff + systemDiff + idleDiff;

      // Calculate percentage usage for each state
      const userPercentage = (userDiff / totalDiff) * 100;
      const systemPercentage = (systemDiff / totalDiff) * 100;
      const idlePercentage = (idleDiff / totalDiff) * 100;

      console.log(
        `Core ${index + 1}: User: ${userPercentage.toFixed(2)}%, System: ${systemPercentage.toFixed(2)}%, Idle: ${idlePercentage.toFixed(2)}%`,
      );
      */

      console.log(
        `Core ${index + 1}: User: ${userDiff} ms, System: ${systemDiff} ms, Idle: ${idleDiff} ms`,
      );
    });
    console.log(
      '============================================================================================',
    );
  }
}
