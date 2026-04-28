import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotation } from "@/hooks/useNotation";
import { formatChord, transposeChord } from "@/lib/chords";

interface Props {
  /** Original key of the song (in international notation, e.g. "C", "F#"). */
  originalKey?: string | null;
  semitones: number;
  onChange: (semitones: number) => void;
  compact?: boolean;
}

/** Live, non-destructive transpose control with notation toggle. */
export function TransposeControl({
  originalKey,
  semitones,
  onChange,
  compact = false,
}: Props) {
  const [notation, setNotation] = useNotation();

  const currentKey = originalKey
    ? transposeChord(originalKey, semitones)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(semitones - 1)}
          aria-label="Transpose down"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="min-w-[3.5rem] px-1 text-center text-sm font-bold">
          {currentKey ? (
            <span className="text-primary">
              {formatChord(currentKey, notation)}
            </span>
          ) : (
            <span>{semitones > 0 ? `+${semitones}` : semitones}</span>
          )}
          {currentKey && originalKey && semitones !== 0 && (
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">
              ({semitones > 0 ? `+${semitones}` : semitones})
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(semitones + 1)}
          aria-label="Transpose up"
        >
          <Plus className="h-4 w-4" />
        </Button>
        {semitones !== 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onChange(0)}
            aria-label="Reset transpose"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {!compact && (
        <Select
          value={notation}
          onValueChange={(v) => setNotation(v as "intl" | "ro")}
        >
          <SelectTrigger className="h-10 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="intl">C, D, E…</SelectItem>
            <SelectItem value="ro">Do, Re, Mi…</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}