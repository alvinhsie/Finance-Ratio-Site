import React, { useState } from 'react';
import { CATEGORIES } from '@/lib/ratios';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Calculator, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <span className="font-bold font-display text-lg tracking-tight">FinRatio</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-foreground"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Sidebar / Mobile Drawer */}
      <AnimatePresence>
        {(mobileMenuOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn(
              "fixed inset-y-0 left-0 z-30 w-72 bg-card border-r border-border flex flex-col",
              "md:sticky md:top-0 md:h-screen",
              !mobileMenuOpen && "hidden md:flex" // Hide on mobile if not open, but always flex on md
            )}
          >
            <div className="p-6 hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="font-bold font-display text-xl tracking-tight">FinRatio</span>
            </div>

            <div className="px-6 pb-2 pt-4 md:pt-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Categories
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = location.includes(`/category/${category.id}`);
                
                return (
                  <Link 
                    key={category.id} 
                    href={`/category/${category.id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span className="flex-1">{category.name}</span>
                    {isActive && (
                      <motion.div layoutId="activeNav">
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6 border-t border-border bg-muted/20">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80')] bg-cover mix-blend-overlay"></div>
                <h4 className="font-display font-semibold mb-1 relative z-10">Pro tip</h4>
                <p className="text-xs text-white/80 relative z-10 leading-relaxed">
                  Ratios are most useful when compared against industry averages or historical data.
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-65px)] md:min-h-screen">
        {children}
      </main>
      
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
