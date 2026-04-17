import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

function applyCommas(raw: string): string {
  if (raw === '' || raw === '-') return raw;
  const [integer, decimal] = raw.split('.');
  const withCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${withCommas}.${decimal}` : withCommas;
}

function stripLeadingZeros(s: string): string {
  // Keep: "", "-", "0", "0.", "-0", "-0.", "0.5", "-0.5"
  // Strip: "0287" → "287", "-0287" → "-287"
  return s.replace(/^(-?)0+([1-9])/, '$1$2');
}

export function NumericInput({ value, onChange, placeholder, id, className }: NumericInputProps) {
  const [display, setDisplay] = useState(() => applyCommas(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplay(applyCommas(value));
    }
  }, [value]);

  useEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all on focus so typing immediately replaces the current value
    e.target.select();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const typed = el.value;
    const cursorPos = el.selectionStart ?? typed.length;

    // If no period exists yet, check whether any comma is a decimal separator.
    // A comma is a decimal separator when it is NOT followed by exactly 3 digits
    // then a comma or end-of-string (which is the thousand-separator pattern).
    let normalized = typed;
    if (!normalized.includes('.')) {
      normalized = normalized.replace(/,(?!\d{3}(?:,|$))/, '.');
    }

    let stripped = normalized.replace(/,/g, '');
    if (stripped !== '' && !/^-?\d*\.?\d*$/.test(stripped)) return;

    // Remove invalid leading zeros (e.g. "0287" → "287")
    stripped = stripLeadingZeros(stripped);

    const formatted = applyCommas(stripped);

    const rawBeforeCursor = typed.slice(0, cursorPos).replace(/,/g, '').length;
    let newCursor = formatted.length;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (seen === rawBeforeCursor) { newCursor = i; break; }
      if (formatted[i] !== ',') seen++;
    }

    cursorRef.current = newCursor;
    setDisplay(formatted);
    onChange(stripped);
  };

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder ?? '0'}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}
