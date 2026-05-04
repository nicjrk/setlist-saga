import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Play, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSetlist } from "@/hooks/useSetlists";
import { useSongs } from "@/hooks/useSongs";

export default function SetlistView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: setlist, isLoading } = useSetlist(id);
  const { data: songs } = useSongs();

  if (isLoading)
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  if (!setlist)
    return (
      <p className="py-12 text-center text-muted-foreground">
        Setlist not found.
      </p>
    );

  const songMap = new Map(songs?.map((s) => [s.id, s]));
  const items = (setlist.song_ids ?? []).map((sid) => songMap.get(sid));

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/setlists")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={`/print/setlist/${setlist.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Printer className="mr-1 h-4 w-4" /> Export
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/setlists/${setlist.id}/edit`}>
              <Edit className="mr-1 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>
      </div>

      <Card className="space-y-2 p-5">
        <h1 className="text-2xl font-bold">{setlist.name}</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} songs · ready for the stage
        </p>
        <Button asChild size="lg" className="mt-2 h-12 w-full text-base font-bold">
          <Link to={`/stage/${setlist.id}`}>
            <Play className="mr-2 h-5 w-5" /> Enter Stage Mode
          </Link>
        </Button>
      </Card>

      <Card className="p-2">
        <ol className="divide-y divide-border">
          {items.map((s, i) => (
            <li key={i} className="flex items-center gap-3 px-3 py-3">
              <span className="w-6 text-center text-lg font-bold text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {s?.title ?? "Unknown song"}
                </p>
              </div>
              {s?.musical_key && (
                <span className="rounded bg-primary/15 px-2 py-1 font-bold text-primary">
                  {s.musical_key}
                </span>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              No songs in this setlist yet.
            </li>
          )}
        </ol>
      </Card>
    </section>
  );
}