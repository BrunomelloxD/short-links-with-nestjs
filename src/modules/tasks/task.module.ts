import { Module } from "@nestjs/common";
import { TaskService } from "./services/task.service";
import { LinkCleanupScheduler } from "./schedulers/link-cleanup.scheduler";
import { ScheduleModule } from "@nestjs/schedule";
import { LinkModule } from "../links/link.module";
import { LinkRepository } from "../links/repositories/link.repository";
import { PrismaService } from "src/common/prisma/services/prisma.service";

@Module({
    imports: [ScheduleModule.forRoot(), LinkModule],
    providers: [PrismaService, LinkRepository, TaskService, LinkCleanupScheduler],
})
export class TasksModule { }