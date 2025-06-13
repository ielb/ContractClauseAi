import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';
import { GdprService } from './gdpr.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { AssignRoleDto, UserRole } from '../auth/dto/assign-role.dto';
import {
  UpdateConsentDto,
  DataDeletionRequestDto,
} from '../auth/dto/gdpr-consent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRequest } from '../auth/interfaces/auth-request.interface';

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly gdprService: GdprService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: AuthRequest) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, updateData);
  }

  // GDPR Compliance Endpoints

  @Get('gdpr/status')
  @ApiOperation({ summary: 'Get GDPR compliance status' })
  @ApiResponse({
    status: 200,
    description: 'GDPR status retrieved successfully',
  })
  async getGdprStatus(@Request() req: AuthRequest) {
    return this.gdprService.getGdprStatus(req.user.id);
  }

  @Put('gdpr/consent')
  @ApiOperation({ summary: 'Update GDPR consent preferences' })
  @ApiResponse({ status: 200, description: 'Consent updated successfully' })
  async updateConsent(
    @Request() req: AuthRequest,
    @Body() consentData: UpdateConsentDto,
  ) {
    return this.gdprService.updateConsent(req.user.id, consentData);
  }

  @Get('gdpr/export')
  @ApiOperation({
    summary: 'Export user data (GDPR Right to Data Portability)',
  })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  @ApiResponse({ status: 200, description: 'User data exported successfully' })
  async exportUserData(
    @Request() req: AuthRequest,
    @Query('format') format: 'json' | 'csv' = 'json',
    @Res() res: Response,
  ) {
    const userData = await this.gdprService.exportUserData(req.user.id, format);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="user-data.csv"',
      );
      return res.send(userData);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="user-data.json"',
    );
    return res.json(userData);
  }

  @Post('gdpr/delete-request')
  @ApiOperation({
    summary: 'Request account deletion (GDPR Right to be Forgotten)',
  })
  @ApiResponse({
    status: 200,
    description: 'Deletion request submitted successfully',
  })
  async requestDataDeletion(
    @Request() req: AuthRequest,
    @Body() deletionData: DataDeletionRequestDto,
  ) {
    return this.gdprService.requestDataDeletion(req.user.id, deletionData);
  }

  @Delete('gdpr/delete-request')
  @ApiOperation({ summary: 'Cancel account deletion request' })
  @ApiResponse({
    status: 200,
    description: 'Deletion request cancelled successfully',
  })
  async cancelDataDeletion(@Request() req: AuthRequest) {
    return this.gdprService.cancelDataDeletion(req.user.id);
  }

  // Admin Endpoints

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(@Param('id') id: string, @Body() { role }: AssignRoleDto) {
    return this.userService.assignRole(id, role);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  async deactivateUser(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  // Admin GDPR Management

  @Get('admin/gdpr/scheduled-deletions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process scheduled account deletions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Scheduled deletions processed' })
  async processScheduledDeletions() {
    const deletedCount = await this.gdprService.processScheduledDeletions();
    return { message: `Processed ${deletedCount} scheduled deletions` };
  }
}
