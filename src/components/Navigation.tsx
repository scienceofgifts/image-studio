import React, { useState } from 'react';
import { MainView } from '../types';
import { User } from 'firebase/auth';
import { 
  FolderKanban, 
  LayoutGrid, 
  Image as ImageIcon, 
  Sliders, 
  Wand2, 
  Plus, 
  Settings, 
  Menu, 
  X, 
  Compass, 
  RefreshCw, 
  CloudCheck, 
  LogOut, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useOverlay } from '../utils/overlayManager';

interface NavigationProps {
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  onNewProject: () => void;
  onOpenQuickPrompter: () => void;
  onOpenSettings: () => void;
  currentUser: User | null;
  isSyncing: boolean;
  onSyncData: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  onNewProject,
  onOpenQuickPrompter,
  onOpenSettings,
  currentUser,
  isSyncing,
  onSyncData,
  onSignIn,
  onSignOut
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useOverlay(isMobileMenuOpen, () => setIsMobileMenuOpen(false), 'mobile-nav-menu');
  useOverlay(isUserMenuOpen, () => setIsUserMenuOpen(false), 'user-profile-menu');

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
            onClick={() => handleNavClick('idea-explorer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeView === 'idea-explorer'
                ? 'bg-white text-stone-900 border border-stone-300 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Idea Explorer</span>
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

        {/* Zone 3: Action Controls, Auth & Sync */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Cloud Sync Status Button */}
          <button
            onClick={onSyncData}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isSyncing 
                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
            }`}
            title="Sync with Firebase Cloud Storage"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-stone-500'}`} />
            <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={onOpenQuickPrompter}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-300 transition-colors shadow-2xs"
            title="Quick Settings Prompt Generator"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Prompter</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* User Auth Control */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-stone-300 bg-white hover:bg-stone-100 transition-colors"
                title={currentUser.displayName || currentUser.email || 'User Account'}
              >
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt="User Avatar" 
                    className="w-6 h-6 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-bold">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 p-2 text-xs animate-fade-in space-y-1">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-900 truncate">
                      {currentUser.displayName || 'Authenticated User'}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {currentUser.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSyncData();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
                  >
                    <CloudCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sync Cloud Storage</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenSettings();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-stone-500" />
                    <span>Settings &amp; Backup</span>
                  </button>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300/80 transition-colors shadow-2xs"
              title="Sign in with Google to enable cross-device sync"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.4-.4-2.3z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

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
          
          {currentUser && (
            <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-stone-900 truncate">
                    {currentUser.displayName || 'User'}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="text-xs font-medium text-rose-700 hover:text-rose-900 p-1"
              >
                Sign Out
              </button>
            </div>
          )}

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
              onClick={() => handleNavClick('idea-explorer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                activeView === 'idea-explorer'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Idea Explorer</span>
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
            {!currentUser && (
              <button
                onClick={() => {
                  onSignIn();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-colors"
              >
                <span>Sign In with Google</span>
              </button>
            )}

            <button
              onClick={() => {
                onSyncData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Sync Cloud Storage</span>
            </button>

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
