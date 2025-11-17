import { Controller, Get, Query } from "@nestjs/common";
import { LinkService } from "../services/link.service";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";


@Controller('links')
export class LinkController {
    constructor(private readonly linkService: LinkService) { }

    @Get()
    getLinks(@Query() queryParams: PaginationDto): Promise<PaginatedResponseDto<LinkResponseDto>> {
        return this.linkService.getLinks(queryParams);
    }
}