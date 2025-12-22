import { Module } from '@nestjs/common';
import { PortalAccessLogController } from './controllers/portal-access-log.controller';
import { PortalAccessLogService } from './services/portal-access-log.service';
import { PrismaService } from '../../common/prisma/services/prisma.service';
import { PortalAccessLogRepository } from './repositories/portal-access-log.repository';
import { IPortalAccessLogRepository } from './repositories/portal-access-log.repository.interface';

@Module({
  controllers: [PortalAccessLogController],
  providers: [
    PortalAccessLogService,
    PrismaService,
    {
      provide: IPortalAccessLogRepository,
      useClass: PortalAccessLogRepository,
    },
  ],
})
export class PortalAccessLogModule {}
