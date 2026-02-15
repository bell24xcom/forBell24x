import { useQuery, useMutation } from '@tanstack/react-query';
import { Organization } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Local type definitions
interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Types for API responses
export type OrganizationListResponse = Organization[];
export type OrganizationResponse = Organization;
export type OrganizationMemberListResponse = OrganizationMember[];
export type TeamListResponse = Team[];

/**
 * Hook for managing organizations
 */
export function useOrganizations() {
  const { toast } = useToast();

  // Query to fetch all organizations
  const {
    data: organizations,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrganizationListResponse>({
    queryKey: ['/api/organizations'],
  });

  // Mutation to create a new organization
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      const response = await apiRequest('POST', '/api/organizations', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create organization: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to update an organization
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{ name: string; type: string }>;
    }) => {
      const response = await apiRequest('PUT', `/api/organizations/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update organization: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete an organization
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/organizations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete organization: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    organizations,
    isLoading,
    isError,
    error,
    refetch,
    createOrganization: createMutation.mutate,
    updateOrganization: updateMutation.mutate,
    deleteOrganization: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for managing a specific organization
 */
export function useOrganization(id: number) {
  const { toast } = useToast();

  // Query to fetch a single organization
  const {
    data: organization,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrganizationResponse>({
    queryKey: [`/api/organizations/${id}`],
    enabled: !!id,
  });

  // Query to fetch organization members
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useQuery<OrganizationMemberListResponse>({
    queryKey: [`/api/organizations/${id}/members`],
    enabled: !!id,
  });

  // Query to fetch organization teams
  const {
    data: teams,
    isLoading: isLoadingTeams,
    refetch: refetchTeams,
  } = useQuery<TeamListResponse>({
    queryKey: [`/api/organizations/${id}/teams`],
    enabled: !!id,
  });

  // Mutation to add a member to the organization
  const addMemberMutation = useMutation({
    mutationFn: async (data: { user_id: number; role: string }) => {
      const response = await apiRequest('POST', `/api/organizations/${id}/members`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });
      refetchMembers();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add member: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to update a member's role
  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const response = await apiRequest('PUT', `/api/organizations/${id}/members/${memberId}`, {
        role,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
      refetchMembers();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update member role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to remove a member from the organization
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest('DELETE', `/api/organizations/${id}/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      refetchMembers();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to remove member: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    organization,
    members,
    teams,
    isLoading,
    isLoadingMembers,
    isLoadingTeams,
    isError,
    error,
    refetch,
    refetchMembers,
    refetchTeams,
    addMember: addMemberMutation.mutate,
    updateMemberRole: updateMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    isUpdatingMember: updateMemberMutation.isPending,
    isRemovingMember: removeMemberMutation.isPending,
  };
}

/**
 * Hook for managing organization teams
 */
export function useOrganizationTeams(organizationId: number) {
  const { toast } = useToast();

  // Query to fetch organization teams
  const {
    data: teams,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TeamListResponse>({
    queryKey: [`/api/organizations/${organizationId}/teams`],
    enabled: !!organizationId,
  });

  // Mutation to create a new team
  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; lead_id?: number }) => {
      const response = await apiRequest('POST', `/api/organizations/${organizationId}/teams`, {
        ...data,
        organization_id: organizationId,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Team created successfully',
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${organizationId}/teams`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create team: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    teams,
    isLoading,
    isError,
    error,
    refetch,
    createTeam: createTeamMutation.mutate,
    isCreatingTeam: createTeamMutation.isPending,
  };
}
