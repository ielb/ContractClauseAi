import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto/assign-role.dto';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
