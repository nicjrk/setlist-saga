import { useEffect, useState } from "react";
import type { Notation } from "@/lib/chords";

const KEY = "mello.notation";

function read(): Notation {
  if (typeof window === "undefined") return "intl";
  const v = localStorage.getItem(KEY);
  return v === "ro" ? "ro" : "intl";
}

/**
 * Persisted user preference for chord notation.
 * Syncs across components/tabs via the `storage` event and a custom event.
 */
export function useNotation(): [Notation, (n: Notation) => void] {
  const [notation, setNotation] = useState<Notation>(read);

  useEffect(() => {
    const onChange = () => setNotation(read());
    window.addEventListener("storage", onChange);
    window.addEventListener("mello:notation", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("mello:notation", onChange);
    };
  }, []);

  const update = (n: Notation) => {
    localStorage.setItem(KEY, n);
    setNotation(n);
    window.dispatchEvent(new Event("mello:notation"));
  };

  return [notation, update];
}
