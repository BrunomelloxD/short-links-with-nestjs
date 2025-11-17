import { Injectable } from "@nestjs/common";
import { LinkRepository } from "../repositories/link.repository";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";

@Injectable()
export class LinkService {
    constructor(private readonly linkRepository: LinkRepository) { }

    getLinks(paginationDto: PaginationDto): Promise<PaginatedResponseDto<LinkResponseDto>> {
        return this.linkRepository.findAll(paginationDto);
    }
}