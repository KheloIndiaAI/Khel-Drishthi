import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = 'error' | 'success' | 'info';

interface ValidationMessageProps {
  message: string;
  type?: MessageType;
  show?: boolean;
}

export function ValidationMessage({ 
  message, 
  type = 'error',
  show = true 
}: ValidationMessageProps) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  };
  
  const Icon = icons[type];
  
  const styles = {
    error: "text-destructive",
    success: "text-accent",
    info: "text-muted-foreground",
  };

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -5, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -5, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("flex items-center gap-1.5 mt-1.5", styles[type])}
        >
          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-xs">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ValidationSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function ValidationSummary({ errors, className }: ValidationSummaryProps) {
  const errorList = Object.entries(errors);
  
  if (errorList.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mt-6 p-4 rounded-lg border border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="flex items-center gap-2 text-destructive font-medium mb-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Please fix the following errors:</span>
      </div>
      <ul className="space-y-1 pl-6">
        {errorList.map(([field, error]) => (
          <li key={field} className="text-xs text-destructive/80 list-disc">
            {error}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
