import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for delegation
const delegationSchema = z.object({
  user_id: z.number().int().positive(),
  delegated_to_id: z.number().int().positive(),
  resource_type: z.string(),
  resource_id: z.number().int().positive().optional(),
  permission: z.enum(['full', 'create', 'read', 'update', 'delete']),
  organization_id: z.number().int().positive().optional(),
  team_id: z.number().int().positive().optional(),
  expires_at: z.string().datetime().optional(),
});

// Get delegations for the current user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const delegations = await storage.getUserDelegations(req.user.id);
    res.json(delegations);
  } catch (error) {
    console.error('Error fetching delegations:', error);
    res.status(500).json({ error: 'Failed to fetch delegations' });
  }
});

// Get delegations created by the current user
router.get('/created', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const delegations = await storage.getCreatedDelegations(req.user.id);
    res.json(delegations);
  } catch (error) {
    console.error('Error fetching created delegations:', error);
    res.status(500).json({ error: 'Failed to fetch created delegations' });
  }
});

// Create a new delegation
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = delegationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const { 
      user_id, 
      delegated_to_id, 
      resource_type, 
      resource_id, 
      permission,
      organization_id,
      team_id
    } = result.data;
    
    // Validate that the user has the permission they're trying to delegate
    if (user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only create delegations for yourself' });
    }
    
    // Check that the user has the permission they are trying to delegate
    const hasPermission = await storage.checkUserHasPermission(
      user_id, 
      resource_type, 
      resource_id || 0, 
      permission
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You cannot delegate permissions you do not have' });
    }
    
    // Check if delegation already exists
    const existingDelegation = await storage.findDelegation(
      user_id,
      delegated_to_id,
      resource_type,
      resource_id,
      permission
    );
    
    if (existingDelegation) {
      return res.status(400).json({ error: 'This delegation already exists' });
    }
    
    // Create the delegation
    const newDelegation = await storage.createDelegation({
      ...result.data,
      created_by: req.user.id,
      created_at: new Date()
    });
    
    res.status(201).json(newDelegation);
  } catch (error) {
    console.error('Error creating delegation:', error);
    res.status(500).json({ error: 'Failed to create delegation' });
  }
});

// Revoke a delegation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const delegationId = Number(req.params.id);
    const delegation = await storage.getDelegation(delegationId);
    
    if (!delegation) {
      return res.status(404).json({ error: 'Delegation not found' });
    }
    
    // Only the creator or the delegator can revoke a delegation
    if (delegation.created_by !== req.user.id && delegation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to revoke this delegation' });
    }
    
    await storage.revokeDelegation(delegationId);
    res.status(204).send();
  } catch (error) {
    console.error('Error revoking delegation:', error);
    res.status(500).json({ error: 'Failed to revoke delegation' });
  }
});

// Get delegations for a specific resource
router.get('/resource/:type/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const resourceType = req.params.type;
    const resourceId = Number(req.params.id);
    
    // Check if user has read access to the resource
    const hasAccess = await storage.checkUserHasPermission(
      req.user.id,
      resourceType,
      resourceId,
      'read'
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to view delegations for this resource' });
    }
    
    const delegations = await storage.getResourceDelegations(resourceType, resourceId);
    res.json(delegations);
  } catch (error) {
    console.error('Error fetching resource delegations:', error);
    res.status(500).json({ error: 'Failed to fetch resource delegations' });
  }
});

export default router;
