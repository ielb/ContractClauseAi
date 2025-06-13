import { BaseAPI } from "@/api/base.api";
import {
  LoginDto,
  SignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponse,
  ApiResponse,
} from "@/types/auth";

export class AuthAPI extends BaseAPI {
  private static instance: AuthAPI;

  private constructor() {
    super();
  }

  public static getInstance(): AuthAPI {
    if (!AuthAPI.instance) {
      AuthAPI.instance = new AuthAPI();
    }
    return AuthAPI.instance;
  }

  // Login user
  public async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data.data;
  }

  // Register new user
  public async signup(data: SignupDto): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data;
  }

  // Request password reset
  public async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    await this.api.post("/auth/forgot-password", data);
  }

  // Reset password with token
  public async resetPassword(data: ResetPasswordDto): Promise<void> {
    await this.api.post("/auth/reset-password", data);
  }

  // Verify email with token
  public async verifyEmail(data: VerifyEmailDto): Promise<void> {
    await this.api.post("/auth/verify-email", data);
  }

  // Refresh access token
  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      { refreshToken }
    );
    return response.data.data;
  }

  // Logout user
  public async logout(): Promise<void> {
    await this.api.post("/auth/logout");
  }

  // Resend verification email
  public async resendVerificationEmail(): Promise<void> {
    await this.api.post("/auth/resend-verification");
  }
}
