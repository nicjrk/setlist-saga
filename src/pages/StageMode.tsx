import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, List, Eye, EyeOff } from "lucide-react";
import { useSetlist } from "@/hooks/useSetlists";
import { useSongs } from "@/hooks/useSongs";
import { useBandMembers } from "@/hooks/useBandMembers";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LyricsViewer } from "@/components/LyricsViewer";
import { TransposeControl } from "@/components/TransposeControl";
import { useNotation } from "@/hooks/useNotation";
import { formatChord, transposeChord } from "@/lib/chords";

export default function StageMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: setlist, isLoading } = useSetlist(id);
  const { data: songs } = useSongs();
  const { data: members } = useBandMembers();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [transposeMap, setTransposeMap] = useState<Record<string, number>>({});
  const [notation] = useNotation();
  const [showLyrics, setShowLyrics] = useState(true);

  const songMap = useMemo(() => new Map(songs?.map((s) => [s.id, s])), [songs]);
  const items = useMemo(
    () =>
      (setlist?.song_ids ?? [])
        .map((sid) => songMap.get(sid))
        .filter((x): x is NonNullable<typeof x> => !!x),
    [setlist, songMap]
  );

  useEffect(() => {
    setIndex(0);
    setTransposeMap({});
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        navigate(`/setlists/${id}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stage-bg text-stage-fg">
        Loading…
      </div>
    );
  }

  if (!setlist || items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stage-bg p-6 text-center text-stage-fg">
        <p className="text-xl font-bold">No songs in this setlist.</p>
        <button
          onClick={() => navigate(`/setlists/${id}`)}
          className="rounded-lg bg-stage-accent px-6 py-3 font-bold text-stage-bg"
        >
          Back to setlist
        </button>
      </div>
    );
  }

  const song = items[index];
  const semitones = transposeMap[song.id] ?? 0;
  const setSongSemitones = (n: number) =>
    setTransposeMap((m) => ({ ...m, [song.id]: n }));

  return (
    <div className="flex min-h-screen flex-col bg-stage-bg text-stage-fg">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-stage-muted hover:bg-white/5"
              aria-label="Open setlist"
            >
              <List className="h-5 w-5" />
              Setlist
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-stage-bg text-stage-fg">
            <SheetHeader>
              <SheetTitle className="text-stage-fg">{setlist.name}</SheetTitle>
            </SheetHeader>
            <ol className="mt-4 space-y-1">
              {items.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setIndex(i);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-base font-bold",
                      i === index
                        ? "bg-stage-accent text-stage-bg"
                        : "hover:bg-white/5"
                    )}
                  >
                    <span>
                      {i + 1}. {s.title}
                    </span>
                    {s.musical_key && <span>{s.musical_key}</span>}
                  </button>
                </li>
              ))}
            </ol>
          </SheetContent>
        </Sheet>

        <p className="text-xs font-bold uppercase tracking-widest text-stage-muted">
          {index + 1} / {items.length} · {setlist.name}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLyrics((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-stage-muted hover:bg-white/5"
            aria-label={showLyrics ? "Hide lyrics" : "Show lyrics"}
          >
            {showLyrics ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {showLyrics ? "Hide lyrics" : "Show lyrics"}
            </span>
          </button>
          <button
            onClick={() => navigate(`/setlists/${id}`)}
            className="rounded-lg p-2 text-stage-muted hover:bg-white/5"
            aria-label="Exit stage mode"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <button
        type="button"
        onClick={() =>
          setIndex((i) => Math.min(i + 1, items.length - 1))
        }
        className="flex flex-1 flex-col items-stretch gap-8 px-6 py-8 text-left"
      >
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
            Now Playing
          </p>
          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            {song.title}
          </h1>
        </div>

        {song.musical_key && (
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
              Key
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-7xl font-black text-stage-accent sm:text-8xl">
                {formatChord(transposeChord(song.musical_key, semitones), notation)}
              </p>
              <div onClick={(e) => e.stopPropagation()}>
                <TransposeControl
                  originalKey={song.musical_key}
                  semitones={semitones}
                  onChange={setSongSemitones}
                  compact
                />
              </div>
            </div>
          </div>
        )}

        {song.intro_info && (
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
              Intro
            </p>
            <p className="text-3xl font-bold leading-snug sm:text-4xl">
              {song.intro_info}
            </p>
          </div>
        )}

        {(song.intro_starter_ids?.length ?? 0) > 0 && (
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
              Începe
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {song.intro_starter_ids.map((sid) => {
                const m = members?.find((x) => x.id === sid);
                if (!m) return null;
                return (
                  <span
                    key={sid}
                    className="rounded-lg border-2 border-stage-accent/60 bg-stage-accent/10 px-3 py-1.5 text-2xl font-bold text-stage-accent sm:text-3xl"
                  >
                    {m.name}
                    {m.instruments.length > 0 && (
                      <span className="ml-2 text-lg font-medium text-stage-accent/80 sm:text-xl">
                        · {m.instruments.join(", ")}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {song.structure?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
              Structure
            </p>
            <ol className="space-y-2">
              {song.structure.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-baseline gap-3 border-l-4 border-stage-accent/60 pl-3 text-2xl font-bold sm:text-3xl"
                >
                  <span className="text-stage-muted">{i + 1}.</span>
                  <span className="uppercase">{s.type}</span>
                  {s.cue && (
                    <span className="text-xl font-medium text-stage-muted sm:text-2xl">
                      — {s.cue}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {showLyrics && song.lyrics?.trim() && (
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-widest text-stage-muted">
              Versuri
            </p>
            <LyricsViewer
              source={song.lyrics}
              semitones={semitones}
              notation={notation}
              size="lg"
              className="text-stage-fg"
            />
          </div>
        )}
      </button>

      {/* Footer controls */}
      <footer className="grid grid-cols-2 border-t border-white/10">
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="flex items-center justify-center gap-2 py-6 text-lg font-bold text-stage-fg hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
          Prev
        </button>
        <button
          onClick={() =>
            setIndex((i) => Math.min(i + 1, items.length - 1))
          }
          disabled={index === items.length - 1}
          className="flex items-center justify-center gap-2 border-l border-white/10 py-6 text-lg font-bold text-stage-fg hover:bg-white/5 disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-6 w-6" />
        </button>
      </footer>
    </div>
  );
}