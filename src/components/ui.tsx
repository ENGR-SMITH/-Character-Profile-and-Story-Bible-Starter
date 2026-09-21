"use client";

import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
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

/**
 * What a section is for, behind an icon instead of under its heading.
 *
 * Section blurbs are worth having once and worth reading once; left in the page
 * they are a wall of grey between the writer and the work. This keeps the words
 * available — on hover, and on keyboard focus, which is the half that matters
 * and the half a tooltip usually forgets — while the heading itself stays a
 * heading.
 *
 * The tooltip is in the DOM whether or not it is shown, and is wired with
 * `aria-describedby`, so a screen reader is told what the section is without the
 * writer having to hover anything. It is hidden from print: a printed bible
 * does not need the tool's interface notes, and an un-hoverable tooltip has no
 * way to be read on paper anyway.
 */
export function InfoHint({
  label,
  children,
  className,
}: {
  /** The section being explained, for the button's accessible name. */
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <span
      className={cn(
        "group relative inline-flex items-center align-middle print:hidden",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`What “${label}” is for`}
        aria-describedby={id}
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-border text-[10px] leading-none font-semibold text-muted normal-case transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span aria-hidden>i</span>
      </button>
      <span
        id={id}
        role="tooltip"
        // `normal-case`, `font-normal` and `tracking-normal` are deliberate: the
        // two uppercase section headings in the tool would otherwise shout the
        // icon's glyph and every word of the explanation.
        className="pointer-events-none absolute top-full left-1/2 z-20 mt-1.5 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-border bg-surface p-2.5 text-xs leading-relaxed font-normal tracking-normal text-foreground normal-case opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
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
  hint,
  actions,
}: {
  title: string;
  count?: string;
  /** What the section is for, shown from the `InfoHint` beside the title. */
  hint?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground uppercase">
        {title}
        {count ? <span className="font-normal text-muted normal-case">{count}</span> : null}
        {hint ? <InfoHint label={title}>{hint}</InfoHint> : null}
      </h2>
      {actions}
    </div>
  );
}
