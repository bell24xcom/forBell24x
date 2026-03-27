import { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from './useAuth.js';

// Permission type (consistent with ACL schema)
export type PermissionType = 'full' | 'create' | 'read' | 'update' | 'delete' | 'none';

// User role type
export type UserRole = 'admin' | 'manager' | 'member' | 'guest';

// ACL permission response type
interface AclPermission {
  permission: PermissionType;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// Permission context type
interface PermissionContextType {
  loading: boolean;
  userRole: UserRole;
  permissions: Record<string, AclPermission>;
  hasPermission: (resourceType: string, action: string) => boolean;
  hasFullAccess: (resourceType: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

// Create permission context
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Permission provider component
export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [permissions, setPermissions] = useState<Record<string, AclPermission>>({});

  // Fetch user permissions on auth change
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshPermissions();
    } else {
      setLoading(false);
      setUserRole('guest');
      setPermissions({});
    }
  }, [isAuthenticated, user]);

  // Refresh permissions from the server
  const refreshPermissions = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setUserRole('guest');
      setPermissions({});
      return;
    }

    setLoading(true);
    try {
      // Fetch user permissions from API
      const response = await fetch('/api/acl/my-permissions');

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();

      // Get the user role
      setUserRole(data.role || 'guest');

      // Process permissions into a map for easy lookup
      const permissionsMap: Record<string, AclPermission> = {};

      data.permissions.forEach((permission: any) => {
        permissionsMap[permission.resourceType] = {
          permission: permission.permission,
          canView: permission.canView,
          canCreate: permission.canCreate,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
          canManage: permission.canManage,
        };
      });

      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Set default guest permissions
      setUserRole('guest');
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission for an action on a resource
  const hasPermission = (resourceType: string, action: string): boolean => {
    // Admin role has all permissions
    if (userRole === 'admin') return true;

    // Guest role has very limited permissions
    if (userRole === 'guest') {
      // Allow read access to public resources for guests
      if (action === 'read' && ['product', 'category', 'public'].includes(resourceType)) {
        return true;
      }
      return false;
    }

    // Check specific permissions for resource type
    const permission = permissions[resourceType];

    if (!permission) {
      // Default to basic permissions based on role for undefined resources
      if (userRole === 'manager') {
        return ['read', 'create'].includes(action);
      }

      if (userRole === 'member') {
        return action === 'read';
      }

      return false;
    }

    // Check if permission type allows the action
    switch (action) {
      case 'read':
        return permission.canView;
      case 'create':
        return permission.canCreate;
      case 'update':
        return permission.canUpdate;
      case 'delete':
        return permission.canDelete;
      case 'manage':
        return permission.canManage;
      default:
        return false;
    }
  };

  // Check if user has full access to a resource
  const hasFullAccess = (resourceType: string): boolean => {
    // Admin role has full access to everything
    if (userRole === 'admin') return true;

    // Check for full permission on the resource
    const permission = permissions[resourceType];
    return permission?.permission === 'full';
  };

  // Provide the permission context
  return (
    <PermissionContext.Provider
      value={{
        loading,
        userRole,
        permissions,
        hasPermission,
        hasFullAccess,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

// Hook for using the permission context
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }

  return context;
};

// Default permissions based on role
export const getDefaultPermissions = (role: UserRole): Record<string, AclPermission> => {
  // Admin has full access to everything
  if (role === 'admin') {
    return {
      '*': {
        permission: 'full',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canManage: true,
      },
    };
  }

  // Manager has create/read/update access to most resources
  if (role === 'manager') {
    return {
      organization: {
        permission: 'read',
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
      team: {
        permission: 'update',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: false,
        canManage: false,
      },
      rfq: {
        permission: 'update',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canManage: false,
      },
      bid: {
        permission: 'update',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canManage: false,
      },
      contract: {
        permission: 'update',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: false,
        canManage: false,
      },
      analytics: {
        permission: 'read',
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
    };
  }

  // Member has read access to most resources
  if (role === 'member') {
    return {
      organization: {
        permission: 'read',
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
      team: {
        permission: 'read',
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
      rfq: {
        permission: 'create',
        canView: true,
        canCreate: true,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
      bid: {
        permission: 'create',
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: false,
        canManage: false,
      },
      contract: {
        permission: 'read',
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
      analytics: {
        permission: 'none',
        canView: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false,
      },
    };
  }

  // Guest has limited read-only access
  return {
    product: {
      permission: 'read',
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManage: false,
    },
    category: {
      permission: 'read',
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManage: false,
    },
    public: {
      permission: 'read',
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManage: false,
    },
  };
};
