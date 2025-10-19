import { cookies } from "next/headers";

const USER_COOKIE_NAME = "__Host-app_session";
const ADMIN_COOKIE_NAME = "__Host-admin_session";

export function setUserSessionCookie(value: string, expires: Date): void {
  cookies().set({
    name: USER_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    expires,
    path: "/"
  });
}

export function clearUserSessionCookie(): void {
  cookies().delete(USER_COOKIE_NAME);
}

export function getUserSessionCookie(): string | undefined {
  return cookies().get(USER_COOKIE_NAME)?.value;
}

export function setAdminSessionCookie(value: string, expires: Date): void {
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    expires,
    path: "/admin"
  });
}

export function clearAdminSessionCookie(): void {
  cookies().delete(ADMIN_COOKIE_NAME);
}

export function getAdminSessionCookie(): string | undefined {
  return cookies().get(ADMIN_COOKIE_NAME)?.value;
}
