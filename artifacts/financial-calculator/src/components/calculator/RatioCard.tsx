import React, { useState } from 'react';
import { RatioDef, RatioResult } from '@/lib/ratios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, RefreshCcw, AlertCircle, CheckCircle2, MinusCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatioCardProps {
  ratio: RatioDef;
}

export function RatioCard({ ratio }: RatioCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RatioResult | null>(null);

  const handleInputChange = (id: string, val: string) => {
    // Only allow numbers and decimals
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setValues(prev => ({ ...prev, [id]: val }));
      // Clear result when input changes to encourage recalculation
      if (result) setResult(null);
    }
  };

  const handleCalculate = () => {
    // Convert string inputs to numbers
    const numValues: Record<string, number> = {};
    for (const input of ratio.inputs) {
      const val = parseFloat(values[input.id] || '0');
      numValues[input.id] = isNaN(val) ? 0 : val;
    }

    const calcResult = ratio.calculate(numValues);
    if (calcResult) {
      setResult(calcResult);
    }
  };

  const handleReset = () => {
    setValues({});
    setResult(null);
  };

  const allInputsFilled = ratio.inputs.every(i => values[i.id] && values[i.id] !== '');

  const getInterpretationColors = (type: string) => {
    switch (type) {
      case 'good': return 'bg-success/10 text-success-foreground border-success/20';
      case 'average': return 'bg-warning/10 text-warning-foreground border-warning/20';
      case 'poor': return 'bg-destructive/10 text-destructive-foreground border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const InterpretationIcon = ({ type, className }: { type: string, className?: string }) => {
    switch (type) {
      case 'good': return <CheckCircle2 className={cn("text-success", className)} />;
      case 'poor': return <AlertCircle className={cn("text-destructive", className)} />;
      case 'average': return <MinusCircle className={cn("text-warning", className)} />;
      default: return <Info className={cn("text-muted-foreground", className)} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/40 bg-muted/20">
        <h3 className="text-xl font-bold text-foreground font-display">{ratio.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{ratio.description}</p>
        
        <div className="mt-4 inline-flex items-center gap-2 bg-background border border-border/50 px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground">
          <Calculator className="w-3.5 h-3.5" />
          <span>{ratio.formulaDisplay}</span>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="space-y-4 mb-6">
          {ratio.inputs.map((input) => (
            <div key={input.id}>
              <label htmlFor={`${ratio.id}-${input.id}`} className="block text-sm font-semibold text-foreground mb-1.5">
                {input.label}
              </label>
              <Input
                id={`${ratio.id}-${input.id}`}
                placeholder={input.placeholder}
                value={values[input.id] || ''}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-3">
          <Button 
            onClick={handleCalculate} 
            disabled={!allInputsFilled}
            className="flex-1"
          >
            Calculate
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={Object.keys(values).length === 0}
            className="px-4"
            title="Reset values"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 overflow-hidden bg-background"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Result</p>
                <div className="text-4xl font-bold font-display text-foreground">
                  {result.formatted}
                </div>
              </div>

              <div className={cn("rounded-xl border p-4 flex gap-3", getInterpretationColors(result.interpretation))}>
                <div className="shrink-0 mt-0.5">
                  <InterpretationIcon type={result.interpretation} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1 capitalize tracking-wide">
                    {result.interpretation}
                  </p>
                  <p className="text-sm leading-relaxed opacity-90">
                    {result.interpretationText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
