import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UserRepository } from "../repositories/user.repository";
import { hash } from 'bcrypt';
import { security } from "src/common/config/env.config";
import { UserResponseDto } from "../dtos/response/user-response.dto";
import { UpdateUserDto } from "../dtos/update-user.dto";
import { Prisma, User } from "@prisma/client";
import { ExportFormat } from "src/common/constants/export-format.constant";
import { PdfService } from "src/common/services/pdf.service";
import { XlsxService } from "src/common/services/xlsx.service";
@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository, private readonly pdfService: PdfService, private readonly xlsxService: XlsxService) { }

    async updateUserWithValidation(id: string, data: UpdateUserDto, userId: string): Promise<User> {
        if (id !== userId) {
            throw new ConflictException(`You cannot update user with id ${id} as it does not match your own user id ${userId}.`);
        }

        if (!(await this.existById(id, true))) {
            throw new NotFoundException(`User with id ${id} does not exists.`);
        }

        const validateEmail = await this.findByEmail(data.email, false);
        if (validateEmail && validateEmail.id !== id) {
            throw new ConflictException(`User with email ${data.email} already exists.`);
        }

        return await this.update(id, data);
    }

    update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.userRepository.update(id, data);
    }

    async findByEmail(email: string, deleted_at_filter?: boolean): Promise<User | null> {
        return await this.userRepository.findByEmail(email, deleted_at_filter);
    }

    async findOne(id: string): Promise<UserResponseDto | null> {
        if (!(await this.existById(id, true))) {
            throw new NotFoundException(`User with id ${id} does not exists.`);
        }

        return await this.userRepository.findOne(id);
    }

    existsByEmail(email: string, deleted_at_filter?: boolean): Promise<boolean> {
        return this.userRepository.existsByEmail(email, deleted_at_filter);
    }

    existById(id: string, deleted_at_filter?: boolean): Promise<boolean> {
        return this.userRepository.existsById(id, deleted_at_filter);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto> | { base64: string }> {
        const result = await this.userRepository.findAll(paginationDto);

        if (paginationDto.format === ExportFormat.PDF) {
            const pdfBuffer = await this.pdfService.generateUserListPdf(
                result.data.map(user => ({ name: user.name, email: user.email }))
            );
            const base64 = pdfBuffer.toString('base64');
            return { base64 };
        }

        if (paginationDto.format === ExportFormat.XLSX) {
            const xlsxBuffer = await this.xlsxService.generateUserListXlsx(
                result.data.map(user => ({ name: user.name, email: user.email }))
            );
            const base64 = xlsxBuffer.toString('base64');
            return { base64 };
        }

        return result;
    }

    async create(data: Prisma.UserCreateInput): Promise<UserResponseDto> {
        if (await this.existsByEmail(data.email, false)) {
            throw new ConflictException(`User with email ${data.email} already exists.`);
        }

        const hashedPassword = await hash(data.password, security.bcrypt.saltRounds);
        data.password = hashedPassword;
        data.email_verified = true;

        return this.userRepository.create(data);
    }

    async remove(id: string): Promise<void> {
        if (!(await this.existById(id, true))) {
            throw new NotFoundException(`User with id ${id} does not exists or is already deleted.`);
        }

        return this.userRepository.remove(id);
    }
}