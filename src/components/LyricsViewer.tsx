import { useMemo } from "react";
import {
  formatChord,
  parseChordProLine,
  transposeChordPro,
  type Notation,
} from "@/lib/chords";
import { cn } from "@/lib/utils";

interface Props {
  source: string;
  semitones?: number;
  notation?: Notation;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders ChordPro lyrics with chords aligned above the lyric character
 * they should fall on. Each segment is an inline-block with the chord
 * absolutely positioned above the first character of `text`.
 */
export function LyricsViewer({
  source,
  semitones = 0,
  notation = "intl",
  size = "md",
  className,
}: Props) {
  const transposed = useMemo(
    () => transposeChordPro(source ?? "", semitones),
    [source, semitones]
  );

  const lines = transposed.split("\n");

  const sizeClasses = {
    xs: { lyric: "text-xs", chord: "text-[10px]", lineGap: "pt-3 pb-0.5", chordEm: 0.5 },
    sm: { lyric: "text-sm", chord: "text-xs", lineGap: "pt-3.5 pb-0.5", chordEm: 0.55 },
    md: { lyric: "text-base", chord: "text-sm", lineGap: "pt-4 pb-0.5", chordEm: 0.6 },
    lg: { lyric: "text-xl sm:text-2xl", chord: "text-base sm:text-lg", lineGap: "pt-5 pb-1", chordEm: 0.6 },
  }[size];

  return (
    <div className={cn("font-mono leading-relaxed whitespace-pre-wrap", className)}>
      {lines.map((line, i) => {
        const segments = parseChordProLine(line);
        const hasChord = segments.some((s) => !!s.chord);
        const isBlank = line.trim() === "";

        if (isBlank) {
          return <div key={i} className="h-4" aria-hidden />;
        }

        return (
          <div
            key={i}
            className={cn(
              "relative flex flex-wrap items-end",
              hasChord && sizeClasses.lineGap
            )}
          >
            {segments.map((seg, j) => {
              if (!seg.chord && !seg.text) return null;
              const display = seg.text.length > 0 ? seg.text : "\u00A0";
              const chordText = seg.chord ? formatChord(seg.chord, notation) : "";
              // Reserve enough horizontal space so the absolutely-positioned
              // chord above the segment never overlaps the next chord/lyric.
              const minWidthEm = chordText
                ? Math.max(chordText.length * sizeClasses.chordEm + 0.3, 0)
                : 0;
              return (
                <span
                  key={j}
                  className={cn("relative inline-block align-bottom", sizeClasses.lyric)}
                  style={{
                    whiteSpace: "pre",
                    minWidth: minWidthEm ? `${minWidthEm}em` : undefined,
                    paddingRight: chordText ? "0.15em" : undefined,
                  }}
                >
                  {chordText && (
                    <span
                      className={cn(
                        "absolute left-0 font-bold text-primary",
                        sizeClasses.chord
                      )}
                      style={{ whiteSpace: "pre", top: "-1.05em" }}
                    >
                      {chordText}
                    </span>
                  )}
                  {display}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
