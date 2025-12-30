// // src/routes/routePermissions.ts
// import { User } from '@/store/types/store.types';

// export type UserRole = 'admin' | 'landlord' | 'tenant';

// export interface RoutePermission {
//   path: string;
//   allowedRoles: UserRole[];
//   requireAuth: boolean;
// }

// // Define route permissions
// export const ROUTE_PERMISSIONS: RoutePermission[] = [
//   // Public routes - no auth required
//   { path: '/', allowedRoles: [], requireAuth: false },
//   { path: '/properties', allowedRoles: [], requireAuth: false },
//   { path: '/properties/:id', allowedRoles: [], requireAuth: false },
//   { path: '/search', allowedRoles: [], requireAuth: false },
//   { path: '/about', allowedRoles: [], requireAuth: false },
//   { path: '/contact', allowedRoles: [], requireAuth: false },

//   // Auth routes - only for non-authenticated
//   { path: '/auth/login', allowedRoles: [], requireAuth: false },
//   { path: '/auth/register', allowedRoles: [], requireAuth: false },
//   { path: '/auth/forgot-password', allowedRoles: [], requireAuth: false },

//   // Landlord routes
//   { path: '/landlord/*', allowedRoles: ['landlord'], requireAuth: true },

//   // Tenant routes
//   { path: '/tenant/*', allowedRoles: ['tenant'], requireAuth: true },

//   // Admin routes
//   { path: '/admin/*', allowedRoles: ['admin'], requireAuth: true },
// ];

// /**
//  * Check if user can access a specific route
//  */
// export function canAccessRoute(
//   pathname: string,
//   user: User | null,
//   isAuthenticated: boolean
// ): boolean {
//   // Find matching permission
//   const permission = ROUTE_PERMISSIONS.find((p) => {
//     if (p.path.endsWith('/*')) {
//       const basePath = p.path.slice(0, -2);
//       return pathname.startsWith(basePath);
//     }
//     return matchPath(pathname, p.path);
//   });

//   // If no permission defined, allow access (should not happen)
//   if (!permission) {
//     return true;
//   }

//   // Check authentication requirement
//   if (permission.requireAuth && !isAuthenticated) {
//     return false;
//   }

//   // Check role requirement
//   if (permission.allowedRoles.length === 0) {
//     return true; // Public route
//   }

//   if (!user) {
//     return false;
//   }

//   return permission.allowedRoles.includes(user.role);
// }

// /**
//  * Get redirect URL if user cannot access current route
//  */
// export function getRedirectUrl(
//   pathname: string,
//   user: User | null,
//   isAuthenticated: boolean
// ): string | null {
//   if (canAccessRoute(pathname, user, isAuthenticated)) {
//     return null; // Can access, no redirect needed
//   }

//   // Not authenticated - redirect to login
//   if (!isAuthenticated) {
//     return '/auth/login';
//   }

//   // Authenticated but wrong role - redirect to unauthorized
//   return '/unauthorized';
// }

// /**
//  * Simple path matching (similar to react-router)
//  */
// function matchPath(pathname: string, pattern: string): boolean {
//   if (pattern === pathname) {
//     return true;
//   }

//   if (!pattern.includes(':')) {
//     return false;
//   }

//   const patternParts = pattern.split('/');
//   const pathnameParts = pathname.split('/');

//   if (patternParts.length !== pathnameParts.length) {
//     return false;
//   }

//   return patternParts.every((part, i) => {
//     if (part.startsWith(':')) {
//       return true; // Dynamic segment
//     }
//     return part === pathnameParts[i];
//   });
// }

// /**
//  * Get accessible routes for a user
//  */
// export function getAccessibleRoutes(user: User | null): string[] {
//   if (!user) {
//     return ROUTE_PERMISSIONS
//       .filter((p) => !p.requireAuth)
//       .map((p) => p.path);
//   }

//   return ROUTE_PERMISSIONS
//     .filter((p) => {
//       if (!p.requireAuth) return true;
//       if (p.allowedRoles.length === 0) return true;
//       return p.allowedRoles.includes(user.role);
//     })
//     .map((p) => p.path);
// }

// /**
//  * Check if user has specific permission
//  */
// export function hasPermission(
//   user: User | null,
//   permission: 'create' | 'read' | 'update' | 'delete',
//   resource: 'property' | 'contract' | 'invoice' | 'user'
// ): boolean {
//   if (!user) return false;

//   // Admin has all permissions
//   if (user.role === 'admin') {
//     return true;
//   }

//   // Landlord permissions
//   if (user.role === 'landlord') {
//     switch (resource) {
//       case 'property':
//       case 'contract':
//       case 'invoice':
//         return true;
//       case 'user':
//         return permission === 'read'; // Can only view users
//       default:
//         return false;
//     }
//   }

//   // Tenant permissions
//   if (user.role === 'tenant') {
//     switch (resource) {
//       case 'property':
//         return permission === 'read'; // Can only view properties
//       case 'contract':
//       case 'invoice':
//         return permission === 'read'; // Can only view their own
//       case 'user':
//         return permission === 'update' && user.id === user.id; // Can only update self
//       default:
//         return false;
//     }
//   }

//   return false;
// }