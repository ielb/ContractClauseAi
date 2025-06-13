import { z } from "zod";
import { UserRole } from "@/types/user";

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
});

export const assignRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
