import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @IsString()
    @IsOptional()
    short_code?: string;

    @IsBoolean()
    @IsOptional()
    protected?: boolean;

    @IsString()
    @IsOptional()
    password?: string;
}