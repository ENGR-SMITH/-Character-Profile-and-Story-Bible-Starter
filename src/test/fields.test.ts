import { describe, expect, it } from "vitest";

import {
  countFieldsForDepth,
  FIELD_BY_KEY,
  FIELD_GROUPS,
  FIELDS,
  fieldsForDepth,
  fieldsInGroup,
} from "@/lib/fields";
import { DEPTH_MODES, LAYERS } from "@/lib/taxonomy";

/** The counts DEVELOPMENT.md §4.2 promises on the depth buttons. */
const PROMISED_COUNTS = { quick: 13, standard: 38, deep: 56 } as const;

describe("depth tiers", () => {
  it("matches the field counts the plan promises", () => {
    for (const depth of DEPTH_MODES) {
      expect(countFieldsForDepth(depth, []), `${depth} count`).toBe(
        PROMISED_COUNTS[depth],
      );
    }
  });

  it("nests the tiers, so raising a depth only ever adds fields", () => {
    const quick = fieldsForDepth("quick", []).map((field) => field.key);
    const standard = fieldsForDepth("standard", []).map((field) => field.key);
    const deep = fieldsForDepth("deep", []).map((field) => field.key);

    const isSubset = (small: string[], large: string[]) =>
      small.every((key) => large.includes(key));

    expect(isSubset(quick, standard)).toBe(true);
    expect(isSubset(standard, deep)).toBe(true);
  });

  it("shows every field in the catalog when the depth is deep and all layers are on", () => {
    // With all four layers enabled there is nothing left to hide, which also
    // pins the total catalog size.
    expect(fieldsForDepth("deep", LAYERS)).toHaveLength(FIELDS.length);
    expect(FIELDS).toHaveLength(60);
  });
});

describe("genre layers", () => {
  const layerFields = FIELDS.filter((field) => field.layer);

  it("has layer fields to switch on in the first place", () => {
    // Guards the two tests below from passing vacuously.
    expect(layerFields.length).toBeGreaterThan(0);
  });

  it("hides every layer field when no layer is active", () => {
    const visible = new Set(fieldsForDepth("deep", []).map((field) => field.key));
    for (const field of layerFields) {
      expect(visible.has(field.key), `${field.key} leaked`).toBe(false);
    }
  });

  it("shows a layer field exactly when its layer is active", () => {
    for (const layer of LAYERS) {
      const visible = new Set(fieldsForDepth("deep", [layer]).map((f) => f.key));
      for (const field of layerFields) {
        expect(
          visible.has(field.key),
          `${field.key} with layer ${layer}`,
        ).toBe(field.layer === layer);
      }
    }
  });
});

describe("catalog integrity", () => {
  it("gives every field a unique key", () => {
    const keys = FIELDS.map((field) => field.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("indexes every field by its key", () => {
    expect(Object.keys(FIELD_BY_KEY)).toHaveLength(FIELDS.length);
    for (const field of FIELDS) {
      expect(FIELD_BY_KEY[field.key]).toBe(field);
    }
  });

  it("fills in the label, group, tier and help text on every field", () => {
    for (const field of FIELDS) {
      expect(field.label.trim(), `${field.key} label`).not.toBe("");
      expect(FIELD_GROUPS, `${field.key} group`).toContain(field.group);
      expect(DEPTH_MODES, `${field.key} tier`).toContain(field.tier);
      // Help text is a required property of FieldDef precisely so a field
      // cannot ship without the explanation that makes the tier meaningful.
      expect(field.help.trim().length, `${field.key} help`).toBeGreaterThan(10);
    }
  });

  it("declares at least two options on every select field", () => {
    const selects = FIELDS.filter((field) => field.kind === "select");
    expect(selects.length).toBeGreaterThan(0);
    for (const field of selects) {
      expect(field.options?.length ?? 0, `${field.key} options`).toBeGreaterThan(1);
    }
  });

  it("declares a valid layer on every layer field, and no layer on the rest", () => {
    for (const field of FIELDS) {
      if (field.layer) {
        expect(LAYERS, `${field.key} layer`).toContain(field.layer);
      }
    }
  });

  it("partitions the visible fields across the groups with no overlap and no gaps", () => {
    const visible = fieldsForDepth("deep", []);
    const byGroup = FIELD_GROUPS.flatMap((group) => fieldsInGroup(group, "deep", []));

    expect(byGroup).toHaveLength(visible.length);
    expect(new Set(byGroup.map((field) => field.key)).size).toBe(visible.length);
  });

  it("returns fields in catalog order within a group", () => {
    // Order has to come from the catalog array, so the editor renders sections
    // in the order the plan defines them. Compared against the *visible* set,
    // which excludes layer fields while no layer is active.
    for (const group of FIELD_GROUPS) {
      const expected = fieldsForDepth("deep", [])
        .filter((field) => field.group === group)
        .map((field) => field.key);
      expect(fieldsInGroup(group, "deep", []).map((f) => f.key)).toEqual(expected);
    }
  });
});
