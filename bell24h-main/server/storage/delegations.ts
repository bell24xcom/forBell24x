import { db } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface PermissionDelegation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  resource_type: string;
  resource_id?: string;
  permission: string;
  is_active: boolean;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Create a new permission delegation
 */
export async function createDelegation(delegationData: Omit<PermissionDelegation, 'id' | 'created_at' | 'updated_at'>): Promise<PermissionDelegation> {
  const delegationId = uuidv4();
  const now = new Date();
  
  // Check if the delegation already exists
  const existingDelegation = await getDelegation(
    delegationData.from_user_id,
    delegationData.to_user_id,
    delegationData.resource_type,
    delegationData.permission,
    delegationData.resource_id
  );
  
  if (existingDelegation) {
    throw new Error('A similar delegation already exists');
  }
  
  await db.execute(sql`
    INSERT INTO permission_delegations (
      id, from_user_id, to_user_id, resource_type, resource_id, 
      permission, is_active, expires_at, created_at, updated_at
    ) VALUES (
      ${delegationId},
      ${delegationData.from_user_id},
      ${delegationData.to_user_id},
      ${delegationData.resource_type},
      ${delegationData.resource_id || null},
      ${delegationData.permission},
      ${delegationData.is_active},
      ${delegationData.expires_at || null},
      ${now},
      ${now}
    )
  `);
  
  return {
    id: delegationId,
    from_user_id: delegationData.from_user_id,
    to_user_id: delegationData.to_user_id,
    resource_type: delegationData.resource_type,
    resource_id: delegationData.resource_id,
    permission: delegationData.permission,
    is_active: delegationData.is_active,
    expires_at: delegationData.expires_at,
    created_at: now,
    updated_at: now
  };
}

/**
 * Get a specific delegation
 */
export async function getDelegationById(delegationId: string): Promise<PermissionDelegation | null> {
  const result = await db.execute<PermissionDelegation>(sql`
    SELECT * FROM permission_delegations WHERE id = ${delegationId}
  `);
  
  return result[0] || null;
}

/**
 * Get a delegation by its properties
 */
