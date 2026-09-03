import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type {
  NextAuthJwt,
  NextAuthSession,
  NextAuthUser,
} from "@/core/schemas/auth/nextauth";

type SessionUser = Pick<
  NextAuthSession["user"],
  "id" | "name" | "email" | "role" | "tenantId"
>;

type SessionFields = Pick<NextAuthSession, "error">;

type UserFields = Pick<
  NextAuthUser,
  | "id"
  | "name"
  | "email"
  | "accessToken"
  | "refreshToken"
  | "accessTokenExpiresAt"
  | "tenantId"
  | "role"
  | "createdAt"
  | "updatedAt"
>;

type JwtFields = Pick<
  NextAuthJwt,
  | "accessToken"
  | "refreshToken"
  | "accessTokenExpiresAt"
  | "tenantId"
  | "role"
  | "error"
>;

declare module "next-auth" {
  interface Session extends SessionFields {
    user: DefaultSession["user"] & SessionUser;
  }

  type User = UserFields;
}

declare module "next-auth/jwt" {
  type JWT = DefaultJWT & JwtFields;
}
