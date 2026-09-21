import { describe, expect, it } from "vitest";

import {
  CANON_SCOPE_META,
  CANON_SCOPES,
  CHARACTER_COLORS,
  CHARACTER_ROLE_META,
  CHARACTER_ROLES,
  DEPTH_META,
  DEPTH_MODES,
  DEPTH_ORDER,
  GENRES,
  GENRE_META,
  IMPORTANCE_LEVELS,
  IMPORTANCE_META,
  LAYERS,
  LAYER_META,
  LOCATION_TYPES,
  LOCATION_TYPE_META,
  RELATIONSHIP_STATUSES,
  RELATIONSHIP_STATUS_META,
  RELATIONSHIP_TYPE_META,
  RELATIONSHIP_TYPES,
  STORY_TYPE_META,
  STORY_TYPES,
} from "@/lib/taxonomy";

/**
 * Every value tuple has a matching `*_META` record. These tests exist because
 * the UI looks a label up by value: a value with no metadata renders as
 * `undefined` rather than failing loudly.
 */
describe("metadata covers every vocabulary", () => {
  const cases: Array<{
    name: string;
    values: readonly string[];
    meta: Record<string, unknown>;
  }> = [
    { name: "character roles", values: CHARACTER_ROLES, meta: CHARACTER_ROLE_META },
    { name: "importance levels", values: IMPORTANCE_LEVELS, meta: IMPORTANCE_META },
    { name: "depth modes", values: DEPTH_MODES, meta: DEPTH_META },
    { name: "genres", values: GENRES, meta: GENRE_META },
    { name: "story types", values: STORY_TYPES, meta: STORY_TYPE_META },
    {
      name: "relationship types",
      values: RELATIONSHIP_TYPES,
      meta: RELATIONSHIP_TYPE_META,
    },
    {
      name: "relationship statuses",
      values: RELATIONSHIP_STATUSES,
      meta: RELATIONSHIP_STATUS_META,
    },
    { name: "layers", values: LAYERS, meta: LAYER_META },
    { name: "location types", values: LOCATION_TYPES, meta: LOCATION_TYPE_META },
    { name: "canon scopes", values: CANON_SCOPES, meta: CANON_SCOPE_META },
  ];

  it.each(cases)("has an entry for every $name value", ({ values, meta }) => {
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(meta, `missing metadata for ${value}`).toHaveProperty(value);
    }
    expect(Object.keys(meta)).toHaveLength(values.length);
  });

  it("gives every character role and importance level a label and a hint", () => {
    for (const value of CHARACTER_ROLES) {
      expect(CHARACTER_ROLE_META[value].label.trim(), value).not.toBe("");
      expect(CHARACTER_ROLE_META[value].hint.trim(), value).not.toBe("");
    }
    for (const value of IMPORTANCE_LEVELS) {
      expect(IMPORTANCE_META[value].label.trim(), value).not.toBe("");
      expect(IMPORTANCE_META[value].hint.trim(), value).not.toBe("");
    }
  });

  it("gives every depth mode a label, a hint and a duration", () => {
    for (const depth of DEPTH_MODES) {
      expect(DEPTH_META[depth].label.trim(), depth).not.toBe("");
      expect(DEPTH_META[depth].hint.trim(), depth).not.toBe("");
      expect(DEPTH_META[depth].minutes.trim(), depth).not.toBe("");
    }
  });
});

describe("depth ordering", () => {
  it("is strictly increasing, so a change can be classified as raising or lowering", () => {
    expect(DEPTH_ORDER.quick).toBeLessThan(DEPTH_ORDER.standard);
    expect(DEPTH_ORDER.standard).toBeLessThan(DEPTH_ORDER.deep);
  });

  it("ranks every declared depth mode", () => {
    for (const depth of DEPTH_MODES) {
      expect(typeof DEPTH_ORDER[depth]).toBe("number");
    }
  });
});

describe("genre presets", () => {
  it("only switches on layers that exist", () => {
    for (const genre of GENRES) {
      for (const layer of GENRE_META[genre].layers) {
        expect(LAYERS, `${genre} -> ${layer}`).toContain(layer);
      }
    }
  });

  it("never lists the same layer twice", () => {
    for (const genre of GENRES) {
      const layers = GENRE_META[genre].layers;
      expect(new Set(layers).size).toBe(layers.length);
    }
  });

  it("labels every genre", () => {
    for (const genre of GENRES) {
      expect(GENRE_META[genre].label.trim(), genre).not.toBe("");
    }
  });

  it("keeps the general preset free of layers, so its field count is the baseline", () => {
    expect(GENRE_META.general.layers).toEqual([]);
  });

  it("switches on every layer for at least one preset, or the feature is dead code", () => {
    const allOn = GENRES.filter(
      (genre) => GENRE_META[genre].layers.length === LAYERS.length,
    );
    expect(allOn.length).toBeGreaterThan(0);
  });
});

describe("cast colours", () => {
  it("uses a unique hex value per colour", () => {
    const values = CHARACTER_COLORS.map((color) => color.value);
    expect(new Set(values).size).toBe(values.length);
    expect(values.length).toBeGreaterThan(0);
  });

  it("uses lowercase six-digit hex, which is what the swatch and Schema expect", () => {
    for (const color of CHARACTER_COLORS) {
      expect(color.value, color.name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
