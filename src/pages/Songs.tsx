import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Music2, FileText, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSongs } from "@/hooks/useSongs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Songs() {
  const { data: songs, isLoading } = useSongs();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!songs) return [];
    const t = q.trim().toLowerCase();
    if (!t) return songs;
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        (s.musical_key ?? "").toLowerCase().includes(t)
    );
  }, [songs, q]);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Songs</h1>
          <p className="text-sm text-muted-foreground">
            Your band's repertoire
          </p>
        </div>
        <Button asChild size="lg" className="h-11">
          <Link to="/songs/new">
            <Plus className="mr-1 h-5 w-5" />
            New Song
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or key…"
          className="h-11 pl-9"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Music2 className="h-6 w-6" />
          </div>
          <p className="font-medium">No songs yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first song to start building your repertoire.
          </p>
          <Button asChild className="mt-2">
            <Link to="/songs/new">
              <Plus className="mr-1 h-4 w-4" />
              Add Song
            </Link>
          </Button>
        </Card>
      )}

      <ul className="space-y-2">
        {filtered.map((s) => (
          <li key={s.id}>
            <Link
              to={`/songs/${s.id}`}
              className="block rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50 hover:bg-card/80"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">{s.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {s.musical_key && (
                      <span className="rounded bg-primary/15 px-2 py-0.5 font-bold text-primary">
                        {s.musical_key}
                      </span>
                    )}
                    <span>{s.structure?.length ?? 0} sections</span>
                    {s.pdf_url && (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        PDF
                      </span>
                    )}
                    {s.reference_url && (
                      <span className="inline-flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Link
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}