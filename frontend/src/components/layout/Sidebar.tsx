import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  UserCheck,
  Tag,
  DollarSign,
  Calendar,
  Wallet,
  Settings,
  FileText,
  HelpCircle,
  UserCog,
  Clock,
  X,
  Home,
  CheckSquare,
  Building2,
  ListChecks,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const allNavigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    module: "dashboard",
    roles: [
      "admin",
      "sales",
      "reservation",
      "finance",
      "operations",
      "customer",
    ],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    module: "leads",
    roles: ["admin"],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: UserCheck,
    module: "customers",
    roles: ["admin", "sales", "customer"],
  },
  {
    name: "Categories",
    href: "/product-categories",
    icon: Tag,
    module: "categories",
    roles: ["admin", "operations"],
  },
  {
    name: "Sales",
    href: "/sales",
    icon: DollarSign,
    module: "sales",
    roles: ["admin", "sales"],
  },
  {
    name: "Reservations",
    href: "/reservations",
    icon: ListChecks,
    module: "reservations",
    roles: ["admin", "sales", "reservation", "operations"],
  },
  {
    name: "Accounting",
    href: "/accounting",
    icon: Wallet,
    module: "accounting",
    roles: ["admin", "finance"],
  },
  {
    name: "Operations",
    href: "/operations",
    icon: Calendar,
    module: "operations",
    roles: ["admin", "operations", "reservation"],
  },
  
  {
    name: "Owners",
    href: "/owners",
    icon: Building2,
    module: "owners",
    roles: ["admin", "sales"],
  },
  {
    name: "Properties",
    href: "/properties",
    icon: Home,
    module: "properties",
    roles: ["admin", "operations", "reservation"],
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    module: "tasks",
    roles: ["admin", "operations", "reservation"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    module: "reports",
    roles: ["admin", "finance", "sales"],
  },
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
    module: "support",
    roles: ["admin", "customer", "sales", "operations"],
  },
  {
    name: "User Management",
    href: "/users",
    icon: UserCog,
    module: "users",
    roles: ["admin"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Clock,
    module: "attendance",
    roles: ["admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    module: "settings",
    roles: ["admin"],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { signOut, userRole } = useAuth();
  const { canAccessModule, userRole: mappedRole, canSelfAttend } = usePermissions();

  // Use the mapped role from usePermissions (which maps agent->sales, manager->admin, etc.)
  const normalizedRole =
    mappedRole?.toLowerCase?.() || userRole?.toLowerCase?.() || "";
  const isAdmin = normalizedRole === "admin";

  console.log("Sidebar - userRole (raw):", userRole);
  console.log("Sidebar - mappedRole:", mappedRole);
  console.log("Sidebar - normalizedRole:", normalizedRole);
  console.log("Sidebar - isAdmin:", isAdmin);

  // Filter navigation based on user role
  // Admin users see ALL items (bypass both role and permission checks)
  // Other users must match role AND have permission
  const navigation = allNavigation.filter((item) => {
    // Admin users bypass all checks
    if (isAdmin) {
      return true;
    }

    // Other users: check role match AND permission
    // Use normalizedRole which is already mapped (agent->sales, etc.)
    const roleMatches = item.roles.some(
      (role) => role.toLowerCase() === normalizedRole
    );
    const hasPermission = canAccessModule(item.module);
    // Special-case: Attendance should be visible for employees (non-customers) even without module view permission
    if (item.module === "attendance") {
      return normalizedRole !== "customer" || hasPermission || canSelfAttend;
    }
    return roleMatches && hasPermission;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 lg:justify-center">
          <img
            src="/tourism%20logo.png"
            alt="Tourism Logo"
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                )
              }
              onClick={() => window.innerWidth < 1024 && onToggle()}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};
