import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseKeyboardNavigationProps {
  currentSection: number;
  totalSections: number;
  onSectionChange: (index: number) => void;
  onSave: () => void;
}

export function useKeyboardNavigation({
  currentSection,
  totalSections,
  onSectionChange,
  onSave,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                     target.isContentEditable;
    
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      onSave();
      toast.success("Form saved", { duration: 1500 });
      return;
    }
    
    // Don't handle navigation shortcuts if typing
    if (isTyping) return;
    
    // Alt + Arrow keys for navigation
    if (event.altKey) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentSection > 0) {
          onSectionChange(currentSection - 1);
          toast.info(`Section ${currentSection}`, { duration: 1000 });
        }
        return;
      }
      
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentSection < totalSections) {
          onSectionChange(currentSection + 1);
          toast.info(`Section ${currentSection + 2}`, { duration: 1000 });
        }
        return;
      }
    }
    
    // Number keys 1-9 + 0 for direct section navigation
    if (event.altKey && /^[0-9]$/.test(event.key)) {
      event.preventDefault();
      const sectionIndex = event.key === '0' ? 9 : parseInt(event.key) - 1;
      if (sectionIndex <= totalSections) {
        onSectionChange(sectionIndex);
        toast.info(`Jumped to section ${sectionIndex + 1}`, { duration: 1000 });
      }
      return;
    }
  }, [currentSection, totalSections, onSectionChange, onSave]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save form' },
      { keys: ['Alt', '←/→'], description: 'Previous/Next section' },
      { keys: ['Alt', '1-9'], description: 'Jump to section' },
    ],
  };
}
