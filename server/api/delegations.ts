import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../storage';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Schema for creating a permission delegation
const createDelegationSchema = z.object({
  to_user_id: z.string().uuid('Invalid user ID'),
  resource_type: z.string().min(1, 'Resource type is required'),
  resource_id: z.string().optional(),
  permission: z.string().min(1, 'Permission is required'),
  expires_at: z.string().datetime().optional(),
});

// Schema for updating a delegation
const updateDelegationSchema = z.object({
  is_active: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

/**
 * Create a new permission delegation
 * POST /api/delegations
 */
router.post('/', authenticate, validateRequest(createDelegationSchema), async (req, res) => {
  try {
    const { to_user_id, resource_type, resource_id, permission, expires_at } = req.body;
    
    // Check if the user has the permission they're trying to delegate
    const hasPermission = await storage.checkUserPermission(
      req.user!.id,
      resource_type,
      permission,
      resource_id
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'You can only delegate permissions that you have'
      });
    }
    
    // Prevent self-delegation
    if (req.user!.id === to_user_id) {
      return res.status(400).json({
        error: 'You cannot delegate permissions to yourself'
      });
    }
    
    // Create the delegation
    const delegation = await storage.createDelegation({
      from_user_id: req.user!.id,
      to_user_id,
      resource_type,
      resource_id,
      permission,
      is_active: true,
      expires_at: expires_at ? new Date(expires_at) : undefined
    });
    
    res.status(201).json(delegation);
  } catch (error: any) {
    console.error('Error creating delegation:', error);
    res.status(500).json({ error: error.message || 'Failed to create delegation' });
  }
});

/**
 * Get delegations from the current user
 * GET /api/delegations/from-me
 */
router.get('/from-me', authenticate, async (req, res) => {
  try {
    const delegations = await storage.getDelegationsFromUser(req.user!.id);
    res.json(delegations);
  } catch (error: any) {
    console.error('Error getting delegations:', error);
    res.status(500).json({ error: error.message || 'Failed to get delegations' });
  }
});

/**
 * Get delegations to the current user
 * GET /api/delegations/to-me
 */
router.get('/to-me', authenticate, async (req, res) => {
  try {
    const delegations = await storage.getDelegationsToUser(req.user!.id);
    res.json(delegations);
  } catch (error: any) {
    console.error('Error getting delegations:', error);
    res.status(500).json({ error: error.message || 'Failed to get delegations' });
  }
});

/**
 * Update a delegation
 * PUT /api/delegations/:id
 */
router.put('/:id', authenticate, validateRequest(updateDelegationSchema), async (req, res) => {
  try {
    const delegationId = req.params.id;
    const { is_active, expires_at } = req.body;
    
    // Get the delegation to check ownership
    const delegation = await storage.getDelegationById(delegationId);
    
    if (!delegation) {
      return res.status(404).json({ error: 'Delegation not found' });
    }
    
    // Ensure the user is the creator of this delegation
    if (delegation.from_user_id !== req.user!.id) {
      return res.status(403).json({
        error: 'You can only modify delegations that you created'
      });
    }
    
    // Update the delegation
    const updatedDelegation = await storage.updateDelegation(delegationId, {
      is_active,
      expires_at: expires_at ? new Date(expires_at) : undefined
    });
    
    if (!updatedDelegation) {
      return res.status(404).json({ error: 'Delegation not found' });
    }
    
    res.json(updatedDelegation);
  } catch (error: any) {
    console.error('Error updating delegation:', error);
    res.status(500).json({ error: error.message || 'Failed to update delegation' });
  }
});

/**
 * Delete a delegation
 * DELETE /api/delegations/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const delegationId = req.params.id;
    
    // Get the delegation to check ownership
    const delegation = await storage.getDelegationById(delegationId);
    
    if (!delegation) {
      return res.status(404).json({ error: 'Delegation not found' });
    }
    
    // Ensure the user is the creator of this delegation
    if (delegation.from_user_id !== req.user!.id) {
      return res.status(403).json({
        error: 'You can only delete delegations that you created'
      });
    }
    
    // Delete the delegation
    const success = await storage.deleteDelegation(delegationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Delegation not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting delegation:', error);
    res.status(500).json({ error: error.message || 'Failed to delete delegation' });
  }
});

/**
 * Check if the current user has a specific permission
 * GET /api/delegations/check-permission/:resourceType/:permission
 */
router.get('/check-permission/:resourceType/:permission', authenticate, async (req, res) => {
  try {
    const { resourceType, permission } = req.params;
    const resourceId = req.query.resourceId as string | undefined;
    
    const hasPermission = await storage.checkUserPermission(
      req.user!.id,
      resourceType,
      permission,
      resourceId
    );
    
    res.json({ hasPermission });
  } catch (error: any) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: error.message || 'Failed to check permission' });
  }
});

/**
 * Get all effective permissions for the current user
 * GET /api/delegations/my-permissions
 */
router.get('/my-permissions', authenticate, async (req, res) => {
  try {
    // Get team-based permissions
    const teamPermissions = await storage.getUserEffectivePermissions(req.user!.id);
    
    // Get delegated permissions
    const delegatedPermissions = await storage.getUserDelegatedPermissions(req.user!.id);
    
    res.json({
      teamPermissions,
      delegatedPermissions
    });
  } catch (error: any) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({ error: error.message || 'Failed to get user permissions' });
  }
});

export default router;
