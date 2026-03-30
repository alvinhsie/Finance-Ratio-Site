import React from 'react';
import { useParams, Redirect } from 'wouter';
import { CATEGORIES } from '@/lib/ratios';
import { RatioCard } from '@/components/calculator/RatioCard';
import { motion } from 'framer-motion';

export function CategoryPage() {
  const params = useParams();
  const categoryId = params.id;
  
  const category = CATEGORIES.find(c => c.id === categoryId);

  if (!category) {
    return <Redirect to={`/category/${CATEGORIES[0].id}`} />;
  }

  const Icon = category.icon;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 lg:mb-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight mb-3">
          {category.name} Calculators
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
          {category.description}
        </p>
      </motion.div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {category.ratios.map((ratio, index) => (
          <RatioCard key={ratio.id} ratio={ratio} />
        ))}
      </div>
    </div>
  );
}
