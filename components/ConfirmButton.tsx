"use client";

import { Button } from "./ui";

// Submit button that asks for confirmation before letting a destructive server
// action run. Cancelling prevents the form submit.
export function ConfirmButton({
  confirm,
  children,
  variant = "danger",
  className = "px-3 py-1.5 text-xs",
}: {
  confirm: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
