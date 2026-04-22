import { Link } from "react-router-dom";
import { Plus, ListMusic, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSetlists } from "@/hooks/useSetlists";
import { Skeleton } from "@/components/ui/skeleton";

export default function Setlists() {
  const { data: setlists, isLoading } = useSetlists();

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Setlists</h1>
          <p className="text-sm text-muted-foreground">Programs for your shows</p>
        </div>
        <Button asChild size="lg" className="h-11">
          <Link to="/setlists/new">
            <Plus className="mr-1 h-5 w-5" /> New
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (setlists?.length ?? 0) === 0 && (
        <Card className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ListMusic className="h-6 w-6" />
          </div>
          <p className="font-medium">No setlists yet</p>
          <p className="text-sm text-muted-foreground">
            Build your first program for the next gig.
          </p>
          <Button asChild className="mt-2">
            <Link to="/setlists/new">
              <Plus className="mr-1 h-4 w-4" /> New Setlist
            </Link>
          </Button>
        </Card>
      )}

      <ul className="space-y-2">
        {setlists?.map((sl) => (
          <li key={sl.id}>
            <div className="flex items-stretch gap-2">
              <Link
                to={`/setlists/${sl.id}`}
                className="flex-1 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
              >
                <p className="text-base font-semibold">{sl.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sl.song_ids?.length ?? 0} songs
                </p>
              </Link>
              <Button asChild size="lg" className="h-auto px-4">
                <Link to={`/stage/${sl.id}`} aria-label="Stage mode">
                  <Play className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}