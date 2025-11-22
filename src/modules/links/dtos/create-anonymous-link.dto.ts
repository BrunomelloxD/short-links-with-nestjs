import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateAnonymousLinkDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    url: string;
}