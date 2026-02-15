import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from '../../core/auth/auth.service';
import { LoginDto, RegisterDto, PasswordResetDto, ProfileUpdateDto } from '../../core/auth/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: any) {
    return this.authService.logout(req.user);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshData: any) {
    return this.authService.refreshToken(refreshData);
  }

  @Post('password/reset')
  async requestPasswordReset(@Body() resetData: any) {
    return this.authService.requestPasswordReset(resetData);
  }

  @Post('password/reset/confirm')
  async confirmPasswordReset(@Body() dto: PasswordResetDto) {
    return this.authService.confirmPasswordReset(dto);
  }

  @Post('password/change')
  @UseGuards(AuthGuard)
  async changePassword(@Req() req: any, @Body() passwordData: any) {
    return this.authService.changePassword(req.user, passwordData);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: ProfileUpdateDto) {
    return this.authService.updateProfile(req.user, dto);
  }

  @Get('verify/email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('verify/email/resend')
  @UseGuards(AuthGuard)
  async resendEmailVerification(@Req() req: any) {
    return this.authService.resendEmailVerification(req.user);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard)
  async enable2FA(@Req() req: any) {
    return this.authService.enable2FA(req.user);
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard)
  async disable2FA(@Req() req: any, @Body() verificationData: any) {
    return this.authService.disable2FA(req.user, verificationData);
  }

  @Post('2fa/verify')
  async verify2FA(@Body() verificationData: any) {
    return this.authService.verify2FA(verificationData);
  }

  @Get('sso/providers')
  async getSSOProviders() {
    return this.authService.getSSOProviders();
  }

  @Get('sso/:provider/initiate')
  async initiateSSO(@Param('provider') provider: string, @Query() query: any) {
    return this.authService.initiateSSO(provider, query);
  }

  @Get('sso/:provider/callback')
  async handleSSOCallback(@Param('provider') provider: string, @Query() query: any) {
    return this.authService.handleSSOCallback(provider, query);
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  async getUserSessions(@Req() req: any) {
    return this.authService.getUserSessions(req.user);
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(AuthGuard)
  async revokeSession(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.authService.revokeSession(req.user, sessionId);
  }

  @Post('sessions/revoke-all')
  @UseGuards(AuthGuard)
  async revokeAllSessions(@Req() req: any) {
    return this.authService.revokeAllSessions(req.user);
  }

  @Get('permissions')
  @UseGuards(AuthGuard)
  async getUserPermissions(@Req() req: any) {
    return this.authService.getUserPermissions(req.user);
  }

  @Get('roles')
  @UseGuards(AuthGuard)
  async getUserRoles(@Req() req: any) {
    return this.authService.getUserRoles(req.user);
  }

  @Post('impersonate/:userId')
  @UseGuards(RoleGuard)
  async impersonateUser(@Req() req: any, @Param('userId') userId: string) {
    return this.authService.impersonateUser(req.user, userId);
  }

  @Post('impersonate/stop')
  @UseGuards(AuthGuard)
  async stopImpersonation(@Req() req: any) {
    return this.authService.stopImpersonation(req.user);
  }

  @Get('audit/logs')
  @UseGuards(RoleGuard)
  async getAuditLogs(@Query() query: any) {
    return this.authService.getAuditLogs(query);
  }

  @Get('security/status')
  @UseGuards(AuthGuard)
  async getSecurityStatus(@Req() req: any) {
    return this.authService.getSecurityStatus(req.user);
  }

  @Post('security/lock-account')
  @UseGuards(RoleGuard)
  async lockAccount(@Body() lockData: any) {
    return this.authService.lockAccount(lockData);
  }

  @Post('security/unlock-account')
  @UseGuards(RoleGuard)
  async unlockAccount(@Body() unlockData: any) {
    return this.authService.unlockAccount(unlockData);
  }
} 