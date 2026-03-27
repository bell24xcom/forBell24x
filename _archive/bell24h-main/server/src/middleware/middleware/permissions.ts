import { Request, Response, NextFunction } from 'express';
import * as storage from '../storage';

/**
 * Middleware to check if a user has a specific permission on a resource
 * @param resourceType The type of resource to check permissions for
 * @param permission The permission to check
 * @param getResourceId Function to extract the resource ID from the request
 */
export function requirePermission(
  resourceType: string,
  permission: string,
  getResourceId?: (req: Request) => string | Promise<string>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let resourceId: string | undefined;
      
      if (getResourceId) {
        resourceId = await Promise.resolve(getResourceId(req));
      }

      const hasPermission = await storage.checkUserPermission(
        req.user.id,
        resourceType,
        permission,
        resourceId
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: `You do not have the required permission: ${permission} for ${resourceType}${resourceId ? ` (ID: ${resourceId})` : ''}`
        });
      }

      next();
    } catch (error: any) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'An error occurred while checking permissions' });
    }
  };
}

/**
 * Middleware to check if a user is a member of a team
 * @param getTeamId Function to extract the team ID from the request
 * @param requireAdmin Whether to require team admin role
 */
export function requireTeamMembership(
  getTeamId: (req: Request) => string | Promise<string>,
  requireAdmin: boolean = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const teamId = await Promise.resolve(getTeamId(req));
      
      const teamMember = await storage.getTeamMember(teamId, req.user.id);
      
      if (!teamMember) {
        return res.status(403).json({ error: 'You are not a member of this team' });
      }
      
      if (requireAdmin && !teamMember.is_team_admin) {
        return res.status(403).json({ error: 'You need team admin permissions to perform this action' });
      }

      // Attach the team member info to the request for downstream use
      (req as any).teamMember = teamMember;
      
      next();
    } catch (error: any) {
      console.error('Team membership check error:', error);
      res.status(500).json({ error: 'An error occurred while checking team membership' });
    }
  };
}

/**
 * Middleware to check if a user is a member of an organization
 * @param getOrgId Function to extract the organization ID from the request
 * @param requireAdmin Whether to require organization admin role
 */
export function requireOrganizationMembership(
  getOrgId: (req: Request) => string | Promise<string>,
  requireAdmin: boolean = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const orgId = await Promise.resolve(getOrgId(req));
      
      // Check for org membership (adapt this to your storage function)
      const isMember = await storage.checkUserPermission(
        req.user.id,
        'organization',
        requireAdmin ? 'admin' : 'member',
        orgId
      );
      
      if (!isMember) {
        return res.status(403).json({ 
          error: requireAdmin 
            ? 'You need organization admin permissions to perform this action' 
            : 'You are not a member of this organization' 
        });
      }
      
      next();
    } catch (error: any) {
      console.error('Organization membership check error:', error);
      res.status(500).json({ error: 'An error occurred while checking organization membership' });
    }
  };
}
