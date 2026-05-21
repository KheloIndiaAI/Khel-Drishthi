import { Search } from "lucide-react";
import { useGlobalSearch } from "./GlobalSearch";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  placeholder?: string;
  showShortcut?: boolean;
}

export const GlobalSearchTrigger = ({
  className,
  placeholder = "Search sports, states, centres…",
  showShortcut = true,
}: Props) => {
  const { setOpen } = useGlobalSearch();
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 h-10 text-sm text-muted-foreground hover:bg-accent/40 transition-colors",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="truncate flex-1 text-left">{placeholder}</span>
      {showShortcut && (
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      )}
    </button>
  );
};
