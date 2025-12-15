import { Controller, Get, Ip, Param, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ZipCodeService } from '../services/zip-code.service';
import { GetAddressByCepDto } from '../dtos/get-address-by-cep.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('CEP')
@Controller('api/v1/cep')
export class ZipCodeController {
  constructor(private readonly zipCodeService: ZipCodeService) {}

  @Public()
  @Get(':cep')
  @ApiOperation({
    summary: 'Consulta endereço por CEP',
    description:
      'Busca informações de endereço através do CEP fornecido. Aceita CEP com ou sem formatação (ex: 01310-100 ou 01310100). Registra automaticamente a consulta em log com IP, User-Agent, cidade e estado.',
  })
  @ApiParam({
    name: 'cep',
    description: 'CEP a ser consultado (8 dígitos numéricos)',
    example: '01310100',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'CEP encontrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        cep: { type: 'string', example: '01310-100' },
        logradouro: { type: 'string', example: 'Avenida Paulista' },
        complemento: { type: 'string', example: 'de 612 a 1510 - lado par' },
        bairro: { type: 'string', example: 'Bela Vista' },
        localidade: { type: 'string', example: 'São Paulo' },
        uf: { type: 'string', example: 'SP' },
        ibge: { type: 'string', example: '3550308' },
        gia: { type: 'string', example: '1004' },
        ddd: { type: 'string', example: '11' },
        siafi: { type: 'string', example: '7107' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'CEP inválido (deve conter exatamente 8 dígitos)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'CEP inválido' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'CEP não encontrado ou erro ao consultar',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example: 'CEP não encontrado',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  async getAddressByCep(
    @Param() params: GetAddressByCepDto,
    @Req() request: Request,
    @Ip() ipAddress: string,
  ) {
    return this.zipCodeService.getAddressByCep(params.cep, request, ipAddress);
  }
}
