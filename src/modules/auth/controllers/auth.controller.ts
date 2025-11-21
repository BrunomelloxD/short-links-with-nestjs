import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from "../dtos/login-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecoveryPasswordDto } from "../dtos/recovery-password.dto";
import { PasswordService } from "../services/password.service";
import { Public } from "src/common/decorators/public.decorator";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { VerifyRecoveryCodeDto } from "../dtos/verify-recovery-code.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly passwordService: PasswordService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    @HttpCode(HttpStatus.OK)
    signIn(@Body() data: LoginUserDto) {
        return this.authService.signIn(data);
    }

    @Public()
    @Post('recover-password/request')
    @ApiOperation({ summary: 'Request password recovery' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Recovery request sent successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Email not found' })
    @HttpCode(HttpStatus.OK)
    recoverPassword(@Body() data: RecoveryPasswordDto) {
        return this.passwordService.recoverPassword(data.email);
    }


    @Public()
    @ApiOperation({ summary: 'Verify password recovery code' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Code verified successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid recovery code' })
    @Post('recover-password/verify')
    async verifyRecoveryCode(@Body() data: VerifyRecoveryCodeDto) {
        return this.passwordService.verifyRecoveryCode(data);
    }

    @Public()
    @ApiOperation({ summary: 'Reset password' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid recovery code' })
    @HttpCode(HttpStatus.OK)
    @Post('recover-password/reset')
    async resetPassword(@Body() data: ResetPasswordDto) {
        return this.passwordService.resetPassword(data);
    }
}