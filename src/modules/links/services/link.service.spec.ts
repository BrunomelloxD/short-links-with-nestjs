import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkRepository } from '../repositories/link.repository';
import { Links } from '@prisma/client';
import { CreateLinkDto } from '../dtos/create-link.dto';
import { UpdateLinkDto } from '../dtos/update-link.dto';

jest.mock('nanoid', () => ({
    nanoid: jest.fn(() => 'abc12345'),
}));

type CreateLinkTestDto = CreateLinkDto & {
    short_code?: string;
    password?: string;
};

type UpdateLinkTestDto = UpdateLinkDto & {
    password?: string | null;
};

describe('LinkService', () => {
    let service: LinkService;
    let linkRepository: jest.Mocked<LinkRepository>;

    const mockLinkRepository = {
        findAll: jest.fn(),
        create: jest.fn(),
        findOneByShortCode: jest.fn(),
        findOneById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockLink: Links = {
        id: 'link-123',
        url: 'https://example.com',
        short_code: 'abc12345',
        password: null,
        active: true,
        user_id: 'user-123',
        created_at: new Date('2024-01-01'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LinkService,
                {
                    provide: LinkRepository,
                    useValue: mockLinkRepository,
                },
            ],
        }).compile();

        service = module.get<LinkService>(LinkService);
        linkRepository = module.get(LinkRepository);

        jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getLinks', () => {
        it('should return paginated links', async () => {
            const paginationDto = { page: 1, limit: 10, search: '' };
            const mockResult = {
                data: [mockLink],
                meta: { total: 1, page: 1, last_page: 1 },
            };

            mockLinkRepository.findAll.mockResolvedValue(mockResult);

            const result = await service.getLinks(paginationDto, 'user-123');

            expect(linkRepository.findAll).toHaveBeenCalledWith(paginationDto, 'user-123');
            expect(result).toEqual(mockResult);
        });
    });

    describe('create', () => {
        it('should create a link without password', async () => {
            const createDto: CreateLinkTestDto = {
                url: 'https://example.com',
                protected: false,
            };

            const createdLink = {
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            };

            mockLinkRepository.create.mockResolvedValue(createdLink);

            const result = await service.create(createDto, 'user-123');

            expect(createDto.short_code).toBe('abc12345');
            expect(linkRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://example.com',
                    short_code: 'abc12345',
                }),
                'user-123'
            );
            expect(result).toEqual({
                ...createdLink,
                password: undefined,
            });
        });

        it('should create a protected link with generated password', async () => {
            const createDto: CreateLinkTestDto = {
                url: 'https://example.com',
                protected: true,
            };

            const createdLink = {
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            };

            mockLinkRepository.create.mockResolvedValue(createdLink);

            const result = await service.create(createDto, 'user-123');

            expect(createDto.password).toBeDefined();
            expect(createDto.password).toMatch(/^[a-z0-9]{8}$/);
            expect(linkRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://example.com',
                    short_code: 'abc12345',
                    password: expect.any(String),
                }),
                'user-123'
            );
            expect(result.password).toBe(createDto.password);
        });

        it('should generate unique short code', async () => {
            const createDto: CreateLinkTestDto = {
                url: 'https://example.com',
                protected: false,
            };

            mockLinkRepository.create.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            });

            await service.create(createDto, 'user-123');

            expect(createDto.short_code).toBe('abc12345');
        });
    });

    describe('findOneByShortCode', () => {
        it('should return link when it exists and is active', async () => {
            mockLinkRepository.findOneByShortCode.mockResolvedValue(mockLink);

            const result = await service.findOneByShortCode('abc12345');

            expect(linkRepository.findOneByShortCode).toHaveBeenCalledWith('abc12345');
            expect(result).toEqual({
                id: mockLink.id,
                url: mockLink.url,
                short_code: mockLink.short_code,
                active: mockLink.active,
                created_at: mockLink.created_at,
            });
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('user_id');
        });

        it('should throw NotFoundException when link does not exist', async () => {
            mockLinkRepository.findOneByShortCode.mockResolvedValue(null);

            await expect(service.findOneByShortCode('nonexistent')).rejects.toThrow(
                new NotFoundException('Link with short code nonexistent not found.')
            );

            expect(linkRepository.findOneByShortCode).toHaveBeenCalledWith('nonexistent');
        });

        it('should throw NotFoundException when link is inactive', async () => {
            const inactiveLink = { ...mockLink, active: false };
            mockLinkRepository.findOneByShortCode.mockResolvedValue(inactiveLink);

            await expect(service.findOneByShortCode('abc12345')).rejects.toThrow(
                new NotFoundException('Link with short code abc12345 not found.')
            );
        });

        it('should throw UnauthorizedException when link is password protected', async () => {
            const protectedLink = { ...mockLink, password: 'secret123' };
            mockLinkRepository.findOneByShortCode.mockResolvedValue(protectedLink);

            await expect(service.findOneByShortCode('abc12345')).rejects.toThrow(
                new UnauthorizedException('This link is protected with a password.')
            );
        });
    });

    describe('findOneByShortCodeProtected', () => {
        it('should return link when password is correct', async () => {
            const protectedLink = { ...mockLink, password: 'secret123' };
            mockLinkRepository.findOneByShortCode.mockResolvedValue(protectedLink);

            const result = await service.findOneByShortCodeProtected('abc12345', 'secret123');

            expect(linkRepository.findOneByShortCode).toHaveBeenCalledWith('abc12345');
            expect(result).toEqual({
                id: protectedLink.id,
                url: protectedLink.url,
                short_code: protectedLink.short_code,
                active: protectedLink.active,
                created_at: protectedLink.created_at,
            });
            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('user_id');
        });

        it('should return link when it has no password', async () => {
            mockLinkRepository.findOneByShortCode.mockResolvedValue(mockLink);

            const result = await service.findOneByShortCodeProtected('abc12345', 'anypassword');

            expect(result).toEqual(mockLink);
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            const protectedLink = { ...mockLink, password: 'secret123' };
            mockLinkRepository.findOneByShortCode.mockResolvedValue(protectedLink);

            await expect(
                service.findOneByShortCodeProtected('abc12345', 'wrongpassword')
            ).rejects.toThrow(
                new UnauthorizedException('Invalid password for this protected link.')
            );
        });

        it('should throw NotFoundException when link does not exist', async () => {
            mockLinkRepository.findOneByShortCode.mockResolvedValue(null);

            await expect(
                service.findOneByShortCodeProtected('nonexistent', 'password')
            ).rejects.toThrow(
                new NotFoundException('Link with short code nonexistent not found.')
            );
        });

        it('should throw NotFoundException when link is inactive', async () => {
            const inactiveLink = { ...mockLink, active: false };
            mockLinkRepository.findOneByShortCode.mockResolvedValue(inactiveLink);

            await expect(
                service.findOneByShortCodeProtected('abc12345', 'password')
            ).rejects.toThrow(
                new NotFoundException('Link with short code abc12345 not found.')
            );
        });
    });

    describe('update', () => {
        it('should update link when user is the owner', async () => {
            const updateDto: UpdateLinkTestDto = {
                url: 'https://updated.com',
                active: false,
                protected: false,
            };

            const updatedLink = {
                id: 'link-123',
                url: 'https://updated.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            };

            mockLinkRepository.findOneById.mockResolvedValue(mockLink);
            mockLinkRepository.update.mockResolvedValue(updatedLink);

            const result = await service.update('link-123', updateDto, 'user-123');

            expect(linkRepository.findOneById).toHaveBeenCalledWith('link-123');
            expect(updateDto.password).toBeNull();
            expect(linkRepository.update).toHaveBeenCalledWith('link-123', updateDto);
            expect(result).toEqual(updatedLink);
        });

        it('should generate password when enabling protection on unprotected link', async () => {
            const updateDto: UpdateLinkTestDto = {
                url: 'https://example.com',
                protected: true,
            };

            mockLinkRepository.findOneById.mockResolvedValue(mockLink);
            mockLinkRepository.update.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            });

            await service.update('link-123', updateDto, 'user-123');

            expect(updateDto.password).toBeDefined();
            expect(updateDto.password).toMatch(/^[a-z0-9]{8}$/);
        });

        it('should not generate new password when link already has password', async () => {
            const linkWithPassword = { ...mockLink, password: 'existing123' };
            const updateDto: UpdateLinkTestDto = {
                url: 'https://example.com',
                protected: true,
            };

            mockLinkRepository.findOneById.mockResolvedValue(linkWithPassword);
            mockLinkRepository.update.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            });

            await service.update('link-123', updateDto, 'user-123');

            expect(updateDto.password).toBeUndefined();
        });

        it('should remove password when disabling protection', async () => {
            const linkWithPassword = { ...mockLink, password: 'existing123' };
            const updateDto: UpdateLinkTestDto = {
                url: 'https://example.com',
                protected: false,
            };

            mockLinkRepository.findOneById.mockResolvedValue(linkWithPassword);
            mockLinkRepository.update.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            });

            await service.update('link-123', updateDto, 'user-123');

            expect(updateDto.password).toBeNull();
        });

        it('should throw NotFoundException when link does not exist', async () => {
            mockLinkRepository.findOneById.mockResolvedValue(null);

            await expect(
                service.update('nonexistent', { url: 'https://example.com' }, 'user-123')
            ).rejects.toThrow(
                new NotFoundException('Link with ID nonexistent not found.')
            );

            expect(linkRepository.update).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException when user is not the owner', async () => {
            mockLinkRepository.findOneById.mockResolvedValue(mockLink);

            await expect(
                service.update('link-123', { url: 'https://example.com' }, 'other-user')
            ).rejects.toThrow(
                new ForbiddenException('You do not have permission to update this link.')
            );

            expect(linkRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete link when user is the owner', async () => {
            mockLinkRepository.findOneById.mockResolvedValue(mockLink);
            mockLinkRepository.delete.mockResolvedValue(undefined);

            await service.delete('link-123', 'user-123');

            expect(linkRepository.findOneById).toHaveBeenCalledWith('link-123');
            expect(linkRepository.delete).toHaveBeenCalledWith('link-123');
        });

        it('should throw NotFoundException when link does not exist', async () => {
            mockLinkRepository.findOneById.mockResolvedValue(null);

            await expect(service.delete('nonexistent', 'user-123')).rejects.toThrow(
                new NotFoundException('Link with ID nonexistent not found.')
            );

            expect(linkRepository.delete).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException when user is not the owner', async () => {
            mockLinkRepository.findOneById.mockResolvedValue(mockLink);

            await expect(service.delete('link-123', 'other-user')).rejects.toThrow(
                new ForbiddenException('You do not have permission to delete this link.')
            );

            expect(linkRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('edge cases and error scenarios', () => {
        it('should handle repository errors gracefully', async () => {
            const repositoryError = new Error('Database connection failed');
            mockLinkRepository.findAll.mockRejectedValue(repositoryError);

            await expect(
                service.getLinks({ page: 1, limit: 10, search: '' }, 'user-123')
            ).rejects.toThrow(repositoryError);
        });

        it('should handle empty search results', async () => {
            const emptyResult = {
                data: [],
                meta: { total: 0, page: 1, last_page: 0 },
            };
            mockLinkRepository.findAll.mockResolvedValue(emptyResult);

            const result = await service.getLinks({ page: 1, limit: 10, search: '' }, 'user-123');

            expect(result).toEqual(emptyResult);
        });
    });
});
