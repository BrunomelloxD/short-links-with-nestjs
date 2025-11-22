import { Injectable, Module } from "@nestjs/common";
import { TaskService } from "../services/task.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class LinkCleanupScheduler {
    constructor(private readonly taskService: TaskService) { }

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    handleCron(): void {
        this.taskService.deleteExpiredAnonymousLinks();
    }
}