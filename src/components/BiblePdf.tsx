"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { BibleBlock, BibleDocument } from "@/lib/bible";
import { inlineRuns } from "@/lib/export/inline";

/**
 * The bible as a PDF document (§5.9).
 *
 * A second rendering of the compiled document, not a second source of truth:
 * it reads the same `BibleDocument` the view does, so the pages cannot disagree
 * with the screen. Colours are the light theme's tokens, because paper is white.
 *
 * This module is only ever reached through a dynamic import, so `@react-pdf`
 * stays out of the bundle until a writer asks for a PDF.
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1c1917",
    fontFamily: "Helvetica",
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  subtitle: { marginTop: 6, fontSize: 9, color: "#79716b" },
  disclosure: { marginTop: 4, fontSize: 9, color: "#79716b", fontStyle: "italic" },
  sectionTitle: {
    marginTop: 22,
    paddingBottom: 4,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e6e2db",
  },
  entryTitle: { marginTop: 14, fontSize: 11, fontFamily: "Helvetica-Bold" },
  subheading: {
    marginTop: 12,
    fontSize: 8,
    letterSpacing: 0.6,
    color: "#79716b",
    textTransform: "uppercase",
  },
  paragraph: { marginTop: 6 },
  factRow: { marginTop: 4, flexDirection: "row" },
  factLabel: { width: 110, color: "#79716b", fontSize: 9 },
  factValue: { flexGrow: 1, flexShrink: 1 },
  bulletRow: { marginTop: 4, flexDirection: "row" },
  bulletMark: { width: 10, color: "#79716b" },
  bulletText: { flexGrow: 1, flexShrink: 1 },
  markdownLine: { marginTop: 4, fontFamily: "Courier", fontSize: 8.5 },
});

function Runs({ text }: { text: string }) {
  return (
    <>
      {inlineRuns(text).map((run, index) => (
        <Text key={index} style={run.bold ? { fontFamily: "Helvetica-Bold" } : undefined}>
          {run.text}
        </Text>
      ))}
    </>
  );
}

function Blocks({ blocks, level }: { blocks: readonly BibleBlock[]; level: number }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "paragraph":
            return (
              <Text key={index} style={styles.paragraph}>
                <Runs text={block.text} />
              </Text>
            );

          case "facts":
            return (
              <View key={index}>
                {block.facts.map((fact) => (
                  <View key={fact.label} style={styles.factRow}>
                    <Text style={styles.factLabel}>{fact.label}</Text>
                    <Text style={styles.factValue}>{fact.value}</Text>
                  </View>
                ))}
              </View>
            );

          case "bullets":
            return (
              <View key={index}>
                {block.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>·</Text>
                    <Text style={styles.bulletText}>
                      <Runs text={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );

          case "subheading":
            return (
              <Text
                key={index}
                style={[styles.subheading, level >= 2 ? { fontSize: 7.5 } : {}]}
              >
                {block.text}
              </Text>
            );

          case "markdown":
            return (
              <View key={index}>
                {block.text
                  .split("\n")
                  .filter((line) => line.trim() !== "")
                  .map((line, lineIndex) => (
                    <Text key={lineIndex} style={styles.markdownLine}>
                      {line.trim().replace(/^-\s+/, "· ")}
                    </Text>
                  ))}
              </View>
            );

          case "entries":
            return (
              <View key={index}>
                {block.entries.map((entry) => (
                  <View key={entry.id} wrap={false}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Blocks blocks={entry.blocks} level={level + 1} />
                  </View>
                ))}
              </View>
            );
        }
      })}
    </>
  );
}

export function BiblePdf({
  bible,
  author,
}: {
  bible: BibleDocument;
  author?: string;
}) {
  return (
    <Document
      title={`${bible.title} — Story Bible`}
      author={author ?? "Character Profile & Story Bible Starter"}
      subject={bible.subtitle}
      creator="Character Profile & Story Bible Starter"
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{bible.title}</Text>
        <Text style={styles.subtitle}>{bible.subtitle}</Text>
        <Text style={styles.disclosure}>{bible.disclosure}</Text>

        {bible.sections.map((section) => (
          <View key={section.id}>
            <Text style={styles.sectionTitle}>
              {`${section.number}. ${section.title}`}
            </Text>
            <Blocks blocks={section.blocks} level={0} />
          </View>
        ))}

        {bible.pending.length > 0 ? (
          <Text style={[styles.paragraph, { color: "#79716b", fontStyle: "italic" }]}>
            {`Still to come in this bible: ${bible.pending.join(" · ")}.`}
          </Text>
        ) : null}
      </Page>
    </Document>
  );
}
