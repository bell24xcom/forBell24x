import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../storage';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Schema for creating a team
const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  description: z.string().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
  parent_team_id: z.string().uuid('Invalid parent team ID').optional(),
});

// Schema for updating a team
const updateTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').optional(),
  description: z.string().optional(),
  organization_id: z.string().uuid('Invalid organization ID').optional(),
  parent_team_id: z.string().uuid('Invalid parent team ID').optional().nullable(),
});

// Schema for adding/updating team members
const teamMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'member', 'viewer']),
  is_team_admin: z.boolean().default(false),
});

// Schema for adding team permissions
const teamPermissionSchema = z.object({
  resource_type: z.string().min(1),
  resource_id: z.string().optional(),
  permission: z.string().min(1),
});

/**
 * Create a new team
 * POST /api/teams
 */
router.post('/', authenticate, validateRequest(createTeamSchema), async (req, res) => {
  try {
    const teamData = req.body;
    
    // Check if the user has permission to create teams in this organization
    const hasPermission = await storage.userHasPermission(
      req.user!.id,
      'organization',
      'create_team',
      teamData.organization_id
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'You do not have permission to create teams in this organization'
      });
    }
    
    // If a parent team is specified, check if the user has admin access to it
    if (teamData.parent_team_id) {
      const isTeamAdmin = await storage.getTeamMember(teamData.parent_team_id, req.user!.id)
        .then(member => member?.is_team_admin || false);
      
      if (!isTeamAdmin) {
        return res.status(403).json({
          error: 'You do not have admin permission for the parent team'
        });
      }
    }
    
    // Create the team
    const team = await storage.createTeam(teamData);
    
    // Add the creating user as a team admin
    await storage.addTeamMember(team.id, req.user!.id, 'admin', true);
    
    res.status(201).json(team);
  } catch (error: any) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: error.message || 'Failed to create team' });
  }
});

/**
 * Get a team by ID
 * GET /api/teams/:id
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Check if user is a member of this team or its parent
    const userTeams = await storage.getUserEffectiveTeams(req.user!.id);
    const isMember = userTeams.some(team => team.id === teamId);
    
    if (!isMember) {
      return res.status(403).json({
        error: 'You do not have access to this team'
      });
    }
    
    const team = await storage.getTeam(teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Get team members
    const members = await storage.getTeamMembers(teamId);
    
    // Get child teams
    const childTeams = await storage.getChildTeams(teamId);
    
    // Get team permissions
    const permissions = await storage.getTeamPermissions(teamId);
    
    res.json({
      ...team,
      members,
      childTeams,
      permissions
    });
  } catch (error: any) {
    console.error('Error getting team:', error);
    res.status(500).json({ error: error.message || 'Failed to get team' });
  }
});

/**
 * Update a team
 * PUT /api/teams/:id
 */
router.put('/:id', authenticate, validateRequest(updateTeamSchema), async (req, res) => {
  try {
    const teamId = req.params.id;
    const updateData = req.body;
    
    // Check if user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // If changing parent team, check additional permissions
    if (updateData.parent_team_id !== undefined) {
      // If setting a new parent, check if user has admin access to the new parent
      if (updateData.parent_team_id) {
        const isParentAdmin = await storage.getTeamMember(updateData.parent_team_id, req.user!.id)
          .then(member => member?.is_team_admin || false);
        
        if (!isParentAdmin) {
          return res.status(403).json({
            error: 'You do not have admin permission for the new parent team'
          });
        }
      }
    }
    
    const updatedTeam = await storage.updateTeam(teamId, updateData);
    
    if (!updatedTeam) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.json(updatedTeam);
  } catch (error: any) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: error.message || 'Failed to update team' });
  }
});

/**
 * Delete a team
 * DELETE /api/teams/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Check if user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Check if team has child teams
    const childTeams = await storage.getChildTeams(teamId);
    
    if (childTeams.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete team with child teams. Please reassign or delete child teams first.'
      });
    }
    
    const success = await storage.deleteTeam(teamId);
    
    if (!success) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: error.message || 'Failed to delete team' });
  }
});

/**
 * Get teams for an organization
 * GET /api/teams/organization/:id
 */
router.get('/organization/:id', authenticate, async (req, res) => {
  try {
    const organizationId = req.params.id;
    
    // Check if the user has permission to view teams in this organization
    const hasPermission = await storage.userHasPermission(
      req.user!.id,
      'organization',
      'view',
      organizationId
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'You do not have permission to view teams in this organization'
      });
    }
    
    // Get all teams for the organization
    const teams = await storage.getTeamsByOrganization(organizationId);
    
    // Get team hierarchy
    const hierarchy = await storage.getTeamHierarchy(organizationId);
    
    res.json({
      teams,
      hierarchy
    });
  } catch (error: any) {
    console.error('Error getting organization teams:', error);
    res.status(500).json({ error: error.message || 'Failed to get organization teams' });
  }
});

