import React, { useState, useEffect } from "react";
import TabBar from "./components/TabBar";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import BrowserWindow from "./components/BrowserWindow";
import BookmarksBar from "./components/BookmarksBar";
import { BookmarksManager } from "./utils/BookmarksManager";
import { HistoryManager } from "./utils/HistoryManager";

export default function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  // Handle window drag state to disable interactivity
  React.useEffect(() => {
    if (window.electronAPI && window.electronAPI.onWindowDragChange) {
      window.electronAPI.onWindowDragChange((isDragging) => {
        if (isDragging) {
          document.body.classList.add('window-dragging');
        } else {
          document.body.classList.remove('window-dragging');
        }
      });
    }
  }, []);

  useEffect(() => {
  // Initial tab creation
    const id = Math.random().toString(36).substr(2, 9);
    setTabs([{
      id,
      title: "New Tab",
      url: "browser://newtab",
      isPinned: false,
      isLoading: false,
      favicon: null
    }]);
    setActiveTab(id);
    setBookmarks(BookmarksManager.getBookmarks());
  }, []);

  const addTab = (url = "browser://newtab", title = "New Tab", isPinned = false) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newTab = {
      id,
      title: title || "New Tab",
      url: url,
      isPinned,
      isLoading: false,
      favicon: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTab(id);
    return id;
  };

  const togglePinTab = (id) => {
    setTabs(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, isPinned: !t.isPinned } : t
      );
      const pinned = updated.filter(t => t.isPinned);
      const normal = updated.filter(t => !t.isPinned);
      return [...pinned, ...normal];
    });
  };

  const closeTab = (tabIdToClose) => {
    setTabs(prevTabs => {
      const index = prevTabs.findIndex(tab => tab.id === tabIdToClose);
      if (index === -1) return prevTabs;

      const newTabs = prevTabs.filter(tab => tab.id !== tabIdToClose);

      // Handle closing the last tab
      if (newTabs.length === 0) {
        const newId = Math.random().toString(36).substr(2, 9);
        const newTab = { id: newId, title: "New Tab", url: "browser://newtab", isPinned: false };
        setTimeout(() => setActiveTab(newId), 0);
        return [newTab];
      }

      // Handle updating active tab if the closed tab was active
      if (activeTab === tabIdToClose) {
        // Try to select the previous tab, or the next one if it was the first
        const nextIndex = Math.max(0, index - 1);
        const nextId = newTabs[nextIndex]?.id || newTabs[0]?.id;
        setTimeout(() => setActiveTab(nextId), 0);
      }

      return newTabs;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('browser-find'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateTab = (url, title, isLoading, favicon) => {
    setTabs(prev => prev.map(t =>
      t.id === activeTab
        ? { ...t, title: title || t.title, url: url || t.url, isLoading, favicon: favicon || t.favicon }
        : t
    ));
    if (!isLoading && url && title && !url.startsWith('browser://')) {
      try {
        HistoryManager.addEntry(title, url, favicon);
      } catch (e) {
        console.error("Failed to add history entry:", e);
      }
    }
  };

  // Smart navigation: Like standard browsers
  const smartNavigate = (url, title, options = {}) => {
    const { singleton = false } = options;

    const normalize = (u) => {
      if (!u) return '';
      try {
        const uObj = new URL(u);
        return uObj.hostname.replace('www.', '') + uObj.pathname.replace(/\/$/, '');
      } catch (e) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
    };

    if (singleton) {
      const normTarget = normalize(url);
      const existing = tabs.find(t => normalize(t.url) === normTarget);
      if (existing) {
        setActiveTab(existing.id);
        return;
      }
    }

    const current = tabs.find(t => t.id === activeTab);
    if (current && (current.url === 'browser://newtab' || current.url === '')) {
      updateTab(url, title || url, true, null);
    } else {
      addTab(url, title);
    }
  };

  const [theme, setTheme] = useState('light');
  const [showBookmarksBar, setShowBookmarksBar] = useState(localStorage.getItem('showBookmarksBar') !== 'false');
  const [zoomLevel, setZoomLevel] = useState(parseFloat(localStorage.getItem('zoomLevel')) || 1.0);
  const [homepage, setHomepage] = useState(localStorage.getItem('homepage') || 'browser://newtab');
  const [searchEngine, setSearchEngine] = useState(localStorage.getItem('searchEngine') || 'https://www.google.com/search?q=');

  const toggleTheme = () => {

    switch (theme) {
      case 'light':
        setTheme('dark');
        localStorage.setItem('theme', 'dark');
        break;
      case 'dark':
        setTheme('light');
        localStorage.setItem('theme', 'light');
        break;
    }
  };

  const handleSetShowBookmarksBar = (show) => {
    setShowBookmarksBar(show);
    localStorage.setItem('showBookmarksBar', show);
  };

  const handleSetZoomLevel = (level) => {
    setZoomLevel(level);
    localStorage.setItem('zoomLevel', level);
  };

  const handleSetHomepage = (url) => {
    setHomepage(url);
    localStorage.setItem('homepage', url);
  };

  const handleSetSearchEngine = (url) => {
    setSearchEngine(url);
    localStorage.setItem('searchEngine', url);
  };

  const [downloadPath, setDownloadPath] = useState(localStorage.getItem('downloadPath') || '');
  const [adBlockEnabled, setAdBlockEnabled] = useState(localStorage.getItem('adBlockEnabled') === 'true');
  const [dntEnabled, setDntEnabled] = useState(localStorage.getItem('dntEnabled') === 'true');

  useEffect(() => {
    // Sync initial state to main process
    if (downloadPath) window.electronAPI.setDownloadPath(downloadPath);
    window.electronAPI.setAdBlockEnabled(adBlockEnabled);
    window.electronAPI.setDntEnabled(dntEnabled);

    // Downloads listeners
    if (window.electronAPI.onDownloadUpdate) {
      window.electronAPI.onDownloadUpdate((detail) => {
        // Dispatch event for Downloads.jsx to pick up
        window.dispatchEvent(new CustomEvent('downloads-updated', { detail }));
      });
    }

    if (localStorage.getItem('theme') !== undefined) {
      setTheme(localStorage.getItem('theme'));
    }
  }, []);

  const handleSetDownloadPath = (path) => {
    setDownloadPath(path);
    localStorage.setItem('downloadPath', path);
    window.electronAPI.setDownloadPath(path);
  };

  const handleSetAdBlockEnabled = (enabled) => {
    setAdBlockEnabled(enabled);
    localStorage.setItem('adBlockEnabled', enabled);
    window.electronAPI.setAdBlockEnabled(enabled);
  };

  const handleSetDntEnabled = (enabled) => {
    setDntEnabled(enabled);
    localStorage.setItem('dntEnabled', enabled);
    window.electronAPI.setDntEnabled(enabled);
  };

  const active = tabs ? tabs.find((t) => t.id === activeTab) : null;
  const isBookmarked = active ? BookmarksManager.isBookmarked(active.url) : false;

  const handleToggleBookmark = () => {
    if (!active) return;
    if (isBookmarked) {
      setBookmarks(BookmarksManager.removeBookmark(active.url));
    } else {
      setBookmarks(BookmarksManager.addBookmark(active.title, active.url, active.favicon));
    }
  };

  // Layout Config: 'sidebar' (feature enabled) vs 'top' (feature disabled)
  const [layoutMode, setLayoutMode] = useState(localStorage.getItem('layoutMode') || 'sidebar');
  // Sidebar Visibility: Is it currently expanded?
  const [isSidebarOpen, setIsSidebarOpen] = useState(localStorage.getItem('isSidebarOpen') !== 'false');

  const toggleSidebarVisibility = () => {

    switch (isSidebarOpen) {
      case true:
        setIsSidebarOpen(false);
        localStorage.setItem('isSidebarOpen', 'false');
        break;
      case false:
        setIsSidebarOpen(true);
        localStorage.setItem('isSidebarOpen', 'true');
        break;
    }
  };

  return (
    <div className={`app ${layoutMode === 'sidebar' ? 'sidebar-mode' : ''}`} data-theme={theme}>
      {/* Container row if sidebar is enabled and open, otherwise column (or row effectively but sidebar hidden) */}
      <div className="app-container" style={{ flexDirection: (layoutMode === 'sidebar' && isSidebarOpen) ? 'row' : 'column' }}>
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <TopBar
            addTab={(url, title) => smartNavigate(url || (homepage !== 'browser://newtab' ? homepage : 'browser://newtab'), title)}
            tab={active}
            onNavigate={(url) => smartNavigate(url, url)}
            toggleTheme={toggleTheme}
            currentTheme={theme}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
            searchEngine={searchEngine}
            hideIcons={layoutMode === 'sidebar'} // Hide extra icons if Sidebar Feature is Enabled (regardless of visibility, or maybe ONLY if visible? Let's stick to Enabled as requested)
            layoutMode={layoutMode}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebarVisibility} // UI toggle
          />

          {/* Only show horizontal TabBar if NOT in sidebar mode */}
          {layoutMode !== 'sidebar' && showBookmarksBar && (
            <BookmarksBar
              bookmarks={bookmarks}
              onNavigate={(url) => smartNavigate(url, url, { singleton: true })}
              onRemove={(url) => setBookmarks(BookmarksManager.removeBookmark(url))}
            />
          )}

          <BrowserWindow
            tab={active}
            onVisit={updateTab}
            toggleTheme={toggleTheme}
            currentTheme={theme}
            zoomLevel={zoomLevel}
            setZoomLevel={handleSetZoomLevel}
            showBookmarksBar={showBookmarksBar}
            setShowBookmarksBar={handleSetShowBookmarksBar}
            homepage={homepage}
            setHomepage={handleSetHomepage}
            searchEngine={searchEngine}
            setSearchEngine={handleSetSearchEngine}
            downloadPath={downloadPath}
            setDownloadPath={handleSetDownloadPath}
            adBlockEnabled={adBlockEnabled}
            setAdBlockEnabled={handleSetAdBlockEnabled}
            dntEnabled={dntEnabled}
            setDntEnabled={handleSetDntEnabled}
            layoutMode={layoutMode}
            onSmartNavigate={smartNavigate}
          >
            {/* Horizontal Tabs only in top mode */}
            {layoutMode !== 'sidebar' && (
              <TabBar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                closeTab={closeTab}
                togglePinTab={togglePinTab}
              />
            )}
          </BrowserWindow>
        </div>

        {layoutMode === 'sidebar' && isSidebarOpen && (
          <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            closeTab={closeTab}
            togglePinTab={togglePinTab}
            addTab={(url, title) => addTab(url || (homepage !== 'browser://newtab' ? homepage : null), title)}
            bookmarks={bookmarks}
            onNavigate={(url) => smartNavigate(url, url, { singleton: true })}
            onRemoveBookmark={(url) => setBookmarks(BookmarksManager.removeBookmark(url))}
          />
        )}
      </div>
    </div>
  );
}
