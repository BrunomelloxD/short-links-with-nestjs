import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/services/prisma.service';
import { IZipCodeLogRepository } from './zip-code-log.repository.interface';

@Injectable()
export class ZipCodeLogRepository implements IZipCodeLogRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: Prisma.ZipCodeLogCreateInput, consultedAt: Date): Promise<void> {
    await this.prisma.zipCodeLog.create({
      data: {
        ...data,
        consultedAt: consultedAt,
      },
    });
  }
}
