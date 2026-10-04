import * as React from "react";
import { cn } from "@/lib/utils";
import type { AssignmentStatus } from "@prisma/client";

const statusClass: Record<AssignmentStatus, string> = {
  OPEN: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-amber-100 text-amber-900",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  OVERDUE: "bg-red-100 text-red-800",
  EXEMPT: "bg-zinc-100 text-zinc-700",
};

export function Badge({
  className,
  status,
  children,
}: {
  className?: string;
  status?: AssignmentStatus;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status ? statusClass[status] : "bg-zinc-100 text-zinc-800",
        className
      )}
    >
      {children}
    </span>
  );
}
