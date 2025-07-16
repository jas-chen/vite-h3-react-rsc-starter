"use client";

import { useEffect, type ReactNode } from "react";
import { formId } from "./formId";

// To prevent additional form submissions
export function NavigationFix() {
  useEffect(() => {
    const form = document.getElementById(formId);
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }, []);

  return null;
}

export function Link({
  href,
  children,
  ...rest
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        e.preventDefault();
        history.pushState(null, "", href);
        document.getElementById(formId)?.querySelector("button")?.click();
      }}
    >
      {children}
    </a>
  );
}
