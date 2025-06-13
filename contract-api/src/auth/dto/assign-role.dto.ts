import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class AssignRoleDto {
  @ApiProperty({
    description: 'User role to assign',
    example: 'admin',
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
