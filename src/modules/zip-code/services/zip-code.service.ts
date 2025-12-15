import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { IZipCodeLogRepository } from '../repositories/zip-code-log.repository.interface';
import { externalApis } from '../../../common/config/env.config';

@Injectable()
export class ZipCodeService {
  private consultedAt: Date;

  constructor(
    private readonly httpService: HttpService,
    private readonly zipCodeLogRepository: IZipCodeLogRepository,
  ) { }

  async getAddressByCep(cep: string, request: Request, ipAddress: string): Promise<any> {
    const userAgent = this.extractUserAgent(request);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${externalApis.viaCepUrl}/ws/${cep}/json/`),
      );

      const consultedAt = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
      );

      if (response.data.erro) {
        await this.zipCodeLogRepository.create({
          zipCode: cep,
          ipAddress,
          userAgent,
          success: false,
        }, consultedAt);
        throw new NotFoundException('CEP não encontrado');
      }

      await this.zipCodeLogRepository.create({
        zipCode: cep,
        ipAddress,
        userAgent,
        city: response.data.localidade,
        state: response.data.uf,
        success: true,
      }, consultedAt);

      return response.data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const consultedAt = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
      );

      await this.zipCodeLogRepository.create({
        zipCode: cep,
        ipAddress,
        userAgent,
        success: false,
      }, consultedAt);
      throw new NotFoundException('Erro ao consultar CEP');
    }
  }

  private extractUserAgent(request: Request): string {
    return request.headers['user-agent'] || 'unknown';
  }
}
