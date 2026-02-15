import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertOrganizationSchema, insertOrganizationMemberSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get all organizations
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const organizations = await storage.getOrganizations(req.user.id);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get a specific organization by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is a member of this organization
    const isMember = await storage.isOrganizationMember(req.user.id, orgId);
    if (!isMember && organization.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this organization' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Create a new organization
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = insertOrganizationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const newOrganization = await storage.createOrganization({
      ...result.data,
      owner_id: req.user.id
    });
    
    res.status(201).json(newOrganization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Update an organization
router.put('/:id', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is the owner or an admin
    if (organization.owner_id !== req.user.id) {
      const isAdmin = await storage.isOrganizationAdmin(req.user.id, orgId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to update this organization' });
      }
    }
    
    // Update schema to allow partial updates
    const updateSchema = insertOrganizationSchema.omit({ owner_id: true }).partial();
    const result = updateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const updatedOrganization = await storage.updateOrganization(orgId, result.data);
    res.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

// Delete an organization
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Only the owner can delete the organization
    if (organization.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the owner can delete an organization' });
    }
    
    await storage.deleteOrganization(orgId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// Get members of an organization
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is a member of this organization
    const isMember = await storage.isOrganizationMember(req.user.id, orgId);
    if (!isMember && organization.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view members of this organization' });
    }
    
    const members = await storage.getOrganizationMembers(orgId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    res.status(500).json({ error: 'Failed to fetch organization members' });
  }
});

// Add a member to an organization
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is the owner or an admin
    const canAddMembers = organization.owner_id === req.user.id || 
                         await storage.isOrganizationAdmin(req.user.id, orgId);
    
    if (!canAddMembers) {
      return res.status(403).json({ error: 'You do not have permission to add members to this organization' });
    }
    
    const addMemberSchema = insertOrganizationMemberSchema.extend({
      invited_by: z.number().optional()
    }).omit({ organization_id: true });
    
    const result = addMemberSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const newMember = await storage.addOrganizationMember({
      ...result.data,
      organization_id: orgId,
      invited_by: req.user.id
    });
    
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error adding organization member:', error);
    res.status(500).json({ error: 'Failed to add organization member' });
  }
});

// Update a member's role in an organization
router.put('/:orgId/members/:memberId', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.orgId);
    const memberId = Number(req.params.memberId);
    
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is the owner or an admin
    const canUpdateMembers = organization.owner_id === req.user.id || 
                           await storage.isOrganizationAdmin(req.user.id, orgId);
    
    if (!canUpdateMembers) {
      return res.status(403).json({ error: 'You do not have permission to update members in this organization' });
    }
    
    const member = await storage.getOrganizationMember(memberId);
    
    if (!member || member.organization_id !== orgId) {
      return res.status(404).json({ error: 'Member not found in this organization' });
    }
    
    // Prevent demoting the owner
    const memberUser = await storage.getUser(member.user_id);
    if (memberUser && memberUser.id === organization.owner_id) {
      return res.status(403).json({ error: 'Cannot change the role of the organization owner' });
    }
    
    const updateSchema = z.object({
      role: z.enum(['admin', 'manager', 'member', 'viewer'])
    });
    
    const result = updateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const updatedMember = await storage.updateOrganizationMemberRole(memberId, result.data.role);
    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating organization member:', error);
    res.status(500).json({ error: 'Failed to update organization member' });
  }
});

// Remove a member from an organization
router.delete('/:orgId/members/:memberId', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.orgId);
    const memberId = Number(req.params.memberId);
    
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    const member = await storage.getOrganizationMember(memberId);
    
    if (!member || member.organization_id !== orgId) {
      return res.status(404).json({ error: 'Member not found in this organization' });
    }
    
    // Allow self-removal, owner removal, or admin removal
    const canRemove = member.user_id === req.user.id || // Self-removal
                     organization.owner_id === req.user.id || // Owner can remove anyone
                     (await storage.isOrganizationAdmin(req.user.id, orgId) && 
                      member.user_id !== organization.owner_id); // Admin can remove non-owners
    
    if (!canRemove) {
      return res.status(403).json({ error: 'You do not have permission to remove this member' });
    }
    
    // Prevent removing the owner
    if (member.user_id === organization.owner_id) {
      return res.status(403).json({ error: 'Cannot remove the organization owner' });
    }
    
    await storage.removeOrganizationMember(memberId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing organization member:', error);
    res.status(500).json({ error: 'Failed to remove organization member' });
  }
});

// Get the teams in an organization
router.get('/:id/teams', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const orgId = Number(req.params.id);
    const organization = await storage.getOrganization(orgId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is a member of this organization
    const isMember = await storage.isOrganizationMember(req.user.id, orgId);
    if (!isMember && organization.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view teams in this organization' });
    }
    
    const teams = await storage.getOrganizationTeams(orgId);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching organization teams:', error);
    res.status(500).json({ error: 'Failed to fetch organization teams' });
  }
});

export default router;