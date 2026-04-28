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
    sm: { lyric: "text-sm", chord: "text-xs", lineGap: "py-3.5" },
    md: { lyric: "text-base", chord: "text-sm", lineGap: "py-4" },
    lg: { lyric: "text-2xl sm:text-3xl", chord: "text-lg sm:text-xl", lineGap: "py-5 sm:py-6" },
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
              return (
                <span
                  key={j}
                  className={cn("relative inline-block", sizeClasses.lyric)}
                  style={{ whiteSpace: "pre" }}
                >
                  {seg.chord && (
                    <span
                      className={cn(
                        "absolute -top-5 left-0 font-bold text-primary",
                        sizeClasses.chord
                      )}
                      style={{ whiteSpace: "pre" }}
                    >
                      {formatChord(seg.chord, notation)}
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
