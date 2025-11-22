import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { LinkRepository } from '../../links/repositories/link.repository';
import { Links } from '@prisma/client';

describe('TaskService', () => {
    let service: TaskService;
    let linkRepository: jest.Mocked<LinkRepository>;

    const mockLinkRepository = {
        findExpiredAnonymousLinks: jest.fn(),
        deleteMany: jest.fn(),
    };

    const mockExpiredLink: Links = {
        id: 'link-123',
        url: 'https://example.com',
        short_code: 'abc12345',
        password: null,
        active: true,
        user_id: null,
        created_at: new Date('2024-11-01'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: LinkRepository,
                    useValue: mockLinkRepository,
                },
            ],
        }).compile();

        service = module.get<TaskService>(TaskService);
        linkRepository = module.get(LinkRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('deleteExpiredAnonymousLinks', () => {
        it('should delete expired anonymous links older than 7 days', async () => {
            const expiredLinks = [mockExpiredLink];
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue(expiredLinks);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            await service.deleteExpiredAnonymousLinks();

            expect(linkRepository.findExpiredAnonymousLinks).toHaveBeenCalled();
            const cutoffDate = mockLinkRepository.findExpiredAnonymousLinks.mock.calls[0][0];
            expect(cutoffDate).toBeInstanceOf(Date);
            expect(linkRepository.deleteMany).toHaveBeenCalledWith(['link-123']);
        });

        it('should calculate cutoff date correctly (7 days ago)', async () => {
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue([]);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            const beforeCall = new Date();
            beforeCall.setDate(beforeCall.getDate() - 7);

            await service.deleteExpiredAnonymousLinks();

            const cutoffDate = mockLinkRepository.findExpiredAnonymousLinks.mock.calls[0][0];
            const dateDiff = Math.abs(cutoffDate.getTime() - beforeCall.getTime());

            // Allow 1 second difference for test execution time
            expect(dateDiff).toBeLessThan(1000);
        });

        it('should delete multiple expired links', async () => {
            const expiredLinks = [
                { ...mockExpiredLink, id: 'link-1' },
                { ...mockExpiredLink, id: 'link-2' },
                { ...mockExpiredLink, id: 'link-3' },
            ];
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue(expiredLinks as Links[]);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            await service.deleteExpiredAnonymousLinks();

            expect(linkRepository.deleteMany).toHaveBeenCalledWith(['link-1', 'link-2', 'link-3']);
            expect(linkRepository.deleteMany).toHaveBeenCalledTimes(1);
        });

        it('should not delete anything when no expired links found', async () => {
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue([]);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            await service.deleteExpiredAnonymousLinks();

            expect(linkRepository.findExpiredAnonymousLinks).toHaveBeenCalled();
            expect(linkRepository.deleteMany).toHaveBeenCalledWith([]);
        });

        it('should handle repository errors gracefully', async () => {
            const error = new Error('Database error');
            mockLinkRepository.findExpiredAnonymousLinks.mockRejectedValue(error);

            await expect(service.deleteExpiredAnonymousLinks()).rejects.toThrow(error);
            expect(linkRepository.deleteMany).not.toHaveBeenCalled();
        });

        it('should propagate deletion errors', async () => {
            const expiredLinks = [mockExpiredLink];
            const deleteError = new Error('Delete failed');
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue(expiredLinks);
            mockLinkRepository.deleteMany.mockRejectedValue(deleteError);

            await expect(service.deleteExpiredAnonymousLinks()).rejects.toThrow(deleteError);
            expect(linkRepository.findExpiredAnonymousLinks).toHaveBeenCalled();
            expect(linkRepository.deleteMany).toHaveBeenCalledWith(['link-123']);
        });

        it('should extract correct IDs from expired links', async () => {
            const expiredLinks = [
                { ...mockExpiredLink, id: 'first-id' },
                { ...mockExpiredLink, id: 'second-id' },
            ];
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue(expiredLinks as Links[]);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            await service.deleteExpiredAnonymousLinks();

            expect(linkRepository.deleteMany).toHaveBeenCalledWith(['first-id', 'second-id']);
        });

        it('should only delete anonymous links (user_id is null)', async () => {
            const links = [
                { ...mockExpiredLink, id: 'anon-link', user_id: null },
            ];
            mockLinkRepository.findExpiredAnonymousLinks.mockResolvedValue(links as Links[]);
            mockLinkRepository.deleteMany.mockResolvedValue(undefined);

            await service.deleteExpiredAnonymousLinks();

            expect(linkRepository.findExpiredAnonymousLinks).toHaveBeenCalled();
            expect(linkRepository.deleteMany).toHaveBeenCalledWith(['anon-link']);
        });
    });
});
