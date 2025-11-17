import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma/services/prisma.service";
import { LinkRepositoryInterface } from "./link.repository.interface";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";


@Injectable()
export class LinkRepository implements LinkRepositoryInterface {
    constructor(private readonly prismaService: PrismaService) { }

    async findAll({ page = 1, limit = 10, search }: PaginationDto): Promise<PaginatedResponseDto<LinkResponseDto>> {

        const [links, total] = await this.prismaService.$transaction([
            this.prismaService.links.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: { url: { contains: search, mode: 'insensitive' } },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prismaService.links.count({
                where: { url: { contains: search, mode: 'insensitive' } }
            })
        ]);

        return {
            data: links,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            },
        };
    }
}