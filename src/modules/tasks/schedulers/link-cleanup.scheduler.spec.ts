import { Test, TestingModule } from '@nestjs/testing';
import { LinkCleanupScheduler } from './link-cleanup.scheduler';
import { TaskService } from '../services/task.service';

describe('LinkCleanupScheduler', () => {
    let scheduler: LinkCleanupScheduler;
    let taskService: jest.Mocked<TaskService>;

    const mockTaskService = {
        deleteExpiredAnonymousLinks: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LinkCleanupScheduler,
                {
                    provide: TaskService,
                    useValue: mockTaskService,
                },
            ],
        }).compile();

        scheduler = module.get<LinkCleanupScheduler>(LinkCleanupScheduler);
        taskService = module.get(TaskService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('handleCron', () => {
        it('should call deleteExpiredAnonymousLinks on task service', () => {
            mockTaskService.deleteExpiredAnonymousLinks.mockResolvedValue(undefined);

            scheduler.handleCron();

            expect(taskService.deleteExpiredAnonymousLinks).toHaveBeenCalled();
            expect(taskService.deleteExpiredAnonymousLinks).toHaveBeenCalledTimes(1);
        });

        it('should execute without parameters', () => {
            mockTaskService.deleteExpiredAnonymousLinks.mockResolvedValue(undefined);

            scheduler.handleCron();

            expect(taskService.deleteExpiredAnonymousLinks).toHaveBeenCalledWith();
        });

        it('should call task service multiple times when triggered multiple times', () => {
            mockTaskService.deleteExpiredAnonymousLinks.mockResolvedValue(undefined);

            scheduler.handleCron();
            scheduler.handleCron();
            scheduler.handleCron();

            expect(taskService.deleteExpiredAnonymousLinks).toHaveBeenCalledTimes(3);
        });
    });

    describe('scheduler configuration', () => {
        it('should be an injectable class', () => {
            expect(scheduler).toBeDefined();
            expect(scheduler).toBeInstanceOf(LinkCleanupScheduler);
        });

        it('should have taskService dependency injected', () => {
            expect(scheduler['taskService']).toBeDefined();
            expect(scheduler['taskService']).toBe(taskService);
        });
    });
});
