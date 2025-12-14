import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ExportFormat } from '../constants/export-format.constant';

export class PaginationDto {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        minimum: 1,
        default: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        default: 10,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({
        description: 'Search query',
        example: 'John Doe',
        required: false
    })
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Response format',
        example: 'pdf',
        enum: ExportFormat,
        required: false
    })
    @IsOptional()
    @IsEnum(ExportFormat, { message: `format must be one of the following values: ${Object.values(ExportFormat).join(', ')}` })
    format?: string;
}