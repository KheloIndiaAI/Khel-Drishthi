import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormQuestion {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'year';
  question: string;
  description?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  prefilled?: boolean;
  prefilledValue?: string | number | string[];
}

interface ConversationalStepProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export const ConversationalStep: React.FC<ConversationalStepProps> = ({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  questionNumber,
  totalQuestions,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showPrefilled, setShowPrefilled] = useState(Boolean(question.prefilled && question.prefilledValue));

  useEffect(() => {
    // Auto-focus input on mount
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, [question.id]);

  // Handle Enter key to proceed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && question.type !== 'textarea') {
        e.preventDefault();
        if (value || !question.required) {
          onNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, question.required, question.type, onNext]);

  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'number':
      case 'year':
        return (
          <div className="relative">
            {showPrefilled && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Pre-filled from existing data</span>
              </motion.div>
            )}
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={question.type === 'year' ? 'number' : question.type}
              value={value || ''}
              onChange={(e) => {
                setShowPrefilled(false);
                onChange(e.target.value);
              }}
              placeholder={question.placeholder || 'Type your answer...'}
              className="text-xl md:text-2xl py-6 px-4 border-2 border-border focus:border-primary transition-colors bg-background"
              min={question.type === 'year' ? 1900 : undefined}
              max={question.type === 'year' ? 2100 : undefined}
            />
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Type your answer...'}
            className="text-lg min-h-[150px] border-2 border-border focus:border-primary transition-colors bg-background"
            rows={5}
          />
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            className="grid gap-3"
          >
            {question.options?.map((option, idx) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Label
                  htmlFor={`${question.id}-${idx}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    value === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                  <span className="text-lg">{option}</span>
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="grid gap-3">
            {showPrefilled && selectedValues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Pre-selected from existing data</span>
              </motion.div>
            )}
            {question.options?.map((option, idx) => {
              const isChecked = selectedValues.includes(option);
              return (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Label
                    htmlFor={`${question.id}-${idx}`}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isChecked
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      id={`${question.id}-${idx}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        setShowPrefilled(false);
                        if (checked) {
                          onChange([...selectedValues, option]);
                        } else {
                          onChange(selectedValues.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <span className="text-lg">{option}</span>
                  </Label>
                </motion.div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-[60vh] flex flex-col justify-center max-w-2xl mx-auto px-4"
    >
      {/* Question Number */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex items-center gap-2"
      >
        <span className="text-sm font-medium text-primary">
          {questionNumber}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          of {totalQuestions}
        </span>
      </motion.div>

      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl md:text-4xl font-display font-bold text-foreground mb-3"
      >
        {question.question}
        {question.required && <span className="text-destructive ml-1">*</span>}
      </motion.h2>

      {/* Description */}
      {question.description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8 text-lg"
        >
          {question.description}
        </motion.p>
      )}

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-8"
      >
        {renderInput()}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <Button
          onClick={onNext}
          size="lg"
          className="gap-2 text-lg px-8"
          disabled={question.required && !value}
        >
          {isLast ? (
            <>
              <Check className="h-5 w-5" />
              Complete Section
            </>
          ) : (
            <>
              OK
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground hidden md:inline">
          press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter ↵</kbd>
        </span>
      </motion.div>
    </motion.div>
  );
};
