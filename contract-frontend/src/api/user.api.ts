import { BaseAPI } from "@/api/base.api";
import {
  User,
  UpdateProfileDto,
  AssignRoleDto,
  UserPermissions,
  ApiResponse,
} from "@/types/user";

export class UserAPI extends BaseAPI {
  private static instance: UserAPI;

  private constructor() {
    super();
  }

  public static getInstance(): UserAPI {
    if (!UserAPI.instance) {
      UserAPI.instance = new UserAPI();
    }
    return UserAPI.instance;
  }

  // Get current user profile
  public async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>("/users/profile");
    return response.data.data;
  }

  // Update current user profile
  public async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>(
      "/users/profile",
      data
    );
    return response.data.data;
  }

  // Get all users (Admin only)
  public async getAllUsers(): Promise<User[]> {
    const response = await this.api.get<ApiResponse<User[]>>("/users/all");
    return response.data.data;
  }

  // Get user by ID (Admin only)
  public async getUserById(id: string): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  }

  // Update any user (Admin only)
  public async updateUser(id: string, data: UpdateProfileDto): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>(
      `/users/${id}`,
      data
    );
    return response.data.data;
  }

  // Delete user (Admin only)
  public async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Assign user role (Admin only)
  public async assignRole(id: string, data: AssignRoleDto): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>(
      `/users/${id}/role`,
      data
    );
    return response.data.data;
  }

  // Get user permissions (Admin only)
  public async getUserPermissions(id: string): Promise<UserPermissions> {
    const response = await this.api.get<ApiResponse<UserPermissions>>(
      `/users/${id}/permissions`
    );
    return response.data.data;
  }
}
