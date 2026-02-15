import { db } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from '../types/db-types';

export interface Team {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  parent_team_id?: string;
  hierarchy_path?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  is_team_admin: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface TeamPermission {
  id: string;
  team_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EffectivePermission {
  user_id: string;
  team_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  inheritance_level: number;
}

/**
 * Create a new team
 */
export async function createTeam(teamData: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'hierarchy_path'>): Promise<Team> {
  const teamId = uuidv4();
  const now = new Date();
  
  let hierarchyPath = teamId;
  
  // If this team has a parent, we need to calculate the hierarchy path
  if (teamData.parent_team_id) {
    const parentTeam = await getTeam(teamData.parent_team_id);
    if (!parentTeam) {
      throw new Error(`Parent team with ID ${teamData.parent_team_id} not found`);
    }
    
    hierarchyPath = parentTeam.hierarchy_path 
      ? `${parentTeam.hierarchy_path}.${teamId}` 
      : `${parentTeam.id}.${teamId}`;
  }
  
  await db.execute(sql`
    INSERT INTO teams (
      id, name, description, organization_id, parent_team_id, hierarchy_path, created_at, updated_at
    ) VALUES (
      ${teamId},
      ${teamData.name},
      ${teamData.description || null},
      ${teamData.organization_id},
      ${teamData.parent_team_id || null},
      ${hierarchyPath},
      ${now},
      ${now}
    )
  `);
  
  return {
    id: teamId,
    name: teamData.name,
    description: teamData.description,
    organization_id: teamData.organization_id,
    parent_team_id: teamData.parent_team_id,
    hierarchy_path: hierarchyPath,
    created_at: now,
    updated_at: now
  };
}

/**
 * Update an existing team
 */
export async function updateTeam(teamId: string, teamData: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at' | 'hierarchy_path'>>): Promise<Team | null> {
  const now = new Date();
  
  // Check if the team exists
  const existingTeam = await getTeam(String(teamId));
  if (!existingTeam) {
    return null;
  }
  
  // Handle parent team changes and hierarchy path updates
  let hierarchyPath = existingTeam.hierarchy_path;
  if (teamData.parent_team_id !== undefined && String(teamData.parent_team_id) !== String(existingTeam.parent_team_id)) {
    if (teamData.parent_team_id) {
      // Changing to a new parent
      const parentTeam = await getTeam(String(teamData.parent_team_id));
      if (!parentTeam) {
        throw new Error(`Parent team with ID ${teamData.parent_team_id} not found`);
      }
      
      // Ensure no circular references
      if (await isDescendantOfTeam(String(parentTeam.id), String(teamId))) {
        throw new Error('Cannot set parent team to a descendant of this team (circular reference)');
      }
      
      hierarchyPath = parentTeam.hierarchy_path 
        ? `${parentTeam.hierarchy_path}.${String(teamId)}` 
        : `${parentTeam.id}.${String(teamId)}`;
    } else {
      // Removing parent
      hierarchyPath = teamId;
    }
    
    // Update all child teams' hierarchy paths recursively
    await updateChildTeamPaths(String(teamId), hierarchyPath);
  }
  
  // Use separate SQL queries for each field to avoid TypeScript issues with sql.raw
  const updates = [];
  
  if (teamData.name !== undefined) {
    updates.push(db.execute(sql`UPDATE teams SET name = ${teamData.name} WHERE id = ${String(teamId)}`));
  }
  
  if (teamData.description !== undefined) {
    updates.push(db.execute(sql`UPDATE teams SET description = ${teamData.description || null} WHERE id = ${String(teamId)}`));
  }
  
  if (teamData.organization_id !== undefined) {
    updates.push(db.execute(sql`UPDATE teams SET organization_id = ${String(teamData.organization_id)} WHERE id = ${String(teamId)}`));
  }
  
  if (teamData.parent_team_id !== undefined) {
    updates.push(db.execute(sql`
      UPDATE teams 
      SET parent_team_id = ${teamData.parent_team_id ? String(teamData.parent_team_id) : null},
          hierarchy_path = ${hierarchyPath}
      WHERE id = ${teamId}
    `));
  }
  
  // Always update the updated_at timestamp
  updates.push(db.execute(sql`UPDATE teams SET updated_at = ${now} WHERE id = ${teamId}`));
  
  if (updates.length > 0) {
    await Promise.all(updates);
  }
  
  // Get the updated team
  return getTeam(teamId);
}

/**
 * Get a team by ID
 */
export async function getTeam(teamId: string): Promise<Team | null> {
  const result = await db.execute<Team>(sql`
    SELECT * FROM teams WHERE id = ${String(teamId)}
  `);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<boolean> {
  // Check if the team has any child teams
  const childTeams = await getChildTeams(String(teamId));
  if (childTeams.length > 0) {
    throw new Error('Cannot delete team with child teams. Please reassign or delete child teams first.');
  }
  
  await db.execute(sql`DELETE FROM teams WHERE id = ${String(teamId)}`);
  
  // Check if team still exists to determine success
  const team = await getTeam(String(teamId));
  return team === null;
}

/**
 * Get all teams in an organization
 */
export async function getTeamsByOrganization(organizationId: string): Promise<Team[]> {
  const result = await db.execute<Team>(sql`
    SELECT * FROM teams WHERE organization_id = ${String(organizationId)} ORDER BY name
  `);
  
  return result;
}

/**
 * Get immediate child teams of a parent team
 */
export async function getChildTeams(parentTeamId: string): Promise<Team[]> {
  const result = await db.execute<Team>(sql`
    SELECT * FROM teams WHERE parent_team_id = ${String(parentTeamId)} ORDER BY name
  `);
  
  return result;
}

/**
 * Get all teams in the hierarchy below a given team (recursive)
 */
export async function getAllDescendantTeams(teamId: string): Promise<Team[]> {
  const team = await getTeam(String(teamId));
  if (!team || !team.hierarchy_path) {
    return [];
  }
  
  const result = await db.execute<Team>(sql`
    SELECT * FROM teams 
    WHERE hierarchy_path LIKE ${team.hierarchy_path + '%'} 
    AND id != ${String(teamId)}
    ORDER BY hierarchy_path
  `);
  
  return result;
}

/**
 * Check if a team is a descendant of another team
 */
export async function isDescendantOfTeam(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
  const descendant = await getTeam(String(potentialDescendantId));
  if (!descendant || !descendant.hierarchy_path) {
    return false;
  }
  
  // Check if the hierarchy path contains the ancestor ID
  const pathParts = descendant.hierarchy_path.split('.');
  return pathParts.includes(String(ancestorId));
}

/**
 * Update hierarchy paths for all descendant teams when a parent team's path changes
 */
async function updateChildTeamPaths(teamId: string, newParentPath: string): Promise<void> {
  const childTeams = await getChildTeams(String(teamId));
  
  for (const childTeam of childTeams) {
    const childPath = `${newParentPath}.${childTeam.id}`;
    
    await db.execute(sql`
      UPDATE teams SET hierarchy_path = ${childPath} WHERE id = ${String(childTeam.id)}
    `);
    
    // Recursively update all descendants
    await updateChildTeamPaths(String(childTeam.id), childPath);
  }
}

/**
 * Add a user to a team
 */
export async function addTeamMember(teamId: string, userId: string, role: string, isTeamAdmin: boolean = false): Promise<TeamMember> {
  const memberId = uuidv4();
  const now = new Date();
  
  // Check if the user is already a member of this team
  const existingMember = await getTeamMember(String(teamId), String(userId));
  if (existingMember) {
    throw new Error(`User ${userId} is already a member of team ${teamId}`);
  }
  
  await db.execute(sql`
    INSERT INTO team_members (
      id, team_id, user_id, role, is_team_admin, created_at, updated_at
    ) VALUES (
      ${memberId},
      ${String(teamId)},
      ${String(userId)},
      ${role},
      ${isTeamAdmin},
      ${now},
      ${now}
    )
  `);
  
  return {
    id: memberId,
    team_id: String(teamId),
    user_id: String(userId),
    role,
    is_team_admin: isTeamAdmin,
    created_at: now,
    updated_at: now
  };
}

/**
 * Update a team member's role or admin status
 */
export async function updateTeamMember(
  teamId: string, 
  userId: string, 
  updates: { role?: string; isTeamAdmin?: boolean }
): Promise<TeamMember | null> {
  const now = new Date();
  
  // Check if the user is a member of this team
  const existingMember = await getTeamMember(teamId, userId);
  if (!existingMember) {
    return null;
  }
  
  // Use separate SQL queries for each field
  const updatePromises: Promise<any>[] = [];
  
  if (updates.role !== undefined) {
    updatePromises.push(db.execute(sql`
      UPDATE team_members 
      SET role = ${updates.role}
      WHERE team_id = ${teamId} AND user_id = ${userId}
    `));
  }
  
  if (updates.isTeamAdmin !== undefined) {
    updatePromises.push(db.execute(sql`
      UPDATE team_members 
      SET is_team_admin = ${updates.isTeamAdmin}
      WHERE team_id = ${teamId} AND user_id = ${userId}
    `));
  }
  
  // Always update the timestamp
  updatePromises.push(db.execute(sql`
    UPDATE team_members 
    SET updated_at = ${now}
    WHERE team_id = ${teamId} AND user_id = ${userId}
  `));
  
  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }
  
  return getTeamMember(teamId, userId);
}
/**
 * Remove a user from a team
 */
export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  await db.execute(sql`
    DELETE FROM team_members 
    WHERE team_id = ${teamId} AND user_id = ${userId}
  `);
  
  // Check if the member still exists to determine success
  const member = await getTeamMember(teamId, userId);
  return member === null;
}

/**
 * Get a specific team member
 */
export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
  const result = await db.execute<TeamMember>(sql`
    SELECT * FROM team_members 
    WHERE team_id = ${teamId} AND user_id = ${userId}
  `);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const result = await db.execute<TeamMember>(sql`
    SELECT * FROM team_members WHERE team_id = ${teamId}
  `);
  
