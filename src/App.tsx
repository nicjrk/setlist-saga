import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/AppShell";
import Songs from "./pages/Songs";
import SongView from "./pages/SongView";
import SongEditor from "./pages/SongEditor";
import Setlists from "./pages/Setlists";
import SetlistView from "./pages/SetlistView";
import SetlistEditor from "./pages/SetlistEditor";
import StageMode from "./pages/StageMode";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Songs />} />
            <Route path="/songs/new" element={<SongEditor />} />
            <Route path="/songs/:id" element={<SongView />} />
            <Route path="/songs/:id/edit" element={<SongEditor />} />
            <Route path="/setlists" element={<Setlists />} />
            <Route path="/setlists/new" element={<SetlistEditor />} />
            <Route path="/setlists/:id" element={<SetlistView />} />
            <Route path="/setlists/:id/edit" element={<SetlistEditor />} />
            <Route path="/stage/:id" element={<StageMode />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
