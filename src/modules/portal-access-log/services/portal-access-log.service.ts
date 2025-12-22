import { Injectable } from '@nestjs/common';
import { IPortalAccessLogRepository } from '../repositories/portal-access-log.repository.interface';

@Injectable()
export class PortalAccessLogService {
  constructor(
    private readonly portalAccessLogRepository: IPortalAccessLogRepository,
  ) {}

  async logAccess(ipAddress?: string, userAgent?: string): Promise<void> {
    const acessIn = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
    );

    await this.portalAccessLogRepository.create({
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      acessIn,
    });
  }
}
