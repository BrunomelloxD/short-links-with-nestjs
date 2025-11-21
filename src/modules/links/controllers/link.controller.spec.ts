import { Test, TestingModule } from '@nestjs/testing';
import { LinkController } from './link.controller';
import { LinkService } from '../services/link.service';

jest.mock('nanoid', () => ({
    nanoid: jest.fn(() => 'abc12345'),
}));

describe('LinkController', () => {
    let controller: LinkController;
    let linkService: jest.Mocked<LinkService>;

    const mockLinkService = {
        getLinks: jest.fn(),
        create: jest.fn(),
        findOneByShortCode: jest.fn(),
        findOneByShortCodeProtected: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    const mockLinkResponse = {
        id: 'link-123',
        url: 'https://example.com',
        short_code: 'abc12345',
        created_at: new Date('2024-01-01'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LinkController],
            providers: [
                {
                    provide: LinkService,
                    useValue: mockLinkService,
                },
            ],
        }).compile();

        controller = module.get<LinkController>(LinkController);
        linkService = module.get(LinkService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getLinks', () => {
        it('should return paginated links', async () => {
            const paginationDto = { page: 1, limit: 10, search: '' };
            const userId = 'user-123';
            const mockResult = {
                data: [mockLinkResponse],
                meta: { total: 1, page: 1, last_page: 1 },
            };

            mockLinkService.getLinks.mockResolvedValue(mockResult);

            const result = await controller.getLinks(paginationDto, userId);

            expect(linkService.getLinks).toHaveBeenCalledWith(paginationDto, userId);
            expect(result).toEqual(mockResult);
        });

        it('should pass correct parameters to service', async () => {
            const paginationDto = { page: 2, limit: 20, search: 'test' };
            const userId = 'user-456';

            mockLinkService.getLinks.mockResolvedValue({
                data: [],
                meta: { total: 0, page: 2, last_page: 0 },
            });

            await controller.getLinks(paginationDto, userId);

            expect(linkService.getLinks).toHaveBeenCalledWith(paginationDto, userId);
            expect(linkService.getLinks).toHaveBeenCalledTimes(1);
        });
    });

    describe('create', () => {
        it('should create a new link', async () => {
            const createDto = {
                url: 'https://example.com',
                protected: false,
            };
            const userId = 'user-123';

            mockLinkService.create.mockResolvedValue(mockLinkResponse);

            const result = await controller.create(createDto, userId);

            expect(linkService.create).toHaveBeenCalledWith(createDto, userId);
            expect(result).toEqual(mockLinkResponse);
        });

        it('should create a protected link with password', async () => {
            const createDto = {
                url: 'https://example.com',
                protected: true,
            };
            const userId = 'user-123';
            const responseWithPassword = {
                ...mockLinkResponse,
                password: 'abc12345',
            };

            mockLinkService.create.mockResolvedValue(responseWithPassword);

            const result = await controller.create(createDto, userId);

            expect(linkService.create).toHaveBeenCalledWith(createDto, userId);
            expect(result).toEqual(responseWithPassword);
            expect(result.password).toBeDefined();
        });
    });

    describe('findOneByShortCode', () => {
        it('should return link by short code', async () => {
            const shortCode = 'abc12345';

            mockLinkService.findOneByShortCode.mockResolvedValue(mockLinkResponse);

            const result = await controller.findOneByShortCode(shortCode);

            expect(linkService.findOneByShortCode).toHaveBeenCalledWith(shortCode);
            expect(result).toEqual(mockLinkResponse);
        });

        it('should handle different short codes', async () => {
            const shortCode = 'xyz98765';
            const differentLink = {
                ...mockLinkResponse,
                short_code: shortCode,
            };

            mockLinkService.findOneByShortCode.mockResolvedValue(differentLink);

            const result = await controller.findOneByShortCode(shortCode);

            expect(linkService.findOneByShortCode).toHaveBeenCalledWith(shortCode);
            expect(result.short_code).toBe(shortCode);
        });
    });

    describe('findOneByShortCodeProtected', () => {
        it('should return protected link with correct password', async () => {
            const shortCode = 'abc12345';
            const passwordDto = { password: 'secret123' };

            mockLinkService.findOneByShortCodeProtected.mockResolvedValue(mockLinkResponse);

            const result = await controller.findOneByShortCodeProtected(shortCode, passwordDto);

            expect(linkService.findOneByShortCodeProtected).toHaveBeenCalledWith(
                shortCode,
                passwordDto.password
            );
            expect(result).toEqual(mockLinkResponse);
        });

        it('should pass password correctly to service', async () => {
            const shortCode = 'test1234';
            const passwordDto = { password: 'mypassword' };

            mockLinkService.findOneByShortCodeProtected.mockResolvedValue(mockLinkResponse);

            await controller.findOneByShortCodeProtected(shortCode, passwordDto);

            expect(linkService.findOneByShortCodeProtected).toHaveBeenCalledWith(
                shortCode,
                'mypassword'
            );
            expect(linkService.findOneByShortCodeProtected).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateLink', () => {
        it('should update a link', async () => {
            const linkId = 'link-123';
            const userId = 'user-123';
            const updateDto = {
                url: 'https://updated.com',
                active: false,
            };
            const updatedLink = {
                ...mockLinkResponse,
                url: 'https://updated.com',
            };

            mockLinkService.update.mockResolvedValue(updatedLink);

            const result = await controller.updateLink(linkId, updateDto, userId);

            expect(linkService.update).toHaveBeenCalledWith(linkId, updateDto, userId);
            expect(result).toEqual(updatedLink);
        });

        it('should handle partial updates', async () => {
            const linkId = 'link-123';
            const userId = 'user-123';
            const updateDto = {
                url: 'https://example.com',
                active: true,
            };

            mockLinkService.update.mockResolvedValue(mockLinkResponse);

            await controller.updateLink(linkId, updateDto, userId);

            expect(linkService.update).toHaveBeenCalledWith(linkId, updateDto, userId);
            expect(linkService.update).toHaveBeenCalledTimes(1);
        });

        it('should handle protection toggle', async () => {
            const linkId = 'link-123';
            const userId = 'user-123';
            const updateDto = {
                url: 'https://example.com',
                protected: true,
            };

            mockLinkService.update.mockResolvedValue(mockLinkResponse);

            await controller.updateLink(linkId, updateDto, userId);

            expect(linkService.update).toHaveBeenCalledWith(linkId, updateDto, userId);
        });
    });

    describe('deleteLink', () => {
        it('should delete a link', async () => {
            const linkId = 'link-123';
            const userId = 'user-123';

            mockLinkService.delete.mockResolvedValue(undefined);

            const result = await controller.deleteLink(linkId, userId);

            expect(linkService.delete).toHaveBeenCalledWith(linkId, userId);
            expect(result).toBeUndefined();
        });

        it('should pass correct parameters to service', async () => {
            const linkId = 'link-456';
            const userId = 'user-789';

            mockLinkService.delete.mockResolvedValue(undefined);

            await controller.deleteLink(linkId, userId);

            expect(linkService.delete).toHaveBeenCalledWith(linkId, userId);
            expect(linkService.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe('error handling', () => {
        it('should propagate service errors on getLinks', async () => {
            const error = new Error('Service error');
            mockLinkService.getLinks.mockRejectedValue(error);

            await expect(
                controller.getLinks({ page: 1, limit: 10, search: '' }, 'user-123')
            ).rejects.toThrow(error);
        });

        it('should propagate service errors on create', async () => {
            const error = new Error('Creation failed');
            mockLinkService.create.mockRejectedValue(error);

            await expect(
                controller.create({ url: 'https://example.com', protected: false }, 'user-123')
            ).rejects.toThrow(error);
        });

        it('should propagate service errors on findOneByShortCode', async () => {
            const error = new Error('Not found');
            mockLinkService.findOneByShortCode.mockRejectedValue(error);

            await expect(controller.findOneByShortCode('abc12345')).rejects.toThrow(error);
        });

        it('should propagate service errors on update', async () => {
            const error = new Error('Update failed');
            mockLinkService.update.mockRejectedValue(error);

            await expect(
                controller.updateLink(
                    'link-123',
                    { url: 'https://example.com' },
                    'user-123'
                )
            ).rejects.toThrow(error);
        });

        it('should propagate service errors on delete', async () => {
            const error = new Error('Delete failed');
            mockLinkService.delete.mockRejectedValue(error);

            await expect(controller.deleteLink('link-123', 'user-123')).rejects.toThrow(error);
        });
    });
});
