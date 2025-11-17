import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, MemoryHealthIndicator } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator
    ) { }

    @Public()
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
        ]);
    }

    @Public()
    @Get('memory')
    @HealthCheck()
    checkMemory() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
        ]);
    }

    @Public()
    @Get('uptime')
    @HealthCheck()
    checkUptime() {
        return this.health.check([
            async () => {
                const uptimeInSeconds = process.uptime();
                const formattedUptime = this.formatUptime(uptimeInSeconds);

                return {
                    uptime: {
                        status: 'up',
                        raw_seconds: uptimeInSeconds,
                        formatted: formattedUptime,
                    },
                };
            },
        ]);
    }

    private formatUptime(uptimeInSeconds: number): string {
        const days = Math.floor(uptimeInSeconds / 86400);
        const hours = Math.floor((uptimeInSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeInSeconds % 60);

        const parts: string[] = [];

        if (days > 0) {
            parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        }
        if (hours > 0) {
            parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
        }
        if (seconds > 0 || parts.length === 0) {
            parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
        }

        return parts.join(', ');
    }
}