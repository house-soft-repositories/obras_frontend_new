import { type UserRole, userRoleSchema } from "@/core/schemas/user/user_schema";

export type Route = {
  path: string;
  roles: UserRole[] | null;
  whenAuthenticated?: "redirect" | "allow";
  children?: Route[];
  label: string;
  icon?: string;
};

export type RouteGroup = {
  label: string;
  routes: Route[];
};

export const publicRoutes: Route[] = [
  {
    path: "/login",
    label: "Login",
    whenAuthenticated: "redirect",
    roles: null,
  },
];

export const privateRouteGroups: RouteGroup[] = [
  {
    label: "Principal",
    routes: [
      {
        path: "/home",
        label: "Início",
        icon: "House",
        roles: [
          userRoleSchema.enum.SUPERADMIN,
          userRoleSchema.enum.ADMIN,
          userRoleSchema.enum.USER,
          userRoleSchema.enum.STAFF,
        ],
      },
      {
        path: "/obras",
        label: "Obras",
        icon: "Building2",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN, userRoleSchema.enum.STAFF],
      },
    ],
  },
  {
    label: "Administração",
    routes: [
      {
        path: "/tenants",
        label: "Tenants",
        icon: "Shield",
        roles: [userRoleSchema.enum.SUPERADMIN],
      },
      {
        path: "/cadastros/usuarios",
        label: "Usuários",
        icon: "Users",
        roles: [
          userRoleSchema.enum.SUPERADMIN,
          userRoleSchema.enum.ADMIN,
          userRoleSchema.enum.STAFF,
        ],
      },
    ],
  },
  {
    label: "Cadastros",
    routes: [
      {
        path: "/cadastros/localidades",
        label: "Localidades",
        icon: "MapPinned",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/orgaos",
        label: "Órgãos",
        icon: "Landmark",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/setores",
        label: "Setores",
        icon: "Network",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/fontes",
        label: "Fontes",
        icon: "Wallet",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/eixos",
        label: "Eixos",
        icon: "Layers",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/classificacoes",
        label: "Classificações",
        icon: "Tag",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/subclassificacoes",
        label: "Subclassificações",
        icon: "Tags",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/tipologias",
        label: "Tipologias",
        icon: "Shapes",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
      {
        path: "/cadastros/subtipologias",
        label: "Subtipologias",
        icon: "Boxes",
        roles: [userRoleSchema.enum.SUPERADMIN, userRoleSchema.enum.ADMIN],
      },
    ],
  },
];

export const privateRoutes: Route[] = privateRouteGroups.flatMap(
  (group) => group.routes,
);

export const routes: Route[] = [...privateRoutes, ...publicRoutes];

export function privateRoutesForRole(
  role: UserRole | null | undefined,
): Route[] {
  return privateRoutes.filter((route) => role && route.roles?.includes(role));
}

export function privateRouteGroupsForRole(
  role: UserRole | null | undefined,
): RouteGroup[] {
  if (!role) return [];

  return privateRouteGroups
    .map((group) => ({
      ...group,
      routes: group.routes.filter((route) => route.roles?.includes(role)),
    }))
    .filter((group) => group.routes.length > 0);
}

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