  return result;
}

/**
 * Get all teams a user is a direct member of
 */
export async function getUserTeams(userId: string): Promise<Team[]> {
  const result = await db.execute<Team>(sql`
    SELECT t.* 
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ${userId}
    ORDER BY t.name
  `);
  
  return result;
}

/**
 * Get all teams a user has access to (including via hierarchy)
 */
export async function getUserEffectiveTeams(userId: string): Promise<Team[]> {
  const result = await db.execute<Team>(sql`
    WITH RECURSIVE user_team_hierarchy AS (
      -- Base case: direct memberships
      SELECT t.*, 0 as level
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ${userId}
      
      UNION ALL
      
      -- Recursive case: parent teams
      SELECT p.*, h.level + 1
      FROM user_team_hierarchy h
      JOIN teams p ON p.id = h.parent_team_id
      WHERE h.parent_team_id IS NOT NULL
    )
    SELECT id, name, description, organization_id, parent_team_id, hierarchy_path, created_at, updated_at
    FROM user_team_hierarchy
    ORDER BY level, name
  `);
  
  return result;
}

/**
 * Add a permission to a team
 */
export async function addTeamPermission(
  teamId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<TeamPermission> {
  const permissionId = uuidv4();
  const now = new Date();
  
  await db.execute(sql`
    INSERT INTO team_permissions (
      id, team_id, resource_type, resource_id, permission, created_at, updated_at
    ) VALUES (
      ${permissionId},
      ${teamId},
      ${resourceType},
      ${resourceId || null},
      ${permission},
      ${now},
      ${now}
    )
  `);
  
  return {
    id: permissionId,
    team_id: teamId,
    resource_type: resourceType,
    resource_id: resourceId,
    permission,
    created_at: now,
    updated_at: now
  };
}

/**
 * Remove a permission from a team
 */
export async function removeTeamPermission(
  teamId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<boolean> {
  const result = await db.execute(sql`
    DELETE FROM team_permissions 
    WHERE team_id = ${teamId} 
    AND resource_type = ${resourceType}
    AND permission = ${permission}
    AND (resource_id = ${resourceId} OR (resource_id IS NULL AND ${resourceId} IS NULL))
  `);
  
  return result.rowsAffected > 0;
}

/**
 * Get all permissions for a team
 */
export async function getTeamPermissions(teamId: string): Promise<TeamPermission[]> {
  const result = await db.execute<TeamPermission>(sql`
    SELECT * FROM team_permissions WHERE team_id = ${teamId}
  `);
  
  return result;
}

/**
 * Get all effective permissions for a user
 */
export async function getUserEffectivePermissions(userId: string): Promise<EffectivePermission[]> {
  const result = await db.execute<EffectivePermission>(sql`
    SELECT * FROM effective_user_permissions WHERE user_id = ${userId}
  `);
  
  return result;
}

/**
 * Check if a user has a specific permission on a resource
 */
export async function userHasPermission(
  userId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<boolean> {
  // First check if the user has a specific permission for this resource
  if (resourceId) {
    const specificPermission = await db.execute<{ count: number }>(sql`
      SELECT COUNT(*) as count
      FROM effective_user_permissions
      WHERE user_id = ${userId}
      AND resource_type = ${resourceType}
      AND permission = ${permission}
      AND resource_id = ${resourceId}
    `);
    
    if (specificPermission[0]?.count > 0) {
      return true;
    }
  }
  
  // Then check if the user has a global permission for this resource type
  const globalPermission = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count
    FROM effective_user_permissions
    WHERE user_id = ${userId}
    AND resource_type = ${resourceType}
    AND permission = ${permission}
    AND resource_id IS NULL
  `);
  
  return globalPermission[0]?.count > 0;
}

/**
 * Get the team hierarchy as a tree structure
 */
export async function getTeamHierarchy(organizationId: string): Promise<any> {
  // Get all teams for the organization
  const teams = await getTeamsByOrganization(organizationId);
  
  // Build a map of parent to children
  const teamMap = new Map();
  
  // First initialize with empty children arrays
  teams.forEach(team => {
    teamMap.set(team.id, {
      ...team,
      children: []
    });
  });
  
  // Then populate children
  const rootTeams: any[] = [];
  
  teams.forEach(team => {
    if (team.parent_team_id && teamMap.has(team.parent_team_id)) {
      const parent = teamMap.get(team.parent_team_id);
      parent.children.push(teamMap.get(team.id));
    } else if (!team.parent_team_id) {
      rootTeams.push(teamMap.get(team.id));
    }
  });
  
  return rootTeams;
}

/**
 * Get a team's path from root, as an array of teams
 */
export async function getTeamPath(teamId: string): Promise<Team[]> {
  const team = await getTeam(teamId);
  if (!team) {
    return [];
  }
  
  if (!team.hierarchy_path) {
    return [team];
  }
  
  const teamIds = team.hierarchy_path.split('.');
  const teams = await Promise.all(teamIds.map(id => getTeam(id)));
  
  // Filter out any null values and ensure correct order
  return teams.filter(Boolean) as Team[];
}
