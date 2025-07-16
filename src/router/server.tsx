"use server";

import { HomePage } from "../pages/Home";
import { AboutPage } from "../pages/About";

export async function handleNavigation() {}

export async function matchPage(
  this: Request | undefined | null,
  ssrRequest: Request
) {
  const request: Request = this || ssrRequest;
  const { pathname } = new URL(request.url);
  if (pathname === "/") {
    return <HomePage />;
  }

  if (pathname === "/about") {
    return <AboutPage />;
  }

  return null;
}
