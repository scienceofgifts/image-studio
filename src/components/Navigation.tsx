import React, { useState } from 'react';
import { MainView } from '../types';
import { FolderKanban, LayoutGrid, Image as ImageIcon, Sliders, Wand2, Plus, Settings, Menu, X } from 'lucide-react';
import { useOverlay } from '../utils/overlayManager';

interface NavigationProps {
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  onNewProject: () => void;
  onOpenQuickPrompter: () => void;
  onOpenSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  onNewProject,
  onOpenQuickPrompter,
  onOpenSettings
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useOverlay(isMobileMenuOpen, () => setIsMobileMenuOpen(false), 'mobile-nav-menu');

  const handleNavClick = (view: MainView) => {
    onSelectView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('projects')}
            className="flex items-center gap-2 font-serif text-lg tracking-tight text-stone-900 font-semibold hover:opacity-80 transition-opacity"
          >
            <span className="bg-amber-100 text-amber-800 p-1.5 rounded-lg border border-amber-200/80 flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span className="hidden sm:inline">Image Studio</span>
            <span className="sm:hidden">Studio</span>
          </button>
          <span className="text-stone-300 font-light hidden md:inline">|</span>
          <span className="text-xs text-stone-500 font-sans hidden md:inline">Science of Gifts</span>
        </div>

        {/* Zone 2: Primary Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => handleNavClick('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeView === 'projects' || activeView === 'project-detail'
                ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-stone-500" />
            <span>Projects</span>
          </button>

          <button
            onClick={() => handleNavClick('gallery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeView === 'gallery'
                ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-stone-500" />
            <span>Gallery</span>
          </button>

          <button
            onClick={() => handleNavClick('inspiration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeView === 'inspiration'
                ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
            <span>Inspiration</span>
          </button>

          <button
            onClick={() => handleNavClick('profiles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeView === 'profiles'
                ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>Visual Profiles</span>
          </button>
        </nav>

        {/* Zone 3: Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickPrompter}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-300 transition-colors shadow-2xs"
            title="Quick Settings Prompt Generator"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Prompter</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="hidden md:flex p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
            title="Settings & Data Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 shadow-lg">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('projects')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                activeView === 'projects' || activeView === 'project-detail'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                activeView === 'gallery'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Gallery</span>
            </button>

            <button
              onClick={() => handleNavClick('inspiration')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                activeView === 'inspiration'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Inspiration</span>
            </button>

            <button
              onClick={() => handleNavClick('profiles')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                activeView === 'profiles'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Visual Profiles</span>
            </button>
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenQuickPrompter();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors"
            >
              <Wand2 className="w-4 h-4 text-amber-600" />
              <span>Quick Prompter</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors"
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span>Settings &amp; Backup</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
