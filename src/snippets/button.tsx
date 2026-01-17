import type { ReactNode } from "react";

import { clsx } from "clsx";
import NextLink from "next/link";

interface Props {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  color: "primary" | "danger" | "light" | "dark";
  size: "xs" | "sm" | "md";
  href?: string;
  disabled?: boolean;
}

const colors = {
  primary: clsx("bg-primary-600 text-white hover:bg-primary-500 disabled:bg-primary-400"),
  danger: clsx("bg-danger-600 text-white hover:bg-danger-500 disabled:bg-danger-400"),
  dark: clsx("bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-700"),
  light: clsx("bg-gray-100 text-white hover:bg-gray-200 disabled:bg-gray-300"),
};

const sizes = {
  xs: clsx("px-2 py-1 text-xs"),
  sm: clsx("px-3 py-2 text-sm"),
  md: clsx("px-4 py-3 text-base"),
};

export function Button(props: Props) {
  if (props.href) {
    return (
      <NextLink
        href={props.href}
        className={clsx(
          "pointer-events-auto rounded-md leading-5 font-semibold",
          colors[props.color],
          sizes[props.size],
          props.className,
        )}
      >
        {props.children}
      </NextLink>
    );
  }

  return (
    <button
      onClick={props.onClick}
      className={clsx(
        "pointer-events-auto rounded-md leading-5 font-semibold",
        colors[props.color],
        sizes[props.size],
        props.className,
      )}
      disabled={props.disabled}
      type="button"
    >
      {props.children}
    </button>
  );
}
