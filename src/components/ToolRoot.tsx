"use client";

import { ProjectSetup } from "@/components/ProjectSetup";
import { Workspace } from "@/components/Workspace";
import { Card } from "@/components/ui";
import { useHydration, useProject } from "@/lib/store";

function LoadingShell() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="h-5 w-48 animate-pulse rounded bg-surface-2" />
      <div className="mt-3 h-3 w-full max-w-md animate-pulse rounded bg-surface-2" />
      <div className="mt-8 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-surface-2" />
      </div>
      <p className="mt-6 text-xs text-muted">Opening your locally saved project…</p>
    </Card>
  );
}

/**
 * The tool is entirely client-side, so the first paint is a neutral shell and
 * the project is rehydrated from localStorage in an effect. That keeps the
 * server-rendered HTML and the first client render identical.
 */
export function ToolRoot() {
  const hydrated = useHydration();
  const project = useProject();

  if (!hydrated) return <LoadingShell />;
  if (!project) return <ProjectSetup />;
  return <Workspace />;
}
