import { Module } from "@nestjs/common";
import { LinkController } from "./controllers/link.controller";
import { LinkService } from "./services/link.service";
import { PrismaService } from "src/common/prisma/services/prisma.service";
import { LinkRepository } from "./repositories/link.repository";
import { UserRepository } from "../users/repositories/user.repository";


@Module({
    controllers: [LinkController],
    providers: [LinkService, PrismaService, LinkRepository, UserRepository]
})
export class LinkModule { }