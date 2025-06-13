import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/user.service";
import { UpdateProfileDto, AssignRoleDto } from "@/types/user";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  user: (id: string) => [...userKeys.all, "user", id] as const,
  permissions: (id: string) => [...userKeys.all, "permissions", id] as const,
};

// Get current user profile
export const useProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => UserService.getInstance().getProfile(),
  });
};

// Get all users (Admin only)
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => UserService.getInstance().getAllUsers(),
  });
};

// Get user by ID (Admin only)
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.user(id),
    queryFn: () => UserService.getInstance().getUserById(id),
    enabled: !!id,
  });
};

// Get user permissions (Admin only)
export const useUserPermissions = (id: string) => {
  return useQuery({
    queryKey: userKeys.permissions(id),
    queryFn: () => UserService.getInstance().getUserPermissions(id),
    enabled: !!id,
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) =>
      UserService.getInstance().updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

// Update user mutation (Admin only)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      UserService.getInstance().updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Delete user mutation (Admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserService.getInstance().deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Assign role mutation (Admin only)
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignRoleDto }) =>
      UserService.getInstance().assignRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
