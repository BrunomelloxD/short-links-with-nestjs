import { Injectable } from "@nestjs/common";
import { LinkRepository } from "src/modules/links/repositories/link.repository";


@Injectable()
export class TaskService {
    constructor(private readonly linkRepository: LinkRepository) { }

    async deleteExpiredAnonymousLinks(): Promise<void> {
        const cutoffDate = new Date();
        const daysToKeep = 7;
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const expiredLinks = await this.linkRepository.findExpiredAnonymousLinks(cutoffDate);
        const expiredLinkIds = expiredLinks.map(link => link.id);
        await this.linkRepository.deleteMany(expiredLinkIds);
    }
}