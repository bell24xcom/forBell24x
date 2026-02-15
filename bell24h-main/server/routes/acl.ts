import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth';
import { z } from 'zod';
import { insertAccessControlListSchema, insertAclRuleSchema, insertAclAssignmentSchema } from '@shared/schema';

const router = express.Router();

// Middleware to check if user can manage ACLs
async function canManageACL(req: Request, res: Response, next: Function) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const aclId = parseInt(req.params.id);
  if (isNaN(aclId)) {
    return res.status(400).json({ error: 'Invalid ACL ID' });
  }

  const acl = await storage.getAccessControlList(aclId);
  if (!acl) {
    return res.status(404).json({ error: 'ACL not found' });
  }

  // If ACL belongs to an organization, check if user can manage it
  if (acl.organization_id) {
    const canManage = await storage.canManageOrganization(acl.organization_id, req.user.id);
    if (!canManage) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this ACL' });
    }
  } else {
    // For global ACLs, only system administrators can manage them
    // This is a placeholder for your system's admin check
    const isAdmin = req.user.role === 'admin'; // Example, replace with your actual admin check
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Only administrators can manage global ACLs' });
    }
  }

  next();
}

// Get all ACLs
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
    const acls = await storage.getAccessControlLists(organizationId);
    
    res.status(200).json(acls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ACLs' });
  }
});

// Get a specific ACL
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const acl = await storage.getAccessControlList(id);
    if (!acl) {
      return res.status(404).json({ error: 'ACL not found' });
    }

    res.status(200).json(acl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ACL' });
  }
});

// Create a new ACL
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validationResult = insertAccessControlListSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
    }

    // If ACL is for an organization, check if user can manage it
    if (req.body.organization_id) {
      const canManage = await storage.canManageOrganization(req.body.organization_id, req.user!.id);
      if (!canManage) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to create ACLs for this organization' });
      }
    } else {
      // For global ACLs, only system administrators can create them
      const isAdmin = req.user!.role === 'admin'; // Example, replace with your actual admin check
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can create global ACLs' });
      }
    }

    const newAcl = await storage.createAccessControlList({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(newAcl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ACL' });
  }
});

// Update an ACL
router.put('/:id', isAuthenticated, canManageACL, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const allowedFields = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    });

    const validationResult = allowedFields.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
    }

    const updatedAcl = await storage.updateAccessControlList(id, {
      ...req.body,
      updated_at: new Date()
    });

    res.status(200).json(updatedAcl);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ACL' });
  }
});

// Delete an ACL
router.delete('/:id', isAuthenticated, canManageACL, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    await storage.deleteAccessControlList(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ACL' });
  }
});

// Get all rules for an ACL
router.get('/:id/rules', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const rules = await storage.getAclRules(id);
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ACL rules' });
  }
});

// Add a rule to an ACL
router.post('/:id/rules', isAuthenticated, canManageACL, async (req: Request, res: Response) => {
  try {
    const aclId = parseInt(req.params.id);
    if (isNaN(aclId)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const validationResult = insertAclRuleSchema.safeParse({
      ...req.body,
      acl_id: aclId
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
    }

    const newRule = await storage.createAclRule({
      ...validationResult.data,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(newRule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ACL rule' });
  }
});

// Update a rule
router.put('/rules/:ruleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.ruleId);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    const rule = await storage.getAclRule(ruleId);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Use the canManageACL middleware pattern
    const acl = await storage.getAccessControlList(rule.acl_id);
    if (!acl) {
      return res.status(404).json({ error: 'ACL not found' });
    }

    if (acl.organization_id) {
      const canManage = await storage.canManageOrganization(acl.organization_id, req.user!.id);
      if (!canManage) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this ACL' });
      }
    } else {
      const isAdmin = req.user!.role === 'admin'; // Example, replace with your actual admin check
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can manage global ACLs' });
      }
    }

    const allowedFields = z.object({
      permission: z.enum(['full', 'create', 'read', 'update', 'delete', 'none']).optional(),
    });

    const validationResult = allowedFields.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
    }

    const updatedRule = await storage.updateAclRule(ruleId, {
      ...req.body,
      updated_at: new Date()
    });

    res.status(200).json(updatedRule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ACL rule' });
  }
});

// Delete a rule
router.delete('/rules/:ruleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.ruleId);
    if (isNaN(ruleId)) {
      return res.status(400).json({ error: 'Invalid rule ID' });
    }

    const rule = await storage.getAclRule(ruleId);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Use the canManageACL middleware pattern
    const acl = await storage.getAccessControlList(rule.acl_id);
    if (!acl) {
      return res.status(404).json({ error: 'ACL not found' });
    }

    if (acl.organization_id) {
      const canManage = await storage.canManageOrganization(acl.organization_id, req.user!.id);
      if (!canManage) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this ACL' });
      }
    } else {
      const isAdmin = req.user!.role === 'admin'; // Example, replace with your actual admin check
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can manage global ACLs' });
      }
    }

    await storage.deleteAclRule(ruleId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ACL rule' });
  }
});

// Get all assignments for an ACL
router.get('/:id/assignments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const assignments = await storage.getAclAssignments(id);
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve ACL assignments' });
  }
});

// Add an assignment to an ACL
router.post('/:id/assignments', isAuthenticated, canManageACL, async (req: Request, res: Response) => {
  try {
    const aclId = parseInt(req.params.id);
    if (isNaN(aclId)) {
      return res.status(400).json({ error: 'Invalid ACL ID' });
    }

    const schema = z.object({
      user_id: z.number().optional(),
      team_id: z.number().optional(),
      organization_id: z.number().optional(),
    }).refine(data => data.user_id || data.team_id || data.organization_id, {
      message: 'At least one of user_id, team_id, or organization_id must be provided',
    });

    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid input', details: validationResult.error.errors });
    }

    const newAssignment = await storage.createAclAssignment({
      acl_id: aclId,
      user_id: req.body.user_id,
      team_id: req.body.team_id,
      organization_id: req.body.organization_id,
      created_at: new Date(),
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ACL assignment' });
  }
});

// Delete an assignment
router.delete('/assignments/:assignmentId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    // Find the assignment to get its ACL ID
    const assignment = await storage.getAclAssignment(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check permissions on the ACL
    const acl = await storage.getAccessControlList(assignment.acl_id);
    if (!acl) {
      return res.status(404).json({ error: 'ACL not found' });
    }

    if (acl.organization_id) {
      const canManage = await storage.canManageOrganization(acl.organization_id, req.user!.id);
      if (!canManage) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this ACL' });
      }
    } else {
      const isAdmin = req.user!.role === 'admin'; // Example, replace with your actual admin check
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Only administrators can manage global ACLs' });
      }
    }

    await storage.deleteAclAssignment(assignmentId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ACL assignment' });
  }
});

// Check permissions for a resource
router.get('/check', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const resourceType = req.query.resourceType as string;
    const resourceId = req.query.resourceId ? parseInt(req.query.resourceId as string) : undefined;

    if (!resourceType) {
      return res.status(400).json({ error: 'Resource type is required' });
    }

    const permission = await storage.getEffectivePermission(req.user!.id, resourceType, resourceId);
    
    const response = {
      permission,
      canView: permission === 'full' || permission === 'read' || permission === 'update' || permission === 'create',
      canCreate: permission === 'full' || permission === 'create',
      canUpdate: permission === 'full' || permission === 'update',
      canDelete: permission === 'full' || permission === 'delete',
      canManage: permission === 'full',
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check permissions' });
  }
});

export default router;