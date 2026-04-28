import { useRef, useState } from "react";
import { Music2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LyricsViewer } from "./LyricsViewer";
import type { Notation } from "@/lib/chords";

const QUICK_CHORDS = [
  "C", "Cm", "C7",
  "D", "Dm", "D7",
  "E", "Em", "E7",
  "F", "Fm", "F7",
  "G", "Gm", "G7",
  "A", "Am", "A7",
  "B", "Bm", "B7",
  "F#", "F#m", "Bb",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  notation: Notation;
}

/**
 * Lyrics editor with a "Insert chord" helper. The user clicks anywhere in
 * the textarea, then clicks an inserted chord — it gets placed at the
 * cursor as `[CHORD]` without requiring spaces.
 */
export function LyricsEditor({ value, onChange, notation }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [chordInput, setChordInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const insertAtCursor = (chord: string) => {
    const ta = ref.current;
    if (!ta) {
      onChange(value + `[${chord}]`);
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const insert = `[${chord}]`;
    const next = value.slice(0, start) + insert + value.slice(end);
    onChange(next);
    // Restore cursor right after the inserted chord
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + insert.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Music2 className="mr-1.5 h-4 w-4" />
              Inserează acord
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3" align="start">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acord personalizat
              </p>
              <div className="flex gap-2">
                <Input
                  value={chordInput}
                  onChange={(e) => setChordInput(e.target.value)}
                  placeholder="ex. Cmaj7, F#m, Bb/D"
                  className="h-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chordInput.trim()) {
                      e.preventDefault();
                      insertAtCursor(chordInput.trim());
                      setChordInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (!chordInput.trim()) return;
                    insertAtCursor(chordInput.trim());
                    setChordInput("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rapide
              </p>
              <div className="grid grid-cols-6 gap-1">
                {QUICK_CHORDS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => insertAtCursor(c)}
                    className="rounded border border-border bg-card px-1 py-1 text-xs font-bold hover:bg-accent"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant={previewMode ? "default" : "outline"}
          size="sm"
          onClick={() => setPreviewMode((v) => !v)}
        >
          {previewMode ? (
            <>
              <Pencil className="mr-1.5 h-4 w-4" />
              Editează
            </>
          ) : (
            <>
              <Eye className="mr-1.5 h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>

      {previewMode ? (
        <div className="min-h-[160px] rounded-md border border-border bg-card p-4">
          {value.trim() ? (
            <LyricsViewer source={value} notation={notation} size="md" />
          ) : (
            <p className="text-sm text-muted-foreground">Niciun vers introdus.</p>
          )}
        </div>
      ) : (
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="font-mono text-sm leading-relaxed"
          placeholder={`Scrie versurile aici. Pune cursorul unde vrei un acord și apasă „Inserează acord".\n\nExemplu:\n[C]Doamne sfânt, [G]rege al [Am]meu\n[F]Te slă[C]vesc în [G]veci`}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Format: <code className="rounded bg-muted px-1">[Acord]</code> oriunde în text.
        Acordurile se afișează deasupra literei imediat următoare.
      </p>
    </div>
  );
}
