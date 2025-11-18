import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  module: string;
  action: string;
  resource?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideIfNoAccess?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  module,
  action,
  resource,
  children,
  fallback,
  hideIfNoAccess = false
}) => {
  const { hasPermission, userRole } = usePermissions();

  const hasAccess = hasPermission(module, action, resource);

  if (!hasAccess) {
    if (hideIfNoAccess) {
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to {action} {module}.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Current role: {userRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};