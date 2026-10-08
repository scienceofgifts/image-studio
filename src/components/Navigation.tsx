import React from 'react';
import { MainView } from '../types';
import { FolderKanban, LayoutGrid, Image as ImageIcon, Sliders, Wand2, Plus, Settings } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 text-stone-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectView('projects')}
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

        {/* Zone 2: Primary Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onSelectView('projects')}
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
            onClick={() => onSelectView('gallery')}
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
            onClick={() => onSelectView('inspiration')}
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
            onClick={() => onSelectView('profiles')}
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
            <span>New Project</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
            title="Settings & Data Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
