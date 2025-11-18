import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetLinkProtectedDto {
    @ApiProperty({
        description: 'Password to access the protected link',
        example: '3o1tqdnl'
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}