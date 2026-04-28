import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  FileText,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSong } from "@/hooks/useSongs";
import { useBandMembers } from "@/hooks/useBandMembers";
import { SECTION_COLOR } from "@/types/song";
import { cn } from "@/lib/utils";
import { LyricsViewer } from "@/components/LyricsViewer";
import { TransposeControl } from "@/components/TransposeControl";
import { useNotation } from "@/hooks/useNotation";
import { formatChord, transposeChord } from "@/lib/chords";

export default function SongView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: song, isLoading } = useSong(id);
  const { data: members } = useBandMembers();
  const [semitones, setSemitones] = useState(0);
  const [notation] = useNotation();

  if (isLoading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }
  if (!song) {
    return (
      <p className="py-12 text-center text-muted-foreground">Song not found.</p>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const from = (location.state as { from?: string } | null)?.from;
            if (from) navigate(from);
            else navigate("/");
          }}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to={`/songs/${song.id}/edit`}>
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Link>
        </Button>
      </div>

      <Card className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold leading-tight">{song.title}</h1>
          {song.musical_key && (
            <span className="rounded-md bg-primary px-3 py-1.5 text-xl font-bold text-primary-foreground">
              {formatChord(transposeChord(song.musical_key, semitones), notation)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {(song.verses_count ?? 0) > 0 && (
            <span className="rounded bg-secondary px-2 py-1">
              {song.verses_count} verses
            </span>
          )}
        </div>
        {song.intro_info && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Intro
            </p>
            <p className="mt-1 text-sm">{song.intro_info}</p>
          </div>
        )}
        {(song.intro_starter_ids?.length ?? 0) > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Începe intro-ul
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {song.intro_starter_ids.map((sid) => {
                const m = members?.find((x) => x.id === sid);
                if (!m) return null;
                return (
                  <span
                    key={sid}
                    className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary"
                  >
                    {m.name}
                    {m.instruments.length > 0 && (
                      <span className="ml-1 text-xs text-primary/70">
                        · {m.instruments.join(", ")}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {song.notes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{song.notes}</p>
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-base font-bold">Structure</h2>
        {song.structure?.length ? (
          <ol className="space-y-2">
            {song.structure.map((s, i) => (
              <li
                key={s.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="mt-0.5 text-sm font-bold text-muted-foreground">
                  {i + 1}.
                </span>
                <div className="flex-1 space-y-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                      SECTION_COLOR[s.type]
                    )}
                  >
                    {s.type}
                  </span>
                  {s.cue && <p className="text-sm">{s.cue}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No structure added.</p>
        )}
      </Card>

      {song.lyrics?.trim() && (
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold">Versuri & Acorduri</h2>
            <TransposeControl
              originalKey={song.musical_key}
              semitones={semitones}
              onChange={setSemitones}
            />
          </div>
          <LyricsViewer
            source={song.lyrics}
            semitones={semitones}
            notation={notation}
            size="md"
          />
        </Card>
      )}

      {(song.pdf_url || song.reference_url) && (
        <Card className="space-y-2 p-4">
          <h2 className="text-base font-bold">Resources</h2>
          {song.pdf_url && (
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={song.pdf_url} target="_blank" rel="noreferrer">
                <FileText className="mr-2 h-4 w-4" />
                View Sheet Music PDF
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>
          )}
          {song.reference_url && (
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={song.reference_url} target="_blank" rel="noreferrer">
                <Music className="mr-2 h-4 w-4" />
                Reference (YouTube/Spotify)
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>
          )}
        </Card>
      )}
    </section>
  );
}