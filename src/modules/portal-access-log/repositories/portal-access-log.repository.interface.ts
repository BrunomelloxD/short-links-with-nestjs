import { Prisma } from '@prisma/client';

export abstract class IPortalAccessLogRepository {
  abstract create(data: Prisma.PortalAccessLogCreateInput): Promise<void>;
}
