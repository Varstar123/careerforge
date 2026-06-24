"use client";

import * as React from "react";

/**
 * Minimal `asChild` Slot — merges this component's props onto its single child
 * element so we can render polymorphically (e.g. <Button asChild><Link/></Button>)
 * without pulling in @radix-ui/react-slot.
 */
type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    const merged: Record<string, unknown> = {
      ...childProps,
      ...slotProps,
      // merge className
      className: [
        (slotProps as { className?: string }).className,
        (childProps as { className?: string }).className,
      ]
        .filter(Boolean)
        .join(" "),
      // merge style
      style: {
        ...((childProps as { style?: React.CSSProperties }).style ?? {}),
        ...((slotProps as { style?: React.CSSProperties }).style ?? {}),
      },
      ref,
    };

    return React.cloneElement(child, merged);
  },
);
Slot.displayName = "Slot";
