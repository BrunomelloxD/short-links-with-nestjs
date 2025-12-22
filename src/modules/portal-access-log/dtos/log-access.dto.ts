import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class LogAccessDto {
  @ApiProperty({
    description: 'Endereço IP do cliente',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiProperty({
    description: 'User-Agent do navegador do cliente',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;
}
