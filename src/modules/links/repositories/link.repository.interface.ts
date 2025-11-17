import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { LinkResponseDto } from "../dtos/response/link-response.dto";


export abstract class LinkRepositoryInterface {
    abstract findAll({ page, limit, search }: PaginationDto): Promise<PaginatedResponseDto<LinkResponseDto>>;
}