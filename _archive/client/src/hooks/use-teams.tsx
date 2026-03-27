import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { useWebSocket } from './use-websocket';
import axios from 'axios';

interface Team {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
  parent_team_id: number | null;
  lead_id: number;
  hierarchy_level: number;
  path: string;
  created_at: string;
}

interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: 'leader' | 'member';
  added_by: number;
  joined_at: string;
  inherited_from_team_id: number | null;
  inherited_role: string | null;
  username: string;
  email: string;
}

interface TeamHierarchyNode extends Team {
  children: TeamHierarchyNode[];
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<number, TeamMember[]>>({});
  const [teamHierarchy, setTeamHierarchy] = useState<TeamHierarchyNode | null>(null);
  const [childTeams, setChildTeams] = useState<Record<number, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    onMessage: message => {
      if (message.type === 'team_update') {
        fetchUserTeams();
      } else if (message.type === 'team_member_update' && message.teamId) {
        fetchTeamMembers(message.teamId);
      }
    },
  });

  // Fetch user's teams
  const fetchUserTeams = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch teams: ' + (err.response?.data?.error || err.message));
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch a specific team
  const fetchTeam = useCallback(
    async (teamId: number) => {
      if (!user) return null;

      try {
        const response = await axios.get(`/api/teams/${teamId}`);
        return response.data;
      } catch (err: any) {
        setError('Failed to fetch team: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to fetch team details',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, toast]
  );

  // Fetch team members
  const fetchTeamMembers = useCallback(
    async (teamId: number) => {
      if (!user) return;

      try {
        const response = await axios.get(`/api/teams/${teamId}/members`);
        setTeamMembers(prev => ({
          ...prev,
          [teamId]: response.data,
        }));
        return response.data;
      } catch (err: any) {
        setError('Failed to fetch team members: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to fetch team members',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  // Fetch child teams
  const fetchChildTeams = useCallback(
    async (teamId: number) => {
      if (!user) return;

      try {
        const response = await axios.get(`/api/teams/${teamId}/teams`);
        setChildTeams(prev => ({
          ...prev,
          [teamId]: response.data,
        }));
        return response.data;
      } catch (err: any) {
        setError('Failed to fetch child teams: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to fetch child teams',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  // Fetch team hierarchy
  const fetchTeamHierarchy = useCallback(
    async (teamId: number) => {
      if (!user) return;

      try {
        const response = await axios.get(`/api/teams/${teamId}/hierarchy`);
        setTeamHierarchy(response.data);
        return response.data;
      } catch (err: any) {
        setError('Failed to fetch team hierarchy: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to fetch team hierarchy',
          variant: 'destructive',
        });
      }
    },
    [user, toast]
  );

  // Create a new team
  const createTeam = useCallback(
    async (data: {
      name: string;
      description?: string;
      organization_id: number;
      parent_team_id?: number;
    }) => {
      if (!user) return null;

      try {
        const response = await axios.post('/api/teams', data);
        fetchUserTeams(); // Refresh teams list
        toast({
          title: 'Success',
          description: 'Team created successfully',
        });
        return response.data;
      } catch (err: any) {
        setError('Failed to create team: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to create team',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, fetchUserTeams, toast]
  );

  // Update an existing team
  const updateTeam = useCallback(
    async (
      teamId: number,
      data: {
        name?: string;
        description?: string;
        parent_team_id?: number | null;
      }
    ) => {
      if (!user) return null;

      try {
        const response = await axios.put(`/api/teams/${teamId}`, data);

        // Update local state
        setTeams(teams =>
          teams.map(team => (team.id === teamId ? { ...team, ...response.data } : team))
        );

        if (teamHierarchy && teamHierarchy.id === teamId) {
          setTeamHierarchy({ ...teamHierarchy, ...response.data });
        }

        toast({
          title: 'Success',
          description: 'Team updated successfully',
        });
        return response.data;
      } catch (err: any) {
        setError('Failed to update team: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to update team',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, teams, teamHierarchy, toast]
  );

  // Delete a team
  const deleteTeam = useCallback(
    async (teamId: number) => {
      if (!user) return false;

      try {
        await axios.delete(`/api/teams/${teamId}`);

        // Update local state
        setTeams(teams => teams.filter(team => team.id !== teamId));

        // Clear related data
        const newTeamMembers = { ...teamMembers };
        delete newTeamMembers[teamId];
        setTeamMembers(newTeamMembers);

        const newChildTeams = { ...childTeams };
        delete newChildTeams[teamId];
        setChildTeams(newChildTeams);

        if (teamHierarchy && teamHierarchy.id === teamId) {
          setTeamHierarchy(null);
        }

        toast({
          title: 'Success',
          description: 'Team deleted successfully',
        });
        return true;
      } catch (err: any) {
        setError('Failed to delete team: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to delete team',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, teams, teamMembers, childTeams, teamHierarchy, toast]
  );

  // Add member to team
  const addTeamMember = useCallback(
    async (
      teamId: number,
      data: {
        user_id: number;
        role: 'leader' | 'member';
      }
    ) => {
      if (!user) return null;

      try {
        const response = await axios.post(`/api/teams/${teamId}/members`, data);

        // Update local state
        setTeamMembers(prev => ({
          ...prev,
          [teamId]: [...(prev[teamId] || []), response.data],
        }));

        toast({
          title: 'Success',
          description: 'Team member added successfully',
        });
        return response.data;
      } catch (err: any) {
        setError('Failed to add team member: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to add team member',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, toast]
  );

  // Update team member role
  const updateTeamMemberRole = useCallback(
    async (teamId: number, userId: number, role: 'leader' | 'member') => {
      if (!user) return null;

      try {
        const response = await axios.put(`/api/teams/${teamId}/members/${userId}`, { role });

        // Update local state
        setTeamMembers(prev => ({
          ...prev,
          [teamId]: (prev[teamId] || []).map(member =>
            member.user_id === userId ? { ...member, role } : member
          ),
        }));

        toast({
          title: 'Success',
          description: 'Team member role updated',
        });
        return response.data;
      } catch (err: any) {
        setError(
          'Failed to update team member role: ' + (err.response?.data?.error || err.message)
        );
        toast({
          title: 'Error',
          description: 'Failed to update team member role',
          variant: 'destructive',
        });
        return null;
      }
    },
    [user, toast]
  );

  // Remove team member
  const removeTeamMember = useCallback(
    async (teamId: number, userId: number) => {
      if (!user) return false;

      try {
        await axios.delete(`/api/teams/${teamId}/members/${userId}`);

        // Update local state
        setTeamMembers(prev => ({
          ...prev,
          [teamId]: (prev[teamId] || []).filter(member => member.user_id !== userId),
        }));

        toast({
          title: 'Success',
          description: 'Team member removed',
        });
        return true;
      } catch (err: any) {
        setError('Failed to remove team member: ' + (err.response?.data?.error || err.message));
        toast({
          title: 'Error',
          description: 'Failed to remove team member',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, toast]
  );

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen for WebSocket updates on teams
  useEffect(() => {
    if (!user) return;

    // WebSocket updates are handled in the useWebSocket hook's onMessage callback
    // No need for additional event listeners here
  }, [user, fetchUserTeams, fetchTeamMembers]);

  // Fetch teams on initial load
  useEffect(() => {
    if (user) {
      fetchUserTeams();
    }
  }, [user, fetchUserTeams]);

  return {
    teams,
    teamMembers,
    teamHierarchy,
    childTeams,
    loading,
    error,
    clearError,
    fetchUserTeams,
    fetchTeam,
    fetchTeamMembers,
    fetchChildTeams,
    fetchTeamHierarchy,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
  };
}
