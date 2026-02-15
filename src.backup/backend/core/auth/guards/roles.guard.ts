import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return this.matchRoles(requiredRoles, user.role);
  }

  private matchRoles(requiredRoles: UserRole[], userRole: UserRole): boolean {
    // Check if user has any of the required roles
    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Special case: ADMIN has access to everything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Special case: BUYER has access to SUPPLIER routes
    if (userRole === UserRole.BUYER && requiredRoles.includes(UserRole.SUPPLIER)) {
      return true;
    }

    return false;
  }
} 