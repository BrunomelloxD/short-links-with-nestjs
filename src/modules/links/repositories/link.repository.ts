import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma/services/prisma.service";
import { LinkRepositoryInterface } from "./link.repository.interface";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CreateLinkDto } from "../dtos/create-link.dto";
import { Links } from "@prisma/client";


@Injectable()
export class LinkRepository implements LinkRepositoryInterface {
    constructor(private readonly prismaService: PrismaService) { }

    async findOneByShortCode(shortCode: string): Promise<Links | null> {
        return this.prismaService.links.findUnique({
            where: { short_code: shortCode }
        });
    }

    async findAll({ page = 1, limit = 10, search }: PaginationDto, userId: string): Promise<PaginatedResponseDto<LinkResponseDto>> {
        const [links, total] = await this.prismaService.$transaction([
            this.prismaService.links.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: { url: { contains: search, mode: 'insensitive' }, user_id: userId },
                select: {
                    id: true,
                    url: true,
                    password: true,
                    short_code: true,
                    created_at: true
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prismaService.links.count({
                where: { url: { contains: search, mode: 'insensitive' }, user_id: userId }
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

    async create(data: CreateLinkDto, userId: string): Promise<LinkResponseDto> {
        const newLink = await this.prismaService.links.create({
            data: {
                url: data.url,
                short_code: data.short_code!,
                password: data.password,
                user_id: userId,
            },
            select: {
                id: true,
                url: true,
                short_code: true,
                created_at: true
            }
        });

        return newLink;
    }
}