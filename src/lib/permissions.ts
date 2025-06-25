// src/lib/permissions.ts - Fixed without circular references
import { UserRole, UserStatus, AppUser } from '@/types/auth';
import { PERMISSIONS, ROLE_PERMISSIONS } from './constants';

// Permission types
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Resource = 'users' | 'vendors' | 'products' | 'orders' | 'payments' | 'settings' | 'analytics' | 'system';
export type Action = 'read' | 'write' | 'delete' | 'approve' | 'manage';

// User permissions interface
export interface UserPermissions {
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// Permission checker class
export class PermissionChecker {
  private userRole: UserRole;
  private userPermissions: string[];

  constructor(userRole: UserRole, userPermissions: string[] = []) {
    this.userRole = userRole;
    this.userPermissions = userPermissions;
  }

  // Check if user has a specific permission
  hasPermission(permission: Permission): boolean {
    // Super admin has all permissions
    if (this.userRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check if user has wildcard permission
    if (this.userPermissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return this.userPermissions.includes(permission);
  }

  // Check if user has permission for a specific resource and action
  hasResourcePermission(resource: Resource, action: Action): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user has a specific role
  hasRole(role: UserRole | UserRole[]): boolean {
    if (Array.isArray(role)) {
      return role.includes(this.userRole);
    }
    return this.userRole === role;
  }

  // Check if user has role hierarchy (admin can do what vendors can do)
  hasRoleOrHigher(role: UserRole): boolean {
    const hierarchy = [
      UserRole.CUSTOMER,
      UserRole.VENDOR,
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ];

    const userRoleIndex = hierarchy.indexOf(this.userRole);
    const requiredRoleIndex = hierarchy.indexOf(role);

    return userRoleIndex >= requiredRoleIndex;
  }

  // Get user permissions object
  getUserPermissions(): UserPermissions {
    return {
      canRead: this.hasResourcePermission('products', 'read') || 
               this.hasResourcePermission('orders', 'read') ||
               this.hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
      canWrite: this.hasResourcePermission('products', 'write') || 
                this.hasResourcePermission('orders', 'write') ||
                this.hasRole([UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
      canUpdate: this.hasResourcePermission('products', 'write') || 
                 this.hasResourcePermission('orders', 'write') ||
                 this.hasRole([UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
      canDelete: this.hasResourcePermission('products', 'delete') || 
                 this.hasResourcePermission('orders', 'delete') ||
                 this.hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
      canManage: this.hasResourcePermission('system', 'manage') ||
                 this.hasRole([UserRole.SUPER_ADMIN]),
    };
  }

  // Check permissions for specific entities
  canAccessAdminPanel(): boolean {
    return this.hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }

  canAccessVendorPanel(): boolean {
    return this.hasRole([UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }

  canManageUsers(): boolean {
    return this.hasPermission(PERMISSIONS.USERS_MANAGE);
  }

  canManageVendors(): boolean {
    return this.hasPermission(PERMISSIONS.VENDORS_MANAGE);
  }

  canApproveVendors(): boolean {
    return this.hasPermission(PERMISSIONS.VENDORS_APPROVE);
  }

  canManageProducts(): boolean {
    return this.hasPermission(PERMISSIONS.PRODUCTS_MANAGE);
  }

  canApproveProducts(): boolean {
    return this.hasPermission(PERMISSIONS.PRODUCTS_APPROVE);
  }

  canManageOrders(): boolean {
    return this.hasPermission(PERMISSIONS.ORDERS_MANAGE);
  }

  canManagePayments(): boolean {
    return this.hasPermission(PERMISSIONS.PAYMENTS_MANAGE);
  }

  canManageSettings(): boolean {
    return this.hasPermission(PERMISSIONS.SETTINGS_MANAGE);
  }

  canViewAnalytics(): boolean {
    return this.hasPermission(PERMISSIONS.ANALYTICS_READ);
  }

  canManageSystem(): boolean {
    return this.hasPermission(PERMISSIONS.SYSTEM_MANAGE);
  }

  // Entity-specific permissions
  canEditOwnProducts(): boolean {
    return this.hasRole(UserRole.VENDOR) || this.canManageProducts();
  }

  canViewOwnOrders(): boolean {
    return this.hasRole([UserRole.CUSTOMER, UserRole.VENDOR]) || this.canManageOrders();
  }

  canEditOwnProfile(): boolean {
    return true; // All authenticated users can edit their own profile
  }

  canDeleteOwnAccount(): boolean {
    return this.hasRole([UserRole.CUSTOMER, UserRole.VENDOR]);
  }

  // Vendor-specific permissions
  canCreateProducts(): boolean {
    return this.hasRole(UserRole.VENDOR) || this.hasPermission(PERMISSIONS.PRODUCTS_WRITE);
  }

  canManageOwnStore(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  canViewEarnings(): boolean {
    return this.hasRole(UserRole.VENDOR) || this.canViewAnalytics();
  }

  canRequestPayout(): boolean {
    return this.hasRole(UserRole.VENDOR);
  }

  // Admin-specific permissions
  canBanUsers(): boolean {
    return this.hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
  }

  canConfigureSystem(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  canAccessSystemLogs(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  canManageBackups(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }
}

// Permission-based access control decorators and utilities
export function requirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const checker = getPermissionChecker(this.user);
      if (!checker.hasPermission(permission)) {
        throw new Error(`Permission denied: ${permission} required`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function requireRole(role: UserRole | UserRole[]) {
  return function ( descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const checker = getPermissionChecker(this.user);
      if (!checker.hasRole(role)) {
        const roleNames = Array.isArray(role) ? role.join(', ') : role;
        throw new Error(`Access denied: ${roleNames} role required`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function requireRoleOrHigher(role: UserRole) {
  return function ( descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const checker = getPermissionChecker(this.user);
      if (!checker.hasRoleOrHigher(role)) {
        throw new Error(`Access denied: ${role} role or higher required`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Permission checker factory
export function createPermissionChecker(userRole: UserRole, userPermissions: string[] = []): PermissionChecker {
  return new PermissionChecker(userRole, userPermissions);
}

// Get permission checker from user object
export function getPermissionChecker(user: { role: UserRole; permissions?: string[] }): PermissionChecker {
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const userPermissions = user.permissions || [];
  const allPermissions = [...rolePermissions, ...userPermissions];
  
  return new PermissionChecker(user.role, allPermissions);
}

// Permission validation utilities
export class PermissionValidator {
  static validatePermissionString(permission: string): boolean {
    return Object.values(PERMISSIONS).includes(permission as Permission);
  }

  static validateRoleString(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }

  static getPermissionsForRole(role: UserRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  static getAllPermissions(): Permission[] {
    return Object.values(PERMISSIONS);
  }

  static getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  static getResourcePermissions(resource: Resource): Permission[] {
    return Object.values(PERMISSIONS).filter(permission => 
      permission.startsWith(`${resource}:`)
    ) as Permission[];
  }

  static getActionPermissions(action: Action): Permission[] {
    return Object.values(PERMISSIONS).filter(permission => 
      permission.endsWith(`:${action}`)
    ) as Permission[];
  }
}

// Resource-based access control
export class ResourceAccessControl {
  private checker: PermissionChecker;

  constructor(checker: PermissionChecker) {
    this.checker = checker;
  }

  // User resource access
  canViewUser(targetUserId: string, currentUserId: string): boolean {
    // Users can view their own profile
    if (targetUserId === currentUserId) {
      return true;
    }

    // Admins can view all users
    return this.checker.hasPermission(PERMISSIONS.USERS_READ);
  }

  canEditUser(targetUserId: string, currentUserId: string): boolean {
    // Users can edit their own profile
    if (targetUserId === currentUserId) {
      return true;
    }

    // Admins can edit all users
    return this.checker.hasPermission(PERMISSIONS.USERS_WRITE);
  }

  canDeleteUser(targetUserId: string, currentUserId: string): boolean {
    // Users cannot delete their own account if they're super admin
    if (targetUserId === currentUserId && this.checker.hasRole(UserRole.SUPER_ADMIN)) {
      return false;
    }

    // Users can delete their own account
    if (targetUserId === currentUserId) {
      return this.checker.canDeleteOwnAccount();
    }

    // Admins can delete other users
    return this.checker.hasPermission(PERMISSIONS.USERS_DELETE);
  }

  // Product resource access
  canViewProduct(productId: string, vendorId?: string, currentUserId?: string): boolean {
    // Public products are viewable by everyone
    return true;
  }

  canEditProduct(productId: string, vendorId: string, currentUserId: string): boolean {
    // Vendors can edit their own products
    if (vendorId === currentUserId && this.checker.hasRole(UserRole.VENDOR)) {
      return true;
    }

    // Admins can edit all products
    return this.checker.hasPermission(PERMISSIONS.PRODUCTS_WRITE);
  }

  canDeleteProduct(productId: string, vendorId: string, currentUserId: string): boolean {
    // Vendors can delete their own products
    if (vendorId === currentUserId && this.checker.hasRole(UserRole.VENDOR)) {
      return true;
    }

    // Admins can delete all products
    return this.checker.hasPermission(PERMISSIONS.PRODUCTS_DELETE);
  }

  // Order resource access
  canViewOrder(orderId: string, orderUserId: string, vendorId: string | null, currentUserId: string): boolean {
    // Customers can view their own orders
    if (orderUserId === currentUserId) {
      return true;
    }

    // Vendors can view orders for their products
    if (vendorId === currentUserId && this.checker.hasRole(UserRole.VENDOR)) {
      return true;
    }

    // Admins can view all orders
    return this.checker.hasPermission(PERMISSIONS.ORDERS_READ);
  }

  canEditOrder(orderId: string, orderUserId: string, vendorId: string | null, currentUserId: string): boolean {
    // Customers cannot edit orders (except cancel)
    if (orderUserId === currentUserId) {
      return false; // Use specific canCancelOrder method
    }

    // Vendors can edit orders for their products (fulfillment)
    if (vendorId === currentUserId && this.checker.hasRole(UserRole.VENDOR)) {
      return true;
    }

    // Admins can edit all orders
    return this.checker.hasPermission(PERMISSIONS.ORDERS_WRITE);
  }

  canCancelOrder(orderId: string, orderUserId: string, orderStatus: string, currentUserId: string): boolean {
    // Only pending/confirmed orders can be cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(orderStatus)) {
      return false;
    }

    // Customers can cancel their own orders
    if (orderUserId === currentUserId) {
      return true;
    }

    // Admins can cancel any order
    return this.checker.hasPermission(PERMISSIONS.ORDERS_WRITE);
  }

  // Vendor resource access
  canViewVendor(vendorId: string, vendorUserId: string, currentUserId: string): boolean {
    // Public vendor profiles are viewable by everyone
    if (this.isPublicVendorProfile(vendorId)) {
      return true;
    }

    // Vendors can view their own profile
    if (vendorUserId === currentUserId) {
      return true;
    }

    // Admins can view all vendor profiles
    return this.checker.hasPermission(PERMISSIONS.VENDORS_READ);
  }

  canEditVendor(vendorId: string, vendorUserId: string, currentUserId: string): boolean {
    // Vendors can edit their own profile
    if (vendorUserId === currentUserId && this.checker.hasRole(UserRole.VENDOR)) {
      return true;
    }

    // Admins can edit all vendor profiles
    return this.checker.hasPermission(PERMISSIONS.VENDORS_WRITE);
  }

  canApproveVendor(vendorId: string): boolean {
    return this.checker.hasPermission(PERMISSIONS.VENDORS_APPROVE);
  }

  private isPublicVendorProfile(vendorId: string): boolean {
    // This would check if the vendor profile is set to public
    // For now, assume all vendor profiles are public
    return true;
  }
}

// Middleware for API route protection
export function createPermissionMiddleware(requiredPermission: Permission) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const checker = getPermissionChecker(user);
    
    if (!checker.hasPermission(requiredPermission)) {
      return res.status(403).json({ error: `Permission denied: ${requiredPermission} required` });
    }

    next();
  };
}

export function createRoleMiddleware(requiredRole: UserRole | UserRole[]) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const checker = getPermissionChecker(user);
    
    if (!checker.hasRole(requiredRole)) {
      const roleNames = Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole;
      return res.status(403).json({ error: `Access denied: ${roleNames} role required` });
    }

    next();
  };
}

// Permission context for React components
export interface PermissionContext {
  checker: PermissionChecker;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasRoleOrHigher: (role: UserRole) => boolean;
  canAccessAdminPanel: () => boolean;
  canAccessVendorPanel: () => boolean;
}

export function createPermissionContext(user: { role: UserRole; permissions?: string[] }): PermissionContext {
  const checker = getPermissionChecker(user);
  
  return {
    checker,
    hasPermission: (permission: Permission) => checker.hasPermission(permission),
    hasRole: (role: UserRole | UserRole[]) => checker.hasRole(role),
    hasRoleOrHigher: (role: UserRole) => checker.hasRoleOrHigher(role),
    canAccessAdminPanel: () => checker.canAccessAdminPanel(),
    canAccessVendorPanel: () => checker.canAccessVendorPanel(),
  };
}

// Helper functions for common permission checks
export function canUserAccessResource(
  user: { role: UserRole; permissions?: string[] },
  resource: Resource,
  action: Action
): boolean {
  const checker = getPermissionChecker(user);
  return checker.hasResourcePermission(resource, action);
}

export function canUserPerformAction(
  user: { role: UserRole; permissions?: string[] },
  permission: Permission
): boolean {
  const checker = getPermissionChecker(user);
  return checker.hasPermission(permission);
}

export function getUserAccessLevel(user: { role: UserRole; permissions?: string[] }): 'admin' | 'vendor' | 'customer' {
  const checker = getPermissionChecker(user);
  
  if (checker.canAccessAdminPanel()) {
    return 'admin';
  } else if (checker.canAccessVendorPanel()) {
    return 'vendor';
  } else {
    return 'customer';
  }
}

// Export commonly used permission checks
export const PermissionChecks = {
  // Admin checks
  isAdmin: (user: { role: UserRole }) => user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN,
  isSuperAdmin: (user: { role: UserRole }) => user.role === UserRole.SUPER_ADMIN,
  
  // Vendor checks
  isVendor: (user: { role: UserRole }) => user.role === UserRole.VENDOR,
  canSell: (user: { role: UserRole }) => user.role === UserRole.VENDOR || user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN,
  
  // Customer checks
  isCustomer: (user: { role: UserRole }) => user.role === UserRole.CUSTOMER,
  canPurchase: (user: { role: UserRole }) => true, // All authenticated users can purchase
  
  // General checks
  isAuthenticated: (user: any) => !!user,
  hasMinimumRole: (user: { role: UserRole }, minRole: UserRole) => {
    const checker = createPermissionChecker(user.role);
    return checker.hasRoleOrHigher(minRole);
  },
};

// Default export
export default PermissionChecker;