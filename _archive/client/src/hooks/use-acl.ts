import { useQuery, useMutation } from '@tanstack/react-query';
import { AccessControlList } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Type for the ACL list response
export type AclListResponse = AccessControlList[];

// Type for a single ACL response
export type AclResponse = AccessControlList;

// Type for ACL rule
export interface AclRule {
  id: number;
  acl_id: number;
  resource_type: string;
  permission: 'full' | 'create' | 'read' | 'update' | 'delete' | 'none';
  created_at: string;
  updated_at: string;
}

// Type for the ACL Rule response
export type AclRuleResponse = AclRule[];

// Type for ACL assignment
export interface AclAssignment {
  id: number;
  acl_id: number;
  user_id?: number;
  team_id?: number;
  organization_id?: number;
  created_at: string;
}

// Type for the ACL Assignment response
export type AclAssignmentResponse = AclAssignment[];

// Interface for ACL creation/update data
interface AclData {
  name: string;
  description?: string;
  organization_id?: number;
  is_active?: boolean;
}

// Custom hook to fetch and manage ACLs
export function useACLs(organizationId?: number) {
  const { toast } = useToast();
  const queryKey = organizationId ? ['/api/acl', { organizationId }] : ['/api/acl'];

  // Query to fetch all ACLs
  const {
    data: acls,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AclListResponse>({
    queryKey: queryKey,
  });

  // Mutation to create a new ACL
  const createAclMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      organization_id?: number;
      is_active?: boolean;
    }) => {
      const response = await apiRequest('POST', '/api/acl', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'ACL created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/acl'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create ACL: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to update an existing ACL
  const updateAclMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        name: string;
        description?: string;
        organization_id?: number;
        is_active?: boolean;
      }>;
    }) => {
      const response = await apiRequest('PUT', `/api/acl/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'ACL updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/acl'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update ACL: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete an ACL
  const deleteAclMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/acl/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'ACL deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/acl'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete ACL: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    acls,
    isLoading,
    isError,
    error,
    refetch,
    createAcl: createAclMutation.mutate,
    updateAcl: updateAclMutation.mutate,
    deleteAcl: deleteAclMutation.mutate,
    isCreating: createAclMutation.isPending,
    isUpdating: updateAclMutation.isPending,
    isDeleting: deleteAclMutation.isPending,
  };
}

// Custom hook to fetch and manage a single ACL
export function useACL(id: number) {
  const { toast } = useToast();

  // Query to fetch a single ACL
  const {
    data: acl,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AclResponse>({
    queryKey: [`/api/acl/${id}`],
    enabled: !!id,
  });

  // Query to fetch rules for this ACL
  const {
    data: rules,
    isLoading: isLoadingRules,
    refetch: refetchRules,
  } = useQuery<AclRuleResponse>({
    queryKey: [`/api/acl/${id}/rules`],
    enabled: !!id,
  });

  // Query to fetch assignments for this ACL
  const {
    data: assignments,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useQuery<AclAssignmentResponse>({
    queryKey: [`/api/acl/${id}/assignments`],
    enabled: !!id,
  });

  // Mutation to add a rule to the ACL
  const addRuleMutation = useMutation({
    mutationFn: async (data: { resource_type: string; permission: string }) => {
      const response = await apiRequest('POST', `/api/acl/${id}/rules`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Rule added successfully',
      });
      refetchRules();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to update a rule
  const updateRuleMutation = useMutation({
    mutationFn: async ({ ruleId, data }: { ruleId: number; data: { permission: string } }) => {
      const response = await apiRequest('PUT', `/api/acl/rules/${ruleId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Rule updated successfully',
      });
      refetchRules();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete a rule
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      await apiRequest('DELETE', `/api/acl/rules/${ruleId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Rule deleted successfully',
      });
      refetchRules();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete rule: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to add an assignment to the ACL
  const addAssignmentMutation = useMutation({
    mutationFn: async (data: { user_id?: number; team_id?: number; organization_id?: number }) => {
      const response = await apiRequest('POST', `/api/acl/${id}/assignments`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Assignment added successfully',
      });
      refetchAssignments();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add assignment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete an assignment
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      await apiRequest('DELETE', `/api/acl/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Assignment removed successfully',
      });
      refetchAssignments();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove assignment: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    acl,
    rules,
    assignments,
    isLoading,
    isLoadingRules,
    isLoadingAssignments,
    isError,
    error,
    refetch,
    refetchRules,
    refetchAssignments,
    addRule: addRuleMutation.mutate,
    updateRule: updateRuleMutation.mutate,
    deleteRule: deleteRuleMutation.mutate,
    addAssignment: addAssignmentMutation.mutate,
    deleteAssignment: deleteAssignmentMutation.mutate,
    isAddingRule: addRuleMutation.isPending,
    isUpdatingRule: updateRuleMutation.isPending,
    isDeletingRule: deleteRuleMutation.isPending,
    isAddingAssignment: addAssignmentMutation.isPending,
    isDeletingAssignment: deleteAssignmentMutation.isPending,
  };
}

// Custom hook to check permissions
export function usePermissionCheck() {
  // Query to check permissions for a resource
  const checkPermission = async (resourceType: string, resourceId?: number) => {
    try {
      const url = new URL('/api/acl/check', window.location.origin);
      url.searchParams.append('resourceType', resourceType);
      if (resourceId) {
        url.searchParams.append('resourceId', resourceId.toString());
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 401) {
          return {
            permission: 'none',
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canManage: false,
          };
        }
        throw new Error(`Error checking permissions: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return {
        permission: 'none',
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      };
    }
  };

  return { checkPermission };
}