export async function getDelegation(
  fromUserId: string,
  toUserId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<PermissionDelegation | null> {
  const result = await db.execute<PermissionDelegation>(sql`
    SELECT * FROM permission_delegations 
    WHERE from_user_id = ${fromUserId}
    AND to_user_id = ${toUserId}
    AND resource_type = ${resourceType}
    AND permission = ${permission}
    AND (resource_id = ${resourceId} OR (resource_id IS NULL AND ${resourceId} IS NULL))
  `);
  
  return result[0] || null;
}

/**
 * Update a delegation
 */
export async function updateDelegation(
  delegationId: string, 
  updates: Partial<Omit<PermissionDelegation, 'id' | 'from_user_id' | 'to_user_id' | 'resource_type' | 'resource_id' | 'permission' | 'created_at' | 'updated_at'>>
): Promise<PermissionDelegation | null> {
  const now = new Date();
  
  // Check if the delegation exists
  const existingDelegation = await getDelegationById(delegationId);
  if (!existingDelegation) {
    return null;
  }
  
  const updateFields = [];
  const updateValues = [];
  
  if (updates.is_active !== undefined) {
    updateFields.push('is_active = ?');
    updateValues.push(updates.is_active);
  }
  
  if (updates.expires_at !== undefined) {
    updateFields.push('expires_at = ?');
    updateValues.push(updates.expires_at || null);
  }
  
  updateFields.push('updated_at = ?');
  updateValues.push(now);
  
  if (updateFields.length > 0) {
    const updateQuery = `
      UPDATE permission_delegations 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await db.execute(sql.raw(updateQuery, ...updateValues, delegationId));
  }
  
  return getDelegationById(delegationId);
}

/**
 * Delete a delegation
 */
export async function deleteDelegation(delegationId: string): Promise<boolean> {
  const result = await db.execute(sql`
    DELETE FROM permission_delegations WHERE id = ${delegationId}
  `);
  
  return result.rowsAffected > 0;
}

/**
 * Get all delegations from a user
 */
export async function getDelegationsFromUser(userId: string, activeOnly: boolean = true): Promise<PermissionDelegation[]> {
  if (activeOnly) {
    return db.execute<PermissionDelegation>(sql`
      SELECT * FROM permission_delegations 
      WHERE from_user_id = ${userId}
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `);
  } else {
    return db.execute<PermissionDelegation>(sql`
      SELECT * FROM permission_delegations 
      WHERE from_user_id = ${userId}
      ORDER BY created_at DESC
    `);
  }
}

/**
 * Get all delegations to a user
 */
export async function getDelegationsToUser(userId: string, activeOnly: boolean = true): Promise<PermissionDelegation[]> {
  if (activeOnly) {
    return db.execute<PermissionDelegation>(sql`
      SELECT * FROM permission_delegations 
      WHERE to_user_id = ${userId}
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `);
  } else {
    return db.execute<PermissionDelegation>(sql`
      SELECT * FROM permission_delegations 
      WHERE to_user_id = ${userId}
      ORDER BY created_at DESC
    `);
  }
}

/**
 * Check if a user has a delegated permission from another user
 */
export async function hasDelegatedPermission(
  userId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<boolean> {
  const count = await db.execute<{ count: number }>(sql`
    SELECT COUNT(*) as count
    FROM permission_delegations
    WHERE to_user_id = ${userId}
    AND resource_type = ${resourceType}
    AND permission = ${permission}
    AND (resource_id = ${resourceId} OR resource_id IS NULL)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `);
  
  return (count[0]?.count || 0) > 0;
}

/**
 * Get all active delegated permissions for a user
 */
export async function getUserDelegatedPermissions(userId: string): Promise<PermissionDelegation[]> {
  return db.execute<PermissionDelegation>(sql`
    WITH RECURSIVE delegation_chain(from_id, to_id, resource_type, resource_id, permission, level) AS (
      -- Base case: direct delegations to the user
      SELECT from_user_id, to_user_id, resource_type, resource_id, permission, 1
      FROM permission_delegations
      WHERE to_user_id = ${userId}
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      
      UNION ALL
      
      -- Recursive case: follow the chain of delegations
      -- A user can re-delegate permissions they received
      SELECT pd.from_user_id, pd.to_user_id, pd.resource_type, pd.resource_id, pd.permission, dc.level + 1
      FROM permission_delegations pd
      JOIN delegation_chain dc ON pd.to_user_id = dc.from_id
      WHERE pd.is_active = true
      AND (pd.expires_at IS NULL OR pd.expires_at > CURRENT_TIMESTAMP)
      AND pd.resource_type = dc.resource_type
      AND pd.permission = dc.permission
      AND (pd.resource_id = dc.resource_id OR (pd.resource_id IS NULL AND dc.resource_id IS NULL))
      -- Prevent circular delegations
      AND dc.level < 5
    )
    SELECT DISTINCT pd.*
    FROM permission_delegations pd
    JOIN delegation_chain dc ON 
      pd.from_user_id = dc.from_id AND 
      pd.to_user_id = dc.to_id AND
      pd.resource_type = dc.resource_type AND
      pd.permission = dc.permission AND
      (pd.resource_id = dc.resource_id OR (pd.resource_id IS NULL AND dc.resource_id IS NULL))
    WHERE pd.is_active = true
    AND (pd.expires_at IS NULL OR pd.expires_at > CURRENT_TIMESTAMP)
  `);
}

/**
 * Check if a user has a specific permission through team membership or delegation
 */
export async function checkUserPermission(
  userId: string,
  resourceType: string,
  permission: string,
  resourceId?: string
): Promise<boolean> {
  // Import team storage to avoid circular dependencies
  const { userHasPermission } = require('./teams');
  
  // First check team-based permissions
  if (await userHasPermission(userId, resourceType, permission, resourceId)) {
    return true;
  }
  
  // Then check delegated permissions
  return hasDelegatedPermission(userId, resourceType, permission, resourceId);
}
