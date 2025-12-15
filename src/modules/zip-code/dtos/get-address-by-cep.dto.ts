import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class GetAddressByCepDto {
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString({ message: 'CEP deve ser uma string' })
  @Transform(({ value }) => {
    const cleanCep = value.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new BadRequestException('CEP inválido');
    }
    
    return cleanCep;
  })
  @Matches(/^\d{8}$/, { message: 'CEP deve conter exatamente 8 dígitos' })
  cep: string;
}
