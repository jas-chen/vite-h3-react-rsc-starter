"use client";

import {
  type ReactNode,
  type ComponentPropsWithRef,
  type MouseEvent,
  useInsertionEffect,
  useRef,
} from "react";
import { formId } from "./formId";

type Props = {
  href: string;
  children: ReactNode;
} & ComponentPropsWithRef<"a">;

// Copied from https://github.com/molefrog/wouter/blob/b32804fa35aedff1e9bd3da98ae82c5af5c71a61/packages/wouter/src/react-deps.js
const useEvent = <T extends (...args: any[]) => any>(fn: T): T => {
  const ref = useRef([fn, ((...args: any[]) => ref[0](...args)) as T]).current;

  useInsertionEffect(() => {
    ref[0] = fn;
  });
  return ref[1];
};

export function Link({ href, children, onClick: _onClick, ...rest }: Props) {
  const onClick = useEvent((event: MouseEvent<HTMLAnchorElement>) => {
    // ignores the navigation when clicked using right mouse button or
    // by holding a special modifier key: ctrl, command, win, alt, shift
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }

    _onClick?.(event);
    if (!event.defaultPrevented) {
      event.preventDefault();
      history.pushState(null, "", href);
      document.getElementById(formId)?.querySelector("button")?.click();
    }
  });

  return (
    <a {...rest} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
