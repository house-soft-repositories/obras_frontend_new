import { type UserRole, userRoleSchema } from "@/core/schemas/user/user_schema";

export type Route = {
  path: string;
  roles: UserRole[] | null;
  whenAuthenticated?: "redirect" | "allow";
  children?: Route[];
  label: string;
  icon?: string;
  section?: "Principal" | "Gestão" | "Sistema" | "Outros";
};

export const publicRoutes: Route[] = [
  {
    path: "/login",
    label: "Login",
    whenAuthenticated: "redirect",
    roles: null,
  },
  {
    path: "/confirm-email",
    label: "Confirmar Email",
    whenAuthenticated: "redirect",
    roles: null,
  },
  {
    path: "/validar-documento",
    label: "Validar Documento",
    whenAuthenticated: "allow",
    roles: null,
  },
  {
    path: "/redefinir-senha",
    label: "Redefinir Senha",
    whenAuthenticated: "allow",
    roles: null,
  },
];

export const privateRoutes: Route[] = [
  {
    path: "/",
    label: "Inicio",
    icon: "LayoutDashboard",
    section: "Principal",
    roles: [
      userRoleSchema.enum.SUPERADMIN,
      userRoleSchema.enum.ADMIN,
      userRoleSchema.enum.USER,
      userRoleSchema.enum.STAFF,
    ],
  },
];

export const routes: Route[] = [...privateRoutes, ...publicRoutes];

function isDynamicSegment(segment: string): boolean {
  return segment.startsWith(":");
}

function matchPath(routePath: string, currentPath: string): boolean {
  const routeSegments = routePath.split("/").filter(Boolean);
  const currentSegments = currentPath.split("/").filter(Boolean);

  if (routeSegments.length !== currentSegments.length) return false;

  return routeSegments.every((segment, i) => {
    return isDynamicSegment(segment) || segment === currentSegments[i];
  });
}
export function findRoute(routes: Route[], currentPath: string): Route | null {
  // Primeiro tenta encontrar rota com match exato (sem segmentos dinâmicos)
  for (const route of routes) {
    if (!route.path.includes(":") && matchPath(route.path, currentPath)) {
      return route;
    }
  }

  // Depois tenta encontrar rota com segmentos dinâmicos
  for (const route of routes) {
    if (route.path.includes(":") && matchPath(route.path, currentPath)) {
      return route;
    }
  }

  // Se não achou, tenta nas children recursivamente
  for (const route of routes) {
    if (route.children) {
      const found = findRoute(route.children, currentPath);
      if (found) return found;
    }
  }

  return null;
}
