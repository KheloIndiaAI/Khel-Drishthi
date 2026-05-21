import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGlobalSearchIndex, SearchEntityType, SearchItem } from "@/hooks/useGlobalSearchIndex";
import { Trophy, Layers, Flag, Building2, MapPin, Map, Award } from "lucide-react";

interface SearchCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const SearchContext = createContext<SearchCtx>({ open: false, setOpen: () => {} });
export const useGlobalSearch = () => useContext(SearchContext);

const TYPE_META: Record<SearchEntityType, { label: string; icon: React.ComponentType<{ className?: string }>; order: number }> = {
  sport:      { label: "Sports",            icon: Trophy,     order: 1 },
  discipline: { label: "Disciplines",       icon: Layers,     order: 2 },
  event:      { label: "Events",            icon: Award,      order: 3 },
  centre:     { label: "Centres",           icon: Building2,  order: 4 },
  state:      { label: "States",            icon: Flag,       order: 5 },
  district:   { label: "Districts",         icon: MapPin,     order: 6 },
  region:     { label: "Regional Centres",  icon: Map,        order: 7 },
};

const PER_GROUP = 6;

export const GlobalSearchProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { index, isLoading } = useGlobalSearchIndex();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isTyping(e))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups: Record<SearchEntityType, SearchItem[]> = {
      sport: [], discipline: [], event: [], centre: [], state: [], district: [], region: [],
    };
    if (!q) {
      // Show a few popular suggestions when empty
      for (const it of index) {
        if (it.type === "sport" && groups.sport.length < PER_GROUP) groups.sport.push(it);
      }
      return groups;
    }
    for (const it of index) {
      if (groups[it.type].length >= PER_GROUP) continue;
      if (it.keywords.includes(q)) groups[it.type].push(it);
    }
    return groups;
  }, [index, query]);

  const handleSelect = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    navigate(item.route);
  };

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search sports, states, districts, centres, events…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground text-center">Loading index…</div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              {(Object.keys(grouped) as SearchEntityType[])
                .sort((a, b) => TYPE_META[a].order - TYPE_META[b].order)
                .filter((t) => grouped[t].length > 0)
                .map((t) => {
                  const Icon = TYPE_META[t].icon;
                  return (
                    <CommandGroup key={t} heading={query ? `${TYPE_META[t].label} (${grouped[t].length})` : TYPE_META[t].label}>
                      {grouped[t].map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.label} ${item.keywords}`}
                          onSelect={() => handleSelect(item)}
                          className="flex items-start gap-3"
                        >
                          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{item.label}</div>
                            {item.sublabel && (
                              <div className="text-xs text-muted-foreground truncate">{item.sublabel}</div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </SearchContext.Provider>
  );
};

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (t as HTMLElement).isContentEditable;
}
