import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/services/prisma.service';
import { IPortalAccessLogRepository } from './portal-access-log.repository.interface';

@Injectable()
export class PortalAccessLogRepository implements IPortalAccessLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PortalAccessLogCreateInput): Promise<void> {
    await this.prisma.portalAccessLog.create({
      data,
    });
  }
}
