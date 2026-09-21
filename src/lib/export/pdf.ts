/**
 * The PDF export (§5.9).
 *
 * `@react-pdf/renderer` and the document component are both imported inside the
 * functions, so a writer who never asks for a PDF never downloads either. The
 * element-building step is separated out because a React element is a plain
 * value: it can be built and inspected without a browser or a renderer.
 */

import type { DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";

import { compileBible, type BibleDocument } from "../bible";
import type { Project } from "../schema";

/** What the document component takes. Named so an element can be inspected. */
export interface BiblePdfProps {
  bible: BibleDocument;
  author?: string;
}

export async function biblePdfElement(
  project: Project,
): Promise<ReactElement<BiblePdfProps>> {
  const { BiblePdf } = await import("@/components/BiblePdf");
  return createElement(BiblePdf, {
    bible: compileBible(project),
    author: project.meta.author?.trim() || undefined,
  });
}


export async function biblePdfBlob(project: Project): Promise<Blob> {
  const [{ pdf }, element] = await Promise.all([
    import("@react-pdf/renderer"),
    biblePdfElement(project),
  ]);
  // `pdf` is typed against an element whose props are `DocumentProps`, while
  // this element's props are the component's own. The cast is sound because the
  // component's only element is a `<Document>`; it is one, at the top level.
  return pdf(element as ReactElement<DocumentProps>).toBlob();
}
