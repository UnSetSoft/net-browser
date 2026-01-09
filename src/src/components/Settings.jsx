import React, { useState, useEffect } from "react";
import { Moon, Sun, Search, Trash2, Info, LayoutTemplate, Shield, Globe, ChevronRight, Monitor, Key } from "lucide-react";
import { HistoryManager } from "../utils/HistoryManager";

export default function Settings({
  toggleTheme,
  currentTheme,
  zoomLevel,
  setZoomLevel,
  showBookmarksBar,
  setShowBookmarksBar,
  homepage,
  setHomepage,
  searchEngine,
  setSearchEngine,
  downloadPath,
  setDownloadPath,
  adBlockEnabled,
  setAdBlockEnabled,
  dntEnabled,
  setDntEnabled,
  layoutMode,
  onToggleLayout
}) {
  const [activeSection, setActiveSection] = useState('appearance'); // Start with something visual
  const [appInfo, setAppInfo] = useState({ version: '', author: '', appName: 'NetBrowser', chromiumVersion: '' });

  useEffect(() => {
    const fetchInfo = async () => {
      if (window.electronAPI && window.electronAPI.getAppInfo) {
        try {
          const info = await window.electronAPI.getAppInfo();
          setAppInfo(info);
        } catch (err) {
          console.error("Failed to fetch app info:", err);
        }
      }
    };
    fetchInfo();
  }, []);

  const [tempHomepage, setTempHomepage] = useState(homepage);

  const handleHomepageSave = () => {
    setHomepage(tempHomepage);
  };

  const handleSelectDownloadFolder = async () => {
    const path = await window.electronAPI.selectDownloadFolder();
    if (path) setDownloadPath(path);
  };

  const clearData = async (key) => {
    if (confirm(`Are you sure you want to clear ${key}?`)) {
      if (key === 'history') HistoryManager.clearHistory();
      else if (key === 'bookmarks') localStorage.removeItem('bookmarks');
      else if (key === 'cache') await window.electronAPI.clearCache();
      else if (key === 'cookies') await window.electronAPI.clearCookies();

      if (key === 'bookmarks' || key === 'history') window.location.reload();
      else alert(`${key} cleared.`);
    }
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: <Monitor size={18} /> },
    { id: 'general', label: 'General', icon: <LayoutTemplate size={18} /> },
    { id: 'search', label: 'Search', icon: <Search size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
    { id: 'downloads', label: 'Downloads', icon: <Globe size={18} /> },
    { id: 'about', label: 'About', icon: <Info size={18} /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="settings-panel">
            <h2 className="panel-title">General</h2>
            <div className="control-group">
              <label className="control-label">Homepage</label>
              <div className="control-row">
                <input
                  className="input-field"
                  type="text"
                  value={tempHomepage}
                  onChange={(e) => setTempHomepage(e.target.value)}
                  placeholder="https://..."
                />
                <button className="btn-primary" onClick={handleHomepageSave}>Save</button>
              </div>
              <p className="control-help">The page that opens when you start the browser.</p>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="settings-panel">
            <h2 className="panel-title">Appearance</h2>

            <div className="control-group">
              <div className="control-row-spread">
                <div>
                  <label className="control-label">Dark Mode</label>
                  <p className="control-help">Switch between light and dark themes.</p>
                </div>
                <div className="toggle-wrapper" onClick={toggleTheme}>
                  <div className={`toggle-pill ${currentTheme === 'dark' ? 'active' : ''}`}>
                    <div className="toggle-circle"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="control-group">
              <div className="control-row-spread">
                <div>
                  <label className="control-label">Bookmarks Bar</label>
                  <p className="control-help">Display your favorite sites below the address bar.</p>
                </div>
                <div className="toggle-wrapper" onClick={() => setShowBookmarksBar(!showBookmarksBar)}>
                  <div className={`toggle-pill ${showBookmarksBar ? 'active' : ''}`}>
                    <div className="toggle-circle"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="control-group">
              <div className="control-row-spread">
                <div>
                  <label className="control-label">Layout Mode</label>
                  <p className="control-help">Switch between Top Bar and Sidebar navigation.</p>
                </div>
                <div className="toggle-wrapper" onClick={onToggleLayout}>
                  <div className={`text-toggle-pill ${layoutMode}`}>
                    {layoutMode === 'sidebar' ? 'Sidebar' : 'Top Bar'}
                  </div>
                </div>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">Page Zoom</label>
              <select
                className="select-field"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              >
                <option value="0.8">80%</option>
                <option value="0.9">90%</option>
                <option value="1.0">100% (Default)</option>
                <option value="1.1">110%</option>
                <option value="1.25">125%</option>
                <option value="1.5">150%</option>
              </select>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="settings-panel">
            <h2 className="panel-title">Search Engine</h2>
            <div className="control-group">
              <label className="control-label">Default Search Engine</label>
              <select
                className="select-field"
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value)}
              >
                <option value="https://www.google.com/search?q=">Google</option>
                <option value="https://www.bing.com/search?q=">Bing</option>
                <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
              </select>
              <p className="control-help">This engine will be used when you type in the address bar.</p>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="settings-panel">
            <h2 className="panel-title">Privacy & Security</h2>

            <div className="control-group">
              <div className="control-row-spread">
                <div>
                  <label className="control-label">Ad Blocker</label>
                  <p className="control-help">Block intrusive ads and tracking scripts.</p>
                </div>
                <div className="toggle-wrapper" onClick={() => setAdBlockEnabled(!adBlockEnabled)}>
                  <div className={`toggle-pill ${adBlockEnabled ? 'active' : ''}`}>
                    <div className="toggle-circle"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="control-group">
              <div className="control-row-spread">
                <div>
                  <label className="control-label">Do Not Track</label>
                  <p className="control-help">Send a 'Do Not Track' request with your browsing traffic.</p>
                </div>
                <div className="toggle-wrapper" onClick={() => setDntEnabled(!dntEnabled)}>
                  <div className={`toggle-pill ${dntEnabled ? 'active' : ''}`}>
                    <div className="toggle-circle"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <h3 className="subsection-header">Clear Browsing Data</h3>
            <div className="action-list">
              <button className="action-item" onClick={() => clearData('history')}>
                <Trash2 size={16} /> Clear History
              </button>
              <button className="action-item" onClick={() => clearData('cookies')}>
                <Key size={16} /> Clear Cookies
              </button>
              <button className="action-item" onClick={() => clearData('cache')}>
                <Monitor size={16} /> Clear Cache
              </button>
            </div>
          </div>
        );
      case 'downloads':
        return (
          <div className="settings-panel">
            <h2 className="panel-title">Downloads</h2>
            <div className="control-group">
              <label className="control-label">Download Location</label>
              <div className="control-row">
                <input className="input-field" type="text" value={downloadPath || 'Default'} readOnly />
                <button className="btn-secondary" onClick={handleSelectDownloadFolder}>Change</button>
              </div>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="settings-panel">
            <div className="about-section">
              <div className="about-icon">NB</div>
              <h2>{appInfo.appName || 'NetBrowser'}</h2>
              <p className="version-tag">Version {appInfo.version}</p>
              <p className="about-desc">
                Built for speed, privacy, and simplicity. <br />
                Powered by Electron and React. <br />
                Chromium: {appInfo.chromiumVersion}
              </p>
              <div className="about-credits">
                &copy; {new Date().getFullYear()} {appInfo.author}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-layout-v2">
      <div className="settings-sidebar-v2">
        <div className="sidebar-header">Settings</div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-btn-icon">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="settings-content-v2">
        {renderContent()}
      </div>
    </div>
  );
}
