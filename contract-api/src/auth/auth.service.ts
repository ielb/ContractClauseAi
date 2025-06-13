import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; email: string }> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictException('User with this email already exists');
      } else {
        // User exists but not verified, resend verification email
        await this.generateAndSendVerificationToken(existingUser);
        return {
          message:
            'Registration email resent. Please check your email to verify your account.',
          email,
        };
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new this.userModel({
      email,
      name,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await user.save();

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        name,
        verificationToken,
      );
    } catch (error) {
      // If email fails, still allow registration but log the error
      console.error('Failed to send verification email:', error);
    }

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
      email,
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string; user: Partial<User>; token: string }> {
    const { token } = verifyEmailDto;

    const user = await this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };
    const jwtToken = this.jwtService.sign(payload);

    // Return user without password
    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userResponse } = userObject;

    return {
      message: 'Email verified successfully! Welcome to ContractClauseAI.',
      user: userResponse,
      token: jwtToken,
    };
  }

  async resendVerificationEmail(
    resendDto: ResendVerificationDto,
  ): Promise<{ message: string }> {
    const { email } = resendDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.generateAndSendVerificationToken(user);

    return {
      message: 'Verification email sent. Please check your email.',
    };
  }

  private async generateAndSendVerificationToken(
    user: UserDocument,
  ): Promise<void> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    const { email, password } = loginDto;

    // Find user with password field
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    // Return user without password
    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userResponse } = userObject;

    return { user: userResponse, token };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive || !user.isVerified) {
      throw new UnauthorizedException(
        'User not found, inactive, or not verified',
      );
    }
    return user;
  }

  async refreshToken(userId: string): Promise<{ token: string }> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive || !user.isVerified) {
      throw new UnauthorizedException(
        'User not found, inactive, or not verified',
      );
    }

    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    return { message: 'Password changed successfully' };
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If a user with that email exists, a password reset link has been sent.',
      };
    }

    if (!user.isVerified) {
      throw new BadRequestException('Please verify your email first');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Clear the token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await this.emailService.sendPasswordChangeConfirmationEmail(
        user.email,
        user.name,
      );
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
    }

    return {
      message: 'Password has been reset successfully',
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Since we're using stateless JWT tokens, logout is primarily client-side
    // However, we can perform server-side cleanup if needed
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In a more advanced implementation, you might:
    // 1. Add the token to a blacklist
    // 2. Store logout timestamp
    // 3. Clear any session data

    return {
      message: 'Logged out successfully',
    };
  }
}
