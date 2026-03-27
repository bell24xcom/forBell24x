import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertResourcePermissionSchema } from '../../shared/schema';

const router = Router();

// ===== Permission Routes =====
router.get('/api/permissions/:resourceType/:resourceId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const resourceType = req.params.resourceType;
    const resourceId = parseInt(req.params.resourceId);
    
    // Check if user can view permissions
    const canView = await storage.canViewResourcePermissions(resourceType, resourceId, req.user!.id);
    if (!canView) {
      return res.status(403).json({ error: 'Not authorized to view permissions for this resource' });
    }
    
    const permissions = await storage.getResourcePermissions(resourceType, resourceId);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

router.post('/api/permissions', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const validatedData = insertResourcePermissionSchema.parse(req.body);
    
    // Check if user can manage permissions
    const canManage = await storage.canManageResourcePermissions(
      validatedData.resource_type,
      validatedData.resource_id,
      req.user!.id
    );
    
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to manage permissions for this resource' });
    }
    
    // Check if permission already exists
    const existingPermission = await storage.getSpecificResourcePermission(
      validatedData.resource_type,
      validatedData.resource_id,
      validatedData.user_id,
      validatedData.team_id,
      validatedData.organization_id
    );
    
    if (existingPermission) {
      return res.status(400).json({ error: 'Permission already exists for this entity' });
    }
    
    const permission = await storage.createResourcePermission(validatedData);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
});

router.patch('/api/permissions/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const permissionId = parseInt(req.params.id);
    
    // Get the current permission
    const permission = await storage.getResourcePermission(permissionId);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    // Check if user can manage permissions
    const canManage = await storage.canManageResourcePermissions(
      permission.resource_type,
      permission.resource_id,
      req.user!.id
    );
    
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to update permissions for this resource' });
    }
    
    const updatedPermission = await storage.updateResourcePermission(permissionId, req.body);
    res.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

router.delete('/api/permissions/:id', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const permissionId = parseInt(req.params.id);
    
    // Get the current permission
    const permission = await storage.getResourcePermission(permissionId);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }
    
    // Check if user can manage permissions
    const canManage = await storage.canManageResourcePermissions(
      permission.resource_type,
      permission.resource_id,
      req.user!.id
    );
    
    if (!canManage) {
      return res.status(403).json({ error: 'Not authorized to delete permissions for this resource' });
    }
    
    await storage.deleteResourcePermission(permissionId);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({ error: 'Failed to delete permission' });
  }
});

// Check if a user has permission for a resource
router.get('/api/permissions/check/:resourceType/:resourceId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const resourceType = req.params.resourceType;
    const resourceId = parseInt(req.params.resourceId);
    
    const permissionLevel = await storage.getUserPermissionLevel(resourceType, resourceId, req.user!.id);
    
    res.json({
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: req.user!.id,
      permission: permissionLevel
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

export default router;