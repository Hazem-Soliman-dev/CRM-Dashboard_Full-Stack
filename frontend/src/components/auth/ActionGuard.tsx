import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface ActionGuardProps {
  module: string;
  action: string;
  resource?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disabled?: boolean;
}

export const ActionGuard: React.FC<ActionGuardProps> = ({
  module,
  action,
  resource,
  children,
  fallback,
  disabled = false
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = hasPermission(module, action, resource);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // If it's a button or interactive element, we can disable it
  if (React.isValidElement(children) && disabled) {
    return React.cloneElement(children as React.ReactElement<any>, {
      disabled: true,
      className: `${children.props.className || ''} opacity-50 cursor-not-allowed`
    });
  }

  return <>{children}</>;
};