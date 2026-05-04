import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSong, useSongs } from "@/hooks/useSongs";
import { useBandMembers } from "@/hooks/useBandMembers";
import { LyricsViewer } from "@/components/LyricsViewer";
import { useNotation } from "@/hooks/useNotation";
import { formatChord, transposeChord } from "@/lib/chords";
import type { Song } from "@/types/song";

/**
 * Print-optimized layout: each song fits one A4 page.
 * Uses a CSS-scaling wrapper to shrink content if it overflows the page.
 */
function SongSheet({
  song,
  notation,
}: {
  song: Song;
  notation: "intl" | "ro";
}) {
  const { data: members } = useBandMembers();
  const innerRef = useRef<HTMLDivElement>(null);

  // After layout, scale down to fit page if overflow.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const fit = () => {
      inner.style.transform = "scale(1)";
      inner.style.transformOrigin = "top left";
      const parent = inner.parentElement!;
      const ph = parent.clientHeight;
      const pw = parent.clientWidth;
      const ih = inner.scrollHeight;
      const iw = inner.scrollWidth;
      const s = Math.min(1, ph / Math.max(ih, 1), pw / Math.max(iw, 1));
      if (s < 1) {
        inner.style.transform = `scale(${s})`;
        inner.style.width = `${100 / s}%`;
      }
    };
    fit();
    // Run again after fonts settle.
    const t = setTimeout(fit, 200);
    return () => clearTimeout(t);
  }, [song.id]);

  const starters = (song.intro_starter_ids ?? [])
    .map((sid) => members?.find((m) => m.id === sid))
    .filter(Boolean);

  return (
    <article className="print-page">
      <div className="print-inner" ref={innerRef}>
        <header className="flex items-start justify-between gap-4 border-b border-neutral-300 pb-2 mb-3">
          <div>
            <h1 className="text-2xl font-black leading-tight">{song.title}</h1>
            {song.intro_info && (
              <p className="mt-1 text-sm">
                <span className="font-bold uppercase tracking-wide text-neutral-500">Intro: </span>
                {song.intro_info}
              </p>
            )}
          </div>
          {song.musical_key && (
            <span className="rounded-md bg-neutral-900 px-3 py-1.5 text-2xl font-black text-white leading-none">
              {formatChord(song.musical_key, notation)}
            </span>
          )}
        </header>

        {(starters.length > 0 || (song.structure?.length ?? 0) > 0) && (
          <div className="mb-3 grid gap-2 text-xs sm:grid-cols-2">
            {starters.length > 0 && (
              <div>
                <p className="font-bold uppercase tracking-wide text-neutral-500">Începe</p>
                <p>
                  {starters
                    .map((m) =>
                      m!.instruments.length
                        ? `${m!.name} (${m!.instruments.join(", ")})`
                        : m!.name
                    )
                    .join(" · ")}
                </p>
              </div>
            )}
            {song.structure?.length > 0 && (
              <div>
                <p className="font-bold uppercase tracking-wide text-neutral-500">Structură</p>
                <p>
                  {song.structure
                    .map((s, i) =>
                      `${i + 1}.${s.type}${s.cue ? ` (${s.cue})` : ""}`
                    )
                    .join(" → ")}
                </p>
              </div>
            )}
          </div>
        )}

        {song.lyrics?.trim() ? (
          <LyricsViewer
            source={song.lyrics}
            semitones={0}
            notation={notation}
            size="sm"
          />
        ) : (
          <p className="text-sm italic text-neutral-500">Niciun vers înregistrat.</p>
        )}

        {song.notes && (
          <div className="mt-3 border-t border-neutral-200 pt-2 text-xs text-neutral-700">
            <span className="font-bold uppercase tracking-wide text-neutral-500">Note: </span>
            {song.notes}
          </div>
        )}
      </div>
    </article>
  );
}

export default function PrintSong() {
  const { id } = useParams();
  const { data: song } = useSong(id);
  const [notation] = useNotation();
  const [params] = useSearchParams();
  const auto = params.get("print") === "1";

  useEffect(() => {
    if (auto && song) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [auto, song]);

  if (!song) {
    return <p className="p-8 text-center">Loading…</p>;
  }
  return (
    <div className="print-root">
      <PrintToolbar />
      <SongSheet song={song} notation={notation} />
    </div>
  );
}

export function PrintSetlistInner({ ids }: { ids: string[] }) {
  const { data: songs } = useSongs();
  const [notation] = useNotation();
  const ordered = ids
    .map((id) => songs?.find((s) => s.id === id))
    .filter((s): s is Song => !!s);
  return (
    <>
      {ordered.map((s) => (
        <SongSheet key={s.id} song={s} notation={notation} />
      ))}
    </>
  );
}

export function PrintToolbar() {
  return (
    <div className="print-toolbar no-print">
      <button onClick={() => window.print()} className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-bold">
        Print / Save as PDF
      </button>
      <span className="text-xs text-neutral-500">
        Tip: în dialog alege „Save as PDF" sau „Share".
      </span>
    </div>
  );
}