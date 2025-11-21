import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { LinkService } from "../services/link.service";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { CreateLinkDto } from "../dtos/create-link.dto";
import { GetUserId } from "src/common/decorators/get-user-id.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { GetLinkProtectedDto } from "../dtos/get-link-protected.dto";
import { UpdateLinkDto } from "../dtos/update-link.dto";


@Controller('links')
export class LinkController {
    constructor(private readonly linkService: LinkService) { }

    @Get()
    getLinks(@Query() queryParams: PaginationDto, @GetUserId() userId: string): Promise<PaginatedResponseDto<LinkResponseDto>> {
        return this.linkService.getLinks(queryParams, userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() data: CreateLinkDto, @GetUserId() userId: string): Promise<LinkResponseDto> {
        return this.linkService.create(data, userId);
    }

    @Public()
    @Get(':short_code')
    findOneByShortCode(@Param('short_code') shortCode: string): Promise<LinkResponseDto> {
        return this.linkService.findOneByShortCode(shortCode);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post(':short_code/protected')
    findOneByShortCodeProtected(@Param('short_code') shortCode: string, @Body() data: GetLinkProtectedDto): Promise<LinkResponseDto> {
        return this.linkService.findOneByShortCodeProtected(shortCode, data.password);
    }

    @Put(':id')
    updateLink(@Param('id') id: string, @Body() data: UpdateLinkDto, @GetUserId() userId: string): Promise<LinkResponseDto> {
        return this.linkService.update(id, data, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteLink(@Param('id') id: string, @GetUserId() userId: string): Promise<void> {
        return this.linkService.delete(id, userId);
    }
}