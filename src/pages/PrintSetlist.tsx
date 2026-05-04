import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSetlist } from "@/hooks/useSetlists";
import { PrintSetlistInner, PrintToolbar } from "./PrintSong";

export default function PrintSetlist() {
  const { id } = useParams();
  const { data: setlist } = useSetlist(id);
  const [params] = useSearchParams();
  const auto = params.get("print") === "1";

  useEffect(() => {
    if (auto && setlist) {
      const t = setTimeout(() => window.print(), 800);
      return () => clearTimeout(t);
    }
  }, [auto, setlist]);

  if (!setlist) return <p className="p-8 text-center">Loading…</p>;
  return (
    <div className="print-root">
      <PrintToolbar />
      <header className="print-cover no-print mb-4">
        <h1 className="text-2xl font-black">{setlist.name}</h1>
        <p className="text-sm text-neutral-500">{setlist.song_ids.length} piese</p>
      </header>
      <PrintSetlistInner ids={setlist.song_ids} />
    </div>
  );
}