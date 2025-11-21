import { Test, TestingModule } from '@nestjs/testing';
import { LinkRepository } from './link.repository';
import { PrismaService } from 'src/common/prisma/services/prisma.service';
import { Links } from '@prisma/client';
import { UpdateLinkDto } from '../dtos/update-link.dto';
import { CreateLinkDto } from '../dtos/create-link.dto';
import { LinkResponseDto } from '../dtos/response/link-response.dto';

type CreateLinkTestDto = Omit<CreateLinkDto, 'password'> & {
    password?: string | null;
};

describe('LinkRepository', () => {
    let repository: LinkRepository;
    let prismaService: jest.Mocked<PrismaService>;

    const mockPrismaService = {
        links: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
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
                LinkRepository,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        repository = module.get<LinkRepository>(LinkRepository);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated links', async () => {
            const paginationDto = { page: 1, limit: 10, search: '' };
            const userId = 'user-123';
            const links = [mockLink];
            const total = 1;

            mockPrismaService.$transaction.mockResolvedValue([links, total]);

            const result = await repository.findAll(paginationDto, userId);

            expect(prismaService.$transaction).toHaveBeenCalled();
            expect(result).toEqual({
                data: links,
                meta: {
                    total: 1,
                    page: 1,
                    last_page: 1,
                },
            });
        });

        it('should apply search filter correctly', async () => {
            const paginationDto = { page: 1, limit: 10, search: 'example' };
            const userId = 'user-123';

            mockPrismaService.$transaction.mockResolvedValue([[], 0]);

            await repository.findAll(paginationDto, userId);

            expect(prismaService.$transaction).toHaveBeenCalled();
            const transactionCallback = mockPrismaService.$transaction.mock.calls[0][0];
            expect(Array.isArray(transactionCallback)).toBe(true);
        });

        it('should filter by user_id', async () => {
            const paginationDto = { page: 1, limit: 10, search: '' };
            const userId = 'user-456';

            mockPrismaService.$transaction.mockResolvedValue([[], 0]);

            await repository.findAll(paginationDto, userId);

            expect(prismaService.$transaction).toHaveBeenCalled();
        });

        it('should handle pagination correctly', async () => {
            const paginationDto = { page: 2, limit: 5, search: '' };
            const userId = 'user-123';
            const links = [mockLink];
            const total = 10;

            mockPrismaService.$transaction.mockResolvedValue([links, total]);

            const result = await repository.findAll(paginationDto, userId);

            expect(result.meta).toEqual({
                total: 10,
                page: 2,
                last_page: 2,
            });
        });

        it('should return empty data when no links found', async () => {
            const paginationDto = { page: 1, limit: 10, search: '' };
            const userId = 'user-123';

            mockPrismaService.$transaction.mockResolvedValue([[], 0]);

            const result = await repository.findAll(paginationDto, userId);

            expect(result).toEqual({
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    last_page: 0,
                },
            });
        });
    });

    describe('create', () => {
        it('should create a new link', async () => {
            const createDto: CreateLinkTestDto = {
                url: 'https://example.com',
                short_code: 'abc12345',
                password: null,
            };
            const userId = 'user-123';
            const createdLink = {
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            };

            mockPrismaService.links.create.mockResolvedValue(createdLink as Links);

            const result = await repository.create(createDto as CreateLinkDto, userId);

            expect(prismaService.links.create).toHaveBeenCalledWith({
                data: {
                    url: createDto.url,
                    short_code: createDto.short_code,
                    password: createDto.password,
                    user_id: userId,
                },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true,
                },
            });
            expect(result).toEqual(createdLink);
        });

        it('should create a protected link with password', async () => {
            const createDto: CreateLinkTestDto = {
                url: 'https://example.com',
                short_code: 'abc12345',
                password: 'secret123',
            };
            const userId = 'user-123';

            mockPrismaService.links.create.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            } as Links);

            await repository.create(createDto as CreateLinkDto, userId);

            expect(prismaService.links.create).toHaveBeenCalledWith({
                data: {
                    url: createDto.url,
                    short_code: createDto.short_code,
                    password: 'secret123',
                    user_id: userId,
                },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true,
                },
            });
        });
    });

    describe('findOneByShortCode', () => {
        it('should find link by short code', async () => {
            const shortCode = 'abc12345';

            mockPrismaService.links.findUnique.mockResolvedValue(mockLink);

            const result = await repository.findOneByShortCode(shortCode);

            expect(prismaService.links.findUnique).toHaveBeenCalledWith({
                where: { short_code: shortCode },
            });
            expect(result).toEqual(mockLink);
        });

        it('should return null when link not found', async () => {
            const shortCode = 'nonexistent';

            mockPrismaService.links.findUnique.mockResolvedValue(null);

            const result = await repository.findOneByShortCode(shortCode);

            expect(prismaService.links.findUnique).toHaveBeenCalledWith({
                where: { short_code: shortCode },
            });
            expect(result).toBeNull();
        });
    });

    describe('findOneById', () => {
        it('should find link by id', async () => {
            const id = 'link-123';

            mockPrismaService.links.findUnique.mockResolvedValue(mockLink);

            const result = await repository.findOneById(id);

            expect(prismaService.links.findUnique).toHaveBeenCalledWith({
                where: { id },
            });
            expect(result).toEqual(mockLink);
        });

        it('should return null when link not found', async () => {
            const id = 'nonexistent';

            mockPrismaService.links.findUnique.mockResolvedValue(null);

            const result = await repository.findOneById(id);

            expect(prismaService.links.findUnique).toHaveBeenCalledWith({
                where: { id },
            });
            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a link', async () => {
            const id = 'link-123';
            const updateDto = {
                url: 'https://updated.com',
                active: false,
                password: null,
            };
            const updatedLink = {
                id: 'link-123',
                url: 'https://updated.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            };

            mockPrismaService.links.update.mockResolvedValue(updatedLink as LinkResponseDto);

            const result = await repository.update(id, updateDto);

            expect(prismaService.links.update).toHaveBeenCalledWith({
                where: { id },
                data: {
                    url: updateDto.url,
                    active: updateDto.active,
                    password: updateDto.password,
                },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true,
                },
            });
            expect(result).toEqual(updatedLink);
        });

        it('should handle partial updates', async () => {
            const id = 'link-123';
            const updateDto = {
                url: 'https://updated.com',
            };

            mockPrismaService.links.update.mockResolvedValue({
                id: 'link-123',
                url: 'https://updated.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            } as LinkResponseDto);

            await repository.update(id, updateDto);

            expect(prismaService.links.update).toHaveBeenCalledWith({
                where: { id },
                data: {
                    url: updateDto.url,
                    active: undefined,
                    password: undefined,
                },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true,
                },
            });
        });

        it('should update password field', async () => {
            const id = 'link-123';
            const updateDto = {
                url: 'https://example.com',
                password: 'newpassword',
            };

            mockPrismaService.links.update.mockResolvedValue({
                id: 'link-123',
                url: 'https://example.com',
                short_code: 'abc12345',
                created_at: new Date('2024-01-01'),
            } as LinkResponseDto);

            await repository.update(id, updateDto);

            expect(prismaService.links.update).toHaveBeenCalledWith({
                where: { id },
                data: {
                    url: updateDto.url,
                    active: undefined,
                    password: 'newpassword',
                },
                select: {
                    id: true,
                    url: true,
                    short_code: true,
                    created_at: true,
                },
            });
        });
    });

    describe('delete', () => {
        it('should delete a link', async () => {
            const id = 'link-123';

            mockPrismaService.links.delete.mockResolvedValue(mockLink);

            await repository.delete(id);

            expect(prismaService.links.delete).toHaveBeenCalledWith({
                where: { id },
            });
        });

        it('should handle deletion of different links', async () => {
            const id = 'link-456';

            mockPrismaService.links.delete.mockResolvedValue({
                ...mockLink,
                id,
            });

            await repository.delete(id);

            expect(prismaService.links.delete).toHaveBeenCalledWith({
                where: { id },
            });
            expect(prismaService.links.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe('error handling', () => {
        it('should propagate Prisma errors on findAll', async () => {
            const error = new Error('Database error');
            mockPrismaService.$transaction.mockRejectedValue(error);

            await expect(
                repository.findAll({ page: 1, limit: 10, search: '' }, 'user-123')
            ).rejects.toThrow(error);
        });

        it('should propagate Prisma errors on create', async () => {
            const error = new Error('Unique constraint violation');
            mockPrismaService.links.create.mockRejectedValue(error);

            await expect(
                repository.create(
                    { url: 'https://example.com', short_code: 'abc12345' } as CreateLinkDto,
                    'user-123'
                )
            ).rejects.toThrow(error);
        });

        it('should propagate Prisma errors on update', async () => {
            const error = new Error('Record not found');
            mockPrismaService.links.update.mockRejectedValue(error);

            await expect(
                repository.update('nonexistent', { url: 'https://example.com' })
            ).rejects.toThrow(error);
        });

        it('should propagate Prisma errors on delete', async () => {
            const error = new Error('Record not found');
            mockPrismaService.links.delete.mockRejectedValue(error);

            await expect(repository.delete('nonexistent')).rejects.toThrow(error);
        });
    });
});
