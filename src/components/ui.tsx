"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-accent text-accent-foreground hover:bg-accent-hover border border-transparent",
    secondary:
      "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-2",
    ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface-2",
    danger: "bg-danger-soft text-danger border border-transparent hover:opacity-90",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-4 text-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------

const controlClasses =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, "h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, "min-h-24 resize-y", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClasses, "h-10 appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-foreground", className)}
    >
      {children}
    </label>
  );
}

export function HelpText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-muted">{children}</p>;
}

/** A labelled control with the help line that every field in the editor uses. */
export function FieldShell({
  htmlFor,
  label,
  help,
  children,
}: {
  htmlFor: string;
  label: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {help ? <HelpText>{help}</HelpText> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Meter({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {children ? (
        <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  title,
  count,
  actions,
}: {
  title: string;
  count?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
        {count ? <span className="ml-2 font-normal text-muted normal-case">{count}</span> : null}
      </h2>
      {actions}
    </div>
  );
}
