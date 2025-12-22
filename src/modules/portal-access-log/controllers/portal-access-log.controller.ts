import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PortalAccessLogService } from '../services/portal-access-log.service';
import { Public } from 'src/common/decorators/public.decorator';
import { LogAccessDto } from '../dtos/log-access.dto';

@ApiTags('Portal Access Log')
@Controller('api/v1/portal-access-log')
export class PortalAccessLogController {
  constructor(private readonly portalAccessLogService: PortalAccessLogService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registra acesso ao portal',
    description:
      'Registra o acesso ao portal com IP, User-Agent e data/hora do acesso.',
  })
  @ApiResponse({
    status: 204,
    description: 'Acesso registrado com sucesso',
  })
  async logAccess(
    @Query() logAccessDto: LogAccessDto,
  ): Promise<void> {
    await this.portalAccessLogService.logAccess(
      logAccessDto.ipAddress,
      logAccessDto.userAgent,
    );
  }
}
