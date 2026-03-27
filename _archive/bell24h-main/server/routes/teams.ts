import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Create Team schema
const teamSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  organization_id: z.string().uuid(),
  parent_team_id: z.string().uuid().optional(),
});

// Team member schema
const teamMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['leader', 'member']),
});

// Get all teams for the current user
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teams = await storage.getUserTeams(String(req.user.id));
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get a specific team by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user is a member of this team or organization
    const hasAccess = await storage.hasTeamAccess(String(req.user.id), String(teamId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to view this team' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Create a new team
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = teamSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const { organization_id, parent_team_id } = result.data;
    
    // Check if user can create teams in this organization
    const canCreateTeam = await storage.canManageOrganization(String(req.user.id), String(organization_id));
    if (!canCreateTeam) {
      return res.status(403).json({ error: 'You do not have permission to create teams in this organization' });
    }
    
    // If there's a parent team, verify it exists and is in the same organization
    if (parent_team_id) {
      const parentTeam = await storage.getTeam(String(parent_team_id));
      if (!parentTeam || parentTeam.organization_id !== organization_id) {
        return res.status(400).json({ error: 'Invalid parent team' });
      }
      
      // Check max nesting level (prevent too deep hierarchies)
      const teamHierarchyDepth = await storage.getTeamHierarchyDepth(String(parent_team_id));
      if (teamHierarchyDepth >= 5) { // Max 5 levels of nesting
        return res.status(400).json({ error: 'Maximum team hierarchy depth reached' });
      }
    }
    
    const newTeam = await storage.createTeam({
      ...result.data,
      created_by: String(req.user.id)
    });
    
    // Automatically add the creator as a team leader
    await storage.addTeamMember({
      team_id: String(newTeam.id),
      user_id: String(req.user.id),
      role: 'leader',
      added_by: String(req.user.id)
    });
    
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Update a team
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user can manage this team
    const canManageTeam = await storage.canManageTeam(String(req.user.id), String(teamId));
    if (!canManageTeam) {
      return res.status(403).json({ error: 'You do not have permission to update this team' });
    }
    
    // Update schema to allow partial updates
    const updateSchema = teamSchema.omit({ organization_id: true }).partial();
    const result = updateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    // Prevent circular references in parent_team_id
    if (result.data.parent_team_id) {
      const childTeams = await storage.getChildTeams(String(teamId));
      if (childTeams.some(child => child.id === result.data.parent_team_id)) {
        return res.status(400).json({ error: 'Cannot set a child team as the parent' });
      }
      
      // Check max nesting level
      const futureParentDepth = await storage.getTeamHierarchyDepth(String(result.data.parent_team_id));
      const currentTeamChildDepth = await storage.getMaxChildTeamDepth(String(teamId));
      if (futureParentDepth + currentTeamChildDepth >= 5) {
        return res.status(400).json({ error: 'This change would exceed the maximum team hierarchy depth' });
      }
    }
    
    const updatedTeam = await storage.updateTeam(String(teamId), result.data);
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete a team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user can manage this team
    const canManageTeam = await storage.canManageTeam(String(req.user.id), String(teamId));
    if (!canManageTeam) {
      return res.status(403).json({ error: 'You do not have permission to delete this team' });
    }
    
    // Check if team has child teams
    const childTeams = await storage.getChildTeams(String(teamId));
    if (childTeams.length > 0) {
      return res.status(400).json({ error: 'Cannot delete a team with child teams. Please reassign or delete child teams first.' });
    }
    
    await storage.deleteTeam(teamId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Get members of a team
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user has access to view this team
    const hasAccess = await storage.hasTeamAccess(String(req.user.id), String(teamId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to view this team' });
    }
    
    const members = await storage.getTeamMembers(String(teamId));
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Add a member to a team
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user can manage this team
    const canManageTeam = await storage.canManageTeam(String(req.user.id), String(teamId));
    if (!canManageTeam) {
      return res.status(403).json({ error: 'You do not have permission to add members to this team' });
    }
    
    const result = teamMemberSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    // Check if user is a member of the organization
    const isOrgMember = await storage.isOrganizationMember(String(result.data.user_id), String(team.organization_id));
    if (!isOrgMember) {
      return res.status(400).json({ error: 'User must be a member of the organization to join a team' });
    }
    
    // Check if user is already a member
    const isTeamMember = await storage.isTeamMember(String(result.data.user_id), String(teamId));
    if (isTeamMember) {
      return res.status(400).json({ error: 'User is already a member of this team' });
    }
    
    const newMember = await storage.addTeamMember({
      team_id: String(teamId),
      user_id: String(result.data.user_id),
      role: result.data.role,
      added_by: String(req.user.id)
    });
    
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Update a team member's role
router.put('/:teamId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.teamId;
    const userId = req.params.userId;
    
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user can manage this team
    const canManageTeam = await storage.canManageTeam(String(req.user.id), String(teamId));
    if (!canManageTeam) {
      return res.status(403).json({ error: 'You do not have permission to update members in this team' });
    }
    
    // Check if the user is a member of the team
    const member = await storage.getTeamMember(String(teamId), String(userId));
    if (!member) {
      return res.status(404).json({ error: 'User is not a member of this team' });
    }
    
    const updateSchema = z.object({
      role: z.enum(['leader', 'member'])
    });
    
    const result = updateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const updatedMember = await storage.updateTeamMemberRole(String(teamId), String(userId), result.data.role);
    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Remove a member from a team
router.delete('/:teamId/members/:userId', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.teamId;
    const userId = req.params.userId;
    
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if the target user is a member of the team
    const member = await storage.getTeamMember(String(teamId), String(userId));
    if (!member) {
      return res.status(404).json({ error: 'User is not a member of this team' });
    }
    
    // Allow self-removal or if user can manage the team
    const canRemove = String(userId) === String(req.user.id) || await storage.canManageTeam(String(req.user.id), String(teamId));
    if (!canRemove) {
      return res.status(403).json({ error: 'You do not have permission to remove this member' });
    }
    
    // Check if this is the last team leader
    if (member.role === 'leader') {
      const leaders = await storage.getTeamLeaders(String(teamId));
      if (leaders.length <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last team leader. Assign a new leader first.' });
      }
    }
    
    await storage.removeTeamMember(String(teamId), String(userId));
    res.status(204).send();
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// Get child teams of this team
router.get('/:id/teams', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user has access to view this team
    const hasAccess = await storage.hasTeamAccess(String(req.user.id), String(teamId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to view this team' });
    }
    
    const childTeams = await storage.getChildTeams(String(teamId));
    res.json(childTeams);
  } catch (error) {
    console.error('Error fetching child teams:', error);
    res.status(500).json({ error: 'Failed to fetch child teams' });
  }
});

// Get the full team hierarchy tree
router.get('/:id/hierarchy', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const teamId = req.params.id;
    const team = await storage.getTeam(String(teamId));
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Check if user has access to view this team
    const hasAccess = await storage.hasTeamAccess(String(req.user.id), String(teamId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have permission to view this team' });
    }
    
    const hierarchy = await storage.getTeamHierarchy(String(teamId));
    res.json(hierarchy);
  } catch (error) {
    console.error('Error fetching team hierarchy:', error);
    res.status(500).json({ error: 'Failed to fetch team hierarchy' });
  }
});

export default router;
