import React, { useState } from 'react';
import { CATEGORIES } from '@/lib/ratios';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Calculator, Menu, X, ChevronRight, Home, BookOpen, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const DRAWER_TRANSITION = {
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.3,
};

const FADE_TRANSITION = { duration: 0.25, ease: 'easeInOut' };

function NavContent({ location, t, language }: { location: string; t: any; language: string }) {
  return (
    <nav className="flex flex-col flex-1 justify-evenly px-4 py-4">
      <Link
        href="/"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
          location === '/'
            ? 'bg-primary/10 text-primary'
            : 'text-foreground hover:bg-muted'
        )}
      >
        <Home className={cn('w-5 h-5 transition-colors', location === '/' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{t.layout.home}</span>
        {location === '/' && <motion.div layoutId="activeNav"><ChevronRight className="w-4 h-4" /></motion.div>}
      </Link>

      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = location.includes(`/category/${category.id}`);
        const catT = t.categories[category.id as keyof typeof t.categories] ?? { name: category.name, description: '' };
        return (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
              isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
            <span className="flex-1">{catT.name}</span>
            {isActive && <motion.div layoutId="activeNav"><ChevronRight className="w-4 h-4" /></motion.div>}
          </Link>
        );
      })}

      <Link
        href="/summary"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
          location === '/summary' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        <LayoutDashboard className={cn('w-5 h-5 transition-colors', location === '/summary' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{language === 'id' ? 'Ringkasan' : 'Summary'}</span>
        {location === '/summary' && <motion.div layoutId="activeNav"><ChevronRight className="w-4 h-4" /></motion.div>}
      </Link>

      <div className="border-t border-border/60" />

      <Link
        href="/glossary"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group',
          location === '/glossary' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        <BookOpen className={cn('w-5 h-5 transition-colors', location === '/glossary' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{language === 'id' ? 'Glosarium' : 'Glossary'}</span>
        {location === '/glossary' && <motion.div layoutId="activeNav"><ChevronRight className="w-4 h-4" /></motion.div>}
      </Link>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">

      {/* ── Mobile Header ── */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold font-display text-lg tracking-tight">FinRatio</span>
            <span className="text-xs font-normal italic text-muted-foreground">by Slitherstocks</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="p-2 -mr-2 text-foreground"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <X className="w-6 h-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <Menu className="w-6 h-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ── Desktop Sidebar (always rendered, no animation needed) ── */}
      <aside className="hidden md:flex sticky top-0 h-screen w-72 bg-card border-r border-border flex-col">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold font-display text-xl tracking-tight">FinRatio</span>
              <span className="text-xs font-normal italic text-muted-foreground">by Slitherstocks</span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
        <NavContent location={location} t={t} language={language} />
      </aside>

      {/* ── Mobile Drawer + Backdrop ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={FADE_TRANSITION}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="drawer"
              className="md:hidden fixed top-[65px] bottom-0 left-0 z-30 w-72 bg-card border-r border-border flex flex-col"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={DRAWER_TRANSITION}
            >
              <NavContent location={location} t={t} language={language} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-65px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
