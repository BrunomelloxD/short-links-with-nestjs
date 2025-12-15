import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ZipCodeController } from './controllers/zip-code.controller';
import { ZipCodeService } from './services/zip-code.service';
import { PrismaService } from '../../common/prisma/services/prisma.service';
import { ZipCodeLogRepository } from './repositories/zip-code-log.repository';
import { IZipCodeLogRepository } from './repositories/zip-code-log.repository.interface';

@Module({
  imports: [HttpModule],
  controllers: [ZipCodeController],
  providers: [
    ZipCodeService,
    PrismaService,
    {
      provide: IZipCodeLogRepository,
      useClass: ZipCodeLogRepository,
    },
  ],
})
export class ZipCodeModule {}