/**
 * Get teams for the current user
 * GET /api/teams/my-teams
 */
router.get('/my-teams', authenticate, async (req, res) => {
  try {
    // Get teams where the user is a direct member
    const directTeams = await storage.getUserTeams(req.user!.id);
    
    // Get all teams the user has access to (including via hierarchy)
    const effectiveTeams = await storage.getUserEffectiveTeams(req.user!.id);
    
    res.json({
      directTeams,
      effectiveTeams
    });
  } catch (error: any) {
    console.error('Error getting user teams:', error);
    res.status(500).json({ error: error.message || 'Failed to get user teams' });
  }
});

/**
 * Add a member to a team
 * POST /api/teams/:id/members
 */
router.post('/:id/members', authenticate, validateRequest(teamMemberSchema), async (req, res) => {
  try {
    const teamId = req.params.id;
    const { user_id, role, is_team_admin } = req.body;
    
    // Check if the current user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Add the member
    const newMember = await storage.addTeamMember(teamId, user_id, role, is_team_admin);
    
    res.status(201).json(newMember);
  } catch (error: any) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: error.message || 'Failed to add team member' });
  }
});

/**
 * Update a team member
 * PUT /api/teams/:id/members/:userId
 */
router.put('/:id/members/:userId', authenticate, validateRequest(teamMemberSchema), async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;
    const { role, is_team_admin } = req.body;
    
    // Check if the current user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Prevent removing the last team admin
    if (teamMember.user_id === userId && !is_team_admin) {
      const teamAdmins = await storage.getTeamMembers(teamId)
        .then(members => members.filter(m => m.is_team_admin));
      
      if (teamAdmins.length <= 1) {
        return res.status(400).json({
          error: 'Cannot remove the last team admin. Promote another member to admin first.'
        });
      }
    }
    
    // Update the member
    const updatedMember = await storage.updateTeamMember(teamId, userId, { role, isTeamAdmin: is_team_admin });
    
    if (!updatedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.json(updatedMember);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: error.message || 'Failed to update team member' });
  }
});

/**
 * Remove a member from a team
 * DELETE /api/teams/:id/members/:userId
 */
router.delete('/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;
    
    // Check if the current user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Prevent removing the last team admin
    if (teamMember.user_id === userId) {
      const teamAdmins = await storage.getTeamMembers(teamId)
        .then(members => members.filter(m => m.is_team_admin));
      
      if (teamAdmins.length <= 1) {
        return res.status(400).json({
          error: 'Cannot remove the last team admin. Promote another member to admin first.'
        });
      }
    }
    
    // Remove the member
    const success = await storage.removeTeamMember(teamId, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: error.message || 'Failed to remove team member' });
  }
});

/**
 * Add a permission to a team
 * POST /api/teams/:id/permissions
 */
router.post('/:id/permissions', authenticate, validateRequest(teamPermissionSchema), async (req, res) => {
  try {
    const teamId = req.params.id;
    const { resource_type, resource_id, permission } = req.body;
    
    // Check if the current user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Add the permission
    const newPermission = await storage.addTeamPermission(teamId, resource_type, permission, resource_id);
    
    res.status(201).json(newPermission);
  } catch (error: any) {
    console.error('Error adding team permission:', error);
    res.status(500).json({ error: error.message || 'Failed to add team permission' });
  }
});

/**
 * Remove a permission from a team
 * DELETE /api/teams/:id/permissions
 */
router.delete('/:id/permissions', authenticate, validateRequest(teamPermissionSchema), async (req, res) => {
  try {
    const teamId = req.params.id;
    const { resource_type, resource_id, permission } = req.body;
    
    // Check if the current user is a team admin
    const teamMember = await storage.getTeamMember(teamId, req.user!.id);
    
    if (!teamMember || !teamMember.is_team_admin) {
      return res.status(403).json({
        error: 'You do not have admin permission for this team'
      });
    }
    
    // Remove the permission
    const success = await storage.removeTeamPermission(teamId, resource_type, permission, resource_id);
    
    if (!success) {
      return res.status(404).json({ error: 'Team permission not found' });
    }
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error removing team permission:', error);
    res.status(500).json({ error: error.message || 'Failed to remove team permission' });
  }
});

export default router;
