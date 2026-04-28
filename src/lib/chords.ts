// ChordPro parsing, transposition, and notation conversion utilities.

export type Notation = "intl" | "ro";

const SHARP_SCALE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLAT_SCALE = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const RO_FROM_INTL: Record<string, string> = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

// Romanian-friendly common keys list
export const KEY_OPTIONS_INTL = [
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
  "A",
  "A#",
  "Bb",
  "B",
];

function noteToIndex(note: string): number {
  const idx = SHARP_SCALE.indexOf(note);
  if (idx >= 0) return idx;
  const flatIdx = FLAT_SCALE.indexOf(note);
  return flatIdx;
}

function indexToNote(i: number, preferFlat: boolean): string {
  const n = ((i % 12) + 12) % 12;
  return preferFlat ? FLAT_SCALE[n] : SHARP_SCALE[n];
}

/**
 * Parses a single chord token like "C", "C#m7", "F/G", "Bbsus4".
 * Returns null if it doesn't look like a chord.
 */
export interface ParsedChord {
  root: string; // e.g. "C", "C#", "Bb"
  quality: string; // e.g. "m7", "sus4", ""
  bass?: string; // e.g. "G" in C/G
}

const CHORD_REGEX = /^([A-G][#b]?)([^/\s]*)(?:\/([A-G][#b]?))?$/;

export function parseChord(token: string): ParsedChord | null {
  const m = token.match(CHORD_REGEX);
  if (!m) return null;
  return { root: m[1], quality: m[2] ?? "", bass: m[3] };
}

/** Transpose a chord token by N semitones. */
export function transposeChord(token: string, semitones: number): string {
  const parsed = parseChord(token);
  if (!parsed) return token;
  const preferFlat = parsed.root.includes("b");
  const newRoot = indexToNote(noteToIndex(parsed.root) + semitones, preferFlat);
  const newBass = parsed.bass
    ? indexToNote(noteToIndex(parsed.bass) + semitones, preferFlat)
    : undefined;
  return newRoot + parsed.quality + (newBass ? "/" + newBass : "");
}

/** Convert a chord token from international to Romanian notation (or back). */
export function formatChord(token: string, notation: Notation): string {
  if (notation === "intl") return token;
  const parsed = parseChord(token);
  if (!parsed) return token;
  const ro = (root: string) => {
    const base = root[0];
    const accidental = root.slice(1);
    return (RO_FROM_INTL[base] ?? base) + accidental;
  };
  // Romanian: minor chords often written like "Lam" (la minor) — keep quality as-is
  // but lowercase "m" is fine. We just translate the root letter.
  return (
    ro(parsed.root) +
    parsed.quality +
    (parsed.bass ? "/" + ro(parsed.bass) : "")
  );
}

/** Compute semitone delta between two keys (e.g. C -> D = +2). */
export function semitoneDelta(fromKey: string, toKey: string): number {
  const a = noteToIndex(fromKey);
  const b = noteToIndex(toKey);
  if (a < 0 || b < 0) return 0;
  return b - a;
}

/**
 * Parse one ChordPro line into segments of plain text and chords.
 * Example: "He[C]llo [G]world" => [
 *   { text: "He" },
 *   { chord: "C", text: "llo " },
 *   { chord: "G", text: "world" },
 * ]
 * If a chord appears at the very start (no preceding text), the first
 * segment will have empty text.
 */
export interface LineSegment {
  chord?: string;
  text: string;
}

export function parseChordProLine(line: string): LineSegment[] {
  const segments: LineSegment[] = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let pendingChord: string | undefined = undefined;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    const text = line.slice(lastIndex, match.index);
    segments.push({ chord: pendingChord, text });
    pendingChord = match[1];
    lastIndex = match.index + match[0].length;
  }
  segments.push({ chord: pendingChord, text: line.slice(lastIndex) });
  return segments;
}

/**
 * Transpose all chords in a ChordPro string by N semitones, preserving text.
 */
export function transposeChordPro(source: string, semitones: number): string {
  if (!semitones) return source;
  return source.replace(/\[([^\]]+)\]/g, (_, ch) => {
    return "[" + transposeChord(ch, semitones) + "]";
  });
}
