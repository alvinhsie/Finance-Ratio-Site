import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

function formatWithCommas(raw: string): string {
  if (raw === '' || raw === '-') return raw;
  const parts = raw.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function NumericInput({ value, onChange, placeholder, id, className }: NumericInputProps) {
  const [display, setDisplay] = useState(formatWithCommas(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(formatWithCommas(value));
    }
  }, [value, focused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value;
    const stripped = typed.replace(/,/g, '');
    if (stripped === '' || /^-?\d*\.?\d*$/.test(stripped)) {
      setDisplay(typed);
      onChange(stripped);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplay(value);
  };

  const handleBlur = () => {
    setFocused(false);
    setDisplay(formatWithCommas(value));
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder ?? '0'}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
