import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { CreateLinkDto } from "../dtos/create-link.dto";
import { Links } from '@prisma/client';

export abstract class LinkRepositoryInterface {
    abstract findAll({ page, limit, search }: PaginationDto, userId: string): Promise<PaginatedResponseDto<LinkResponseDto>>;
    abstract create(data: CreateLinkDto, userId: string): Promise<LinkResponseDto>;
    abstract findOneByShortCode(shortCode: string): Promise<Links | null>;
}