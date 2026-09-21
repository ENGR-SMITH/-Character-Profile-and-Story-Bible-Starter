/**
 * The one piece of Markdown the writers have to understand.
 *
 * The bible's text is Markdown, and the two constructs it uses are `**bold**`
 * and `- ` bullets. Rather than hand a file full of asterisks to Word and a PDF,
 * the DOCX and PDF writers split the bold apart with this.
 */

export interface InlineRun {
  text: string;
  bold: boolean;
}

/** Split `A **bold** B` into runs, where the odd pieces are the bold ones. */
export function inlineRuns(text: string): InlineRun[] {
  return text
    .split("**")
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((run) => run.text !== "");
}
