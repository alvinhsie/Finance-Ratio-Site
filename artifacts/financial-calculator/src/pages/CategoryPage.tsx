import React from 'react';
import { useParams, Redirect } from 'wouter';
import { CATEGORIES } from '@/lib/ratios';
import { RatioCard } from '@/components/calculator/RatioCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { categoryColors } from '@/lib/categoryColors';

export function CategoryPage() {
  const { t } = useLanguage();
  const params = useParams();
  const categoryId = params.id;
  
  const category = CATEGORIES.find(c => c.id === categoryId);

  if (!category) {
    return <Redirect to={`/category/${CATEGORIES[0].id}`} />;
  }

  const Icon = category.icon;
  const catT = t.categories[category.id as keyof typeof t.categories] ?? { name: category.name, description: category.description };
  const colors = categoryColors[category.id] ?? { bg: "bg-primary/10", text: "text-primary", border: "" };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 lg:mb-12"
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} ${colors.text} mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-3">
          {catT.name}
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {catT.description}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {category.ratios.map((ratio) => (
          <RatioCard key={ratio.id} ratio={ratio} />
        ))}
      </div>
    </div>
  );
}
