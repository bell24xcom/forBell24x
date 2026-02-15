'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Building2, 
  Users, 
  Factory,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export type UserRole = 'buyer' | 'supplier' | 'msme' | 'manufacturer';

interface RoleToggleProps {
  currentRole: UserRole;
  availableRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const roleConfigs: Record<UserRole, RoleConfig> = {
  buyer: {
    id: 'buyer',
    name: 'Buyer',
    description: 'Purchase products and create RFQs',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'bg-blue-500',
    features: [
      'Browse product catalogs',
      'Create and manage RFQs',
      'Compare suppliers',
      'Track orders and payments',
      'Access purchase analytics'
    ]
  },
  supplier: {
    id: 'supplier',
    name: 'Supplier',
    description: 'Showcase products and respond to RFQs',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-green-500',
    features: [
      'Upload product catalogs',
      'Respond to RFQs',
      'Manage inventory',
      'Track sales analytics',
      'Customer relationship management'
    ]
  },
  msme: {
    id: 'msme',
    name: 'MSME',
    description: 'Special benefits for MSME businesses',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-purple-500',
    features: [
      'MSME certification benefits',
      'Government scheme integration',
      'Special pricing discounts',
      'Bulk order management',
      'Export/import assistance'
    ]
  },
  manufacturer: {
    id: 'manufacturer',
    name: 'Manufacturer',
    description: 'OEM/ODM services and production',
    icon: <Factory className="w-5 h-5" />,
    color: 'bg-orange-500',
    features: [
      'Production capacity showcase',
      'Custom manufacturing RFQs',
      'Quality certification display',
      'Supply chain management',
      'Technical specifications'
    ]
  }
};

export default function RoleToggle({ 
  currentRole, 
  availableRoles, 
  onRoleChange, 
  className = '' 
}: RoleToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    onRoleChange(role);
    setIsOpen(false);
  };

  const currentConfig = roleConfigs[currentRole];

  return (
    <div className={`relative ${className}`}>
      {/* Current Role Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm"
      >
        <div className={`${currentConfig.color} text-white p-2 rounded-lg`}>
          {currentConfig.icon}
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-gray-900">{currentConfig.name}</div>
          <div className="text-sm text-gray-600">{currentConfig.description}</div>
        </div>
        <Settings className="w-5 h-5 text-gray-400" />
      </button>

      {/* Role Selection Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Switch Role</h3>
            
            <div className="space-y-3">
              {availableRoles.map((role) => {
                const config = roleConfigs[role];
                const isActive = role === currentRole;
                const isAvailable = availableRoles.includes(role);

                return (
                  <button
                    key={role}
                    onClick={() => isAvailable && handleRoleChange(role)}
                    disabled={!isAvailable}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : isAvailable
                        ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`${config.color} text-white p-2 rounded-lg`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{config.name}</span>
                        {isActive && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        {!isAvailable && <AlertCircle className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div className="text-sm text-gray-600">{config.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Role Features Preview */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Current Role Features</h4>
              <div className="space-y-2">
                {currentConfig.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Hook for managing role state
export function useRoleToggle() {
  const [currentRole, setCurrentRole] = useState<UserRole>('buyer');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['buyer']);

  const updateAvailableRoles = (roles: UserRole[]) => {
    setAvailableRoles(roles);
    // If current role is not in available roles, switch to first available
    if (!roles.includes(currentRole) && roles.length > 0) {
      setCurrentRole(roles[0]);
    }
  };

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
    }
  };

  return {
    currentRole,
    availableRoles,
    switchRole,
    updateAvailableRoles,
  };
}

// Role-specific dashboard components
export function BuyerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Active RFQs</h3>
          <div className="text-3xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Open requests</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Total Orders</h3>
          <div className="text-3xl font-bold text-green-600">₹2.4L</div>
          <div className="text-sm text-gray-600">This month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Suppliers</h3>
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-sm text-gray-600">Active partners</div>
        </div>
      </div>
    </div>
  );
}

export function SupplierDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Products Listed</h3>
          <div className="text-3xl font-bold text-blue-600">24</div>
          <div className="text-sm text-gray-600">Active listings</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">RFQ Responses</h3>
          <div className="text-3xl font-bold text-green-600">18</div>
          <div className="text-sm text-gray-600">This month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Revenue</h3>
          <div className="text-3xl font-bold text-purple-600">₹5.2L</div>
          <div className="text-sm text-gray-600">This quarter</div>
        </div>
      </div>
    </div>
  );
}

export function MSMEDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">MSME Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">MSME Benefits</h3>
          <div className="text-3xl font-bold text-blue-600">₹45K</div>
          <div className="text-sm text-gray-600">Savings this month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Government Schemes</h3>
          <div className="text-3xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">Active applications</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Certification</h3>
          <div className="text-3xl font-bold text-purple-600">Valid</div>
          <div className="text-sm text-gray-600">MSME Certificate</div>
        </div>
      </div>
    </div>
  );
}

export function ManufacturerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manufacturer Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Production Capacity</h3>
          <div className="text-3xl font-bold text-blue-600">85%</div>
          <div className="text-sm text-gray-600">Utilization rate</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Custom Orders</h3>
          <div className="text-3xl font-bold text-green-600">12</div>
          <div className="text-sm text-gray-600">In progress</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Quality Score</h3>
          <div className="text-3xl font-bold text-purple-600">98.5%</div>
          <div className="text-sm text-gray-600">Pass rate</div>
        </div>
      </div>
    </div>
  );
}
