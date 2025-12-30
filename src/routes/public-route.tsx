// src/components/auth/PublicRoute.tsx
import { Outlet } from "react-router-dom";
// import { useAuth } from '@/store';

// interface PublicRouteProps {
//   restrictedForAuthenticated?: boolean;
//   redirectTo?: string;
// }

export function PublicRoute() {
  //   {
  //   restrictedForAuthenticated = true,
  //   redirectTo
  // }: PublicRouteProps
  // const { user, isAuthenticated } = useAuth();

  // If route is restricted for authenticated users and user is logged in
  // if (restrictedForAuthenticated && isAuthenticated && user) {
  //   // Redirect based on role
  //   const defaultRedirect = redirectTo || getDefaultRedirect(user.role);
  //   return <Navigate to={defaultRedirect} replace />;
  // }

  return <Outlet />;
}

// function getDefaultRedirect(role: string): string {
//   switch (role) {
//     case "admin":
//       return "/admin";
//     case "landlord":
//       return "/landlord";
//     case "tenant":
//       return "/tenant";
//     default:
//       return "/";
//   }
// }
