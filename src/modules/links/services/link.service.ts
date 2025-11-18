import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LinkRepository } from "../repositories/link.repository";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { CreateLinkDto } from "../dtos/create-link.dto";
import { nanoid } from 'nanoid';

@Injectable()
export class LinkService {
    constructor(private readonly linkRepository: LinkRepository) { }

    async findOneByShortCodeProtected(shortCode: string, password: string): Promise<LinkResponseDto> {
        const link = await this.linkRepository.findOneByShortCode(shortCode);

        if (!link) {
            throw new NotFoundException(`Link with short code ${shortCode} not found.`);
        }

        if (!link?.password) {
            return link;
        }

        const isPasswordValid = link.password === password;

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password for this protected link.');
        }

        const { password: _, user_id, ...response } = link;

        return response;
    }

    getLinks(paginationDto: PaginationDto, userId: string): Promise<PaginatedResponseDto<LinkResponseDto>> {
        return this.linkRepository.findAll(paginationDto, userId);
    }

    async create(data: CreateLinkDto, userId: string): Promise<LinkResponseDto> {
        data.short_code = await this.generateShortCode();

        if (data.protected) {
            data.password = await this.generatePassword();
        }

        return await this.linkRepository.create(data, userId);
    }

    async findOneByShortCode(shortCode: string): Promise<LinkResponseDto> {
        const link = await this.linkRepository.findOneByShortCode(shortCode);

        if (!link) {
            throw new NotFoundException(`Link with short code ${shortCode} not found.`);
        }

        if (link?.password) {
            throw new UnauthorizedException('This link is protected with a password.');
        }

        const { password, user_id, ...response } = link;

        return response;
    }

    private async generatePassword(): Promise<string> {
        return Math.random().toString(36).slice(-8);
    }

    private async generateShortCode(): Promise<string> {
        return nanoid(8);
    }
}