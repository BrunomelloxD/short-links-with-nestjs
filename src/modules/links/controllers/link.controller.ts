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
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";

@ApiTags('Links')
@Controller('links')
export class LinkController {
    constructor(private readonly linkService: LinkService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all user links',
        description: 'Retrieve a paginated list of links owned by the authenticated user'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10)',
        example: 10
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term to filter links by URL or short code',
        example: 'example'
    })
    @ApiOkResponse({
        description: 'Links retrieved successfully',
        type: PaginatedResponseDto<LinkResponseDto>
    })
    @ApiBadRequestResponse({
        description: 'Invalid query parameters'
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated'
    })
    getLinks(@Query() queryParams: PaginationDto, @GetUserId() userId: string): Promise<PaginatedResponseDto<LinkResponseDto>> {
        return this.linkService.getLinks(queryParams, userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new short link',
        description: 'Create a new shortened link. If protected is true, a password will be generated and returned'
    })
    @ApiBody({
        type: CreateLinkDto,
        description: 'Link creation data',
        examples: {
            unprotected: {
                summary: 'Unprotected link',
                description: 'Create a public link without password protection',
                value: {
                    url: 'https://example.com',
                    protected: false
                }
            },
            protected: {
                summary: 'Protected link',
                description: 'Create a password-protected link. A random password will be generated',
                value: {
                    url: 'https://example.com',
                    protected: true
                }
            }
        }
    })
    @ApiCreatedResponse({
        description: 'Link created successfully. If protected, the response includes the generated password',
        type: LinkResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or URL format'
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated'
    })
    @ApiConflictResponse({
        description: 'Short code already exists (rare collision)'
    })
    create(@Body() data: CreateLinkDto, @GetUserId() userId: string): Promise<LinkResponseDto> {
        return this.linkService.create(data, userId);
    }

    @Public()
    @Get(':short_code')
    @ApiOperation({
        summary: 'Get link by short code',
        description: 'Retrieve the original URL by its short code. Public endpoint - no authentication required'
    })
    @ApiParam({
        name: 'short_code',
        type: 'string',
        description: 'Short code of the link',
        example: 'abc12345'
    })
    @ApiOkResponse({
        description: 'Link retrieved successfully',
        type: LinkResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Link not found or inactive'
    })
    @ApiUnauthorizedResponse({
        description: 'Link is password protected. Use the protected endpoint instead'
    })
    findOneByShortCode(@Param('short_code') shortCode: string): Promise<LinkResponseDto> {
        return this.linkService.findOneByShortCode(shortCode);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post(':short_code/protected')
    @ApiOperation({
        summary: 'Access password-protected link',
        description: 'Retrieve a password-protected link by providing the correct password'
    })
    @ApiParam({
        name: 'short_code',
        type: 'string',
        description: 'Short code of the protected link',
        example: 'abc12345'
    })
    @ApiBody({
        type: GetLinkProtectedDto,
        description: 'Password to access the protected link',
        examples: {
            example1: {
                summary: 'Access protected link',
                description: 'Provide the password to access the protected link',
                value: {
                    password: 'abc12345'
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'Link retrieved successfully with correct password',
        type: LinkResponseDto
    })
    @ApiNotFoundResponse({
        description: 'Link not found or inactive'
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid password for this protected link'
    })
    @ApiBadRequestResponse({
        description: 'Password is required'
    })
    findOneByShortCodeProtected(@Param('short_code') shortCode: string, @Body() data: GetLinkProtectedDto): Promise<LinkResponseDto> {
        return this.linkService.findOneByShortCodeProtected(shortCode, data.password);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update a link',
        description: 'Update link details. Only the link owner can update it'
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Link ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiBody({
        type: UpdateLinkDto,
        description: 'Link update data',
        examples: {
            updateUrl: {
                summary: 'Update URL',
                description: 'Change the destination URL',
                value: {
                    url: 'https://updated-example.com'
                }
            },
            toggleActive: {
                summary: 'Toggle active status',
                description: 'Activate or deactivate the link',
                value: {
                    active: false
                }
            },
            addProtection: {
                summary: 'Add password protection',
                description: 'Enable password protection. A new password will be generated if link has none',
                value: {
                    url: 'https://example.com',
                    protected: true
                }
            },
            removeProtection: {
                summary: 'Remove password protection',
                description: 'Disable password protection and remove the password',
                value: {
                    url: 'https://example.com',
                    protected: false
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'Link updated successfully',
        type: LinkResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Invalid input data or link ID format'
    })
    @ApiNotFoundResponse({
        description: 'Link not found'
    })
    @ApiForbiddenResponse({
        description: 'You do not have permission to update this link'
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated'
    })
    updateLink(@Param('id') id: string, @Body() data: UpdateLinkDto, @GetUserId() userId: string): Promise<LinkResponseDto> {
        return this.linkService.update(id, data, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete a link',
        description: 'Permanently delete a link. Only the link owner can delete it'
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        description: 'Link ID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @ApiNoContentResponse({
        description: 'Link deleted successfully'
    })
    @ApiBadRequestResponse({
        description: 'Invalid link ID format'
    })
    @ApiNotFoundResponse({
        description: 'Link not found'
    })
    @ApiForbiddenResponse({
        description: 'You do not have permission to delete this link'
    })
    @ApiUnauthorizedResponse({
        description: 'User not authenticated'
    })
    deleteLink(@Param('id') id: string, @GetUserId() userId: string): Promise<void> {
        return this.linkService.delete(id, userId);
    }
}