import { UserAPI } from "@/api/user.api";
import {
  User,
  UpdateProfileDto,
  AssignRoleDto,
  UserPermissions,
} from "@/types/user";

export class UserService {
  private static instance: UserService;
  private userAPI: UserAPI;

  private constructor() {
    this.userAPI = UserAPI.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Get current user profile
  public async getProfile(): Promise<User> {
    return this.userAPI.getProfile();
  }

  // Update current user profile
  public async updateProfile(data: UpdateProfileDto): Promise<User> {
    // Add any business logic validation here if needed
    return this.userAPI.updateProfile(data);
  }

  // Get all users (Admin only)
  public async getAllUsers(): Promise<User[]> {
    return this.userAPI.getAllUsers();
  }

  // Get user by ID (Admin only)
  public async getUserById(id: string): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }
    return this.userAPI.getUserById(id);
  }

  // Update any user (Admin only)
  public async updateUser(id: string, data: UpdateProfileDto): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }
    // Add any business logic validation here if needed
    return this.userAPI.updateUser(id, data);
  }

  // Delete user (Admin only)
  public async deleteUser(id: string): Promise<void> {
    if (!id) {
      throw new Error("User ID is required");
    }
    return this.userAPI.deleteUser(id);
  }

  // Assign user role (Admin only)
  public async assignRole(id: string, data: AssignRoleDto): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }
    return this.userAPI.assignRole(id, data);
  }

  // Get user permissions (Admin only)
  public async getUserPermissions(id: string): Promise<UserPermissions> {
    if (!id) {
      throw new Error("User ID is required");
    }
    return this.userAPI.getUserPermissions(id);
  }

  // Business logic methods can be added here
  public async isUserAdmin(userId?: string): Promise<boolean> {
    try {
      if (userId) {
        const user = await this.getUserById(userId);
        return user.role === "admin";
      } else {
        const profile = await this.getProfile();
        return profile.role === "admin";
      }
    } catch {
      return false;
    }
  }

  public async canManageUsers(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      if (profile.role === "admin") {
        const permissions = await this.getUserPermissions(profile.id);
        return permissions.canManageUsers;
      }
      return false;
    } catch {
      return false;
    }
  }
}
