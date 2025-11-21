import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateLinkDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @IsBoolean()
    @IsOptional()
    protected?: boolean;

    @IsString()
    @IsOptional()
    password?: string | null;
}