import { Prisma } from '@prisma/client';

export abstract class IZipCodeLogRepository {
  abstract create(data: Prisma.ZipCodeLogCreateInput, consultedAt: Date): Promise<void>;
}
