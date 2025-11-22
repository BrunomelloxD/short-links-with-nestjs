import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/common/prisma/services/prisma.service";
import { LinkRepositoryInterface } from "./link.repository.interface";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CreateLinkDto } from "../dtos/create-link.dto";
import { Links } from "@prisma/client";
import { UpdateLinkDto } from "../dtos/update-link.dto";


@Injectable()
export class LinkRepository implements LinkRepositoryInterface {
    constructor(private readonly prismaService: PrismaService) { }

    async findExpiredAnonymousLinks(cutoffDate: Date): Promise<Links[]> {
        return this.prismaService.links.findMany({
            where: {
                user_id: null,
                created_at: { lt: cutoffDate }
            }
        });
    }

    async deleteMany(ids: string[]): Promise<void> {
        await this.prismaService.links.deleteMany({
            where: { id: { in: ids } }
        });
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.links.delete({
            where: { id }
        });
    }

    async update(id: string, data: Partial<UpdateLinkDto>): Promise<LinkResponseDto> {
        const updatedLink = await this.prismaService.links.update({
            where: { id },
            data: {
                url: data.url,
                active: data.active,
                password: data.password
            },
            select: {
                id: true,
                url: true,
                short_code: true,
                created_at: true
            }
        });

        return updatedLink;
    }

    async findOneById(id: string): Promise<Links | null> {
        return this.prismaService.links.findUnique({
            where: { id }
        });
    }

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
                    created_at: true,
                    active: true
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

    async create(data: CreateLinkDto, userId: string | null): Promise<LinkResponseDto> {
        const newLink = await this.prismaService.links.create({
            data: {
                url: data.url,
                short_code: data.short_code!,
                password: data.password,
                user_id: userId || null,
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