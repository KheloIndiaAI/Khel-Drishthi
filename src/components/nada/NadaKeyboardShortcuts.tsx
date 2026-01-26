import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface NadaKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "← / →", description: "Previous / Next slide" },
  { key: "↑ / ↓", description: "Previous / Next slide" },
  { key: "Space", description: "Next slide" },
  { key: "1-9", description: "Jump to slide 1-9" },
  { key: "F", description: "Toggle fullscreen" },
  { key: "?", description: "Show/hide this help" },
  { key: "Esc", description: "Close help / Exit fullscreen" },
];

export const NadaKeyboardShortcuts = ({ isOpen, onClose }: NadaKeyboardShortcutsProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="nada-glass-card rounded-2xl p-6 mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
                    <Keyboard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Keyboard Shortcuts</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <kbd className="px-3 py-1.5 rounded-md bg-muted text-sm font-mono font-semibold text-foreground border border-border">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Press <kbd className="px-2 py-0.5 rounded bg-muted font-mono text-xs">?</kbd> or <kbd className="px-2 py-0.5 rounded bg-muted font-mono text-xs">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
