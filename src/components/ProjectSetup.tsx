"use client";

import { useState, type FormEvent } from "react";

import { Button, Card, FieldShell, Input, Select, Textarea } from "@/components/ui";
import { countFieldsForDepth } from "@/lib/fields";
import { useProjectStore } from "@/lib/store";
import {
  GENRES,
  GENRE_META,
  LAYER_META,
  STORY_TYPES,
  STORY_TYPE_META,
  type Genre,
  type StoryType,
} from "@/lib/taxonomy";

function splitLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProjectSetup() {
  const startProject = useProjectStore((state) => state.startProject);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<Genre>("general");
  const [storyType, setStoryType] = useState<StoryType>("novel");
  const [tone, setTone] = useState("");
  const [pov, setPov] = useState("");
  const [tense, setTense] = useState("");
  const [audience, setAudience] = useState("");
  const [contentNotes, setContentNotes] = useState("");

  const layers = GENRE_META[genre].layers;
  const genreFieldCount = countFieldsForDepth("deep", layers) - countFieldsForDepth("deep", []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    startProject({
      title: title.trim(),
      author: author.trim() || undefined,
      genre,
      storyType,
      tone: tone.trim() || undefined,
      pov: pov.trim() || undefined,
      tense: tense.trim() || undefined,
      audience: audience.trim() || undefined,
      contentNotes: splitLines(contentNotes),
      themes: [],
    });
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-foreground">Start a Story Bible</h2>
      <p className="mt-1 text-sm text-muted">
        The project facts sit at the top of the bible you hand to a collaborator. Everything
        here stays in your browser until you choose to export it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <FieldShell
          htmlFor="project-title"
          label="Working title"
          help="A working title is fine — you can change it later."
        >
          <Input
            id="project-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Orah and the Salt Road"
            autoFocus
            required
          />
        </FieldShell>

        <FieldShell htmlFor="project-author" label="Author name (optional)">
          <Input
            id="project-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Name as it should appear on the bible"
          />
        </FieldShell>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldShell
            htmlFor="project-genre"
            label="Genre"
            help={
              genreFieldCount > 0
                ? `${GENRE_META[genre].label} switches on ${genreFieldCount} extra ${
                    genreFieldCount === 1 ? "field" : "fields"
                  } for characters.`
                : "The preset can switch on extra character fields for genre-led stories."
            }
          >
            <Select
              id="project-genre"
              value={genre}
              onChange={(event) => setGenre(event.target.value as Genre)}
            >
              {GENRES.map((value) => (
                <option key={value} value={value}>
                  {GENRE_META[value].label}
                </option>
              ))}
            </Select>
          </FieldShell>

          <FieldShell htmlFor="project-story-type" label="Story type">
            <Select
              id="project-story-type"
              value={storyType}
              onChange={(event) => setStoryType(event.target.value as StoryType)}
            >
              {STORY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {STORY_TYPE_META[value].label}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>

        {layers.length > 0 ? (
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-foreground">
            <span className="font-medium">Extra layers on:</span>{" "}
            {layers.map((layer) => LAYER_META[layer].label).join(" · ")}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-3">
          <FieldShell htmlFor="project-pov" label="Point of view">
            <Input
              id="project-pov"
              value={pov}
              onChange={(event) => setPov(event.target.value)}
              placeholder="Third limited"
            />
          </FieldShell>

          <FieldShell htmlFor="project-tense" label="Tense">
            <Input
              id="project-tense"
              value={tense}
              onChange={(event) => setTense(event.target.value)}
              placeholder="Past"
            />
          </FieldShell>

          <FieldShell htmlFor="project-tone" label="Tone">
            <Input
              id="project-tone"
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              placeholder="Quiet, wintry"
            />
          </FieldShell>
        </div>

        <FieldShell
          htmlFor="project-audience"
          label="Audience"
          help="Who the book is written for. Worth naming so a collaborator does not have to guess."
        >
          <Input
            id="project-audience"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            placeholder="Adult readers of literary mystery"
          />
        </FieldShell>

        <FieldShell
          htmlFor="project-content-notes"
          label="Content notes (optional)"
          help="One per line. Anything a collaborator should know before they write in this world."
        >
          <Textarea
            id="project-content-notes"
            rows={3}
            value={contentNotes}
            onChange={(event) => setContentNotes(event.target.value)}
            placeholder="On-page grief&#10;No graphic violence"
          />
        </FieldShell>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <Button type="submit" variant="primary" disabled={!title.trim()}>
            Create the project
          </Button>
        </div>
      </form>
    </Card>
  );
}
