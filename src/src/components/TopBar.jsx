import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RotateCw, Moon, Sun, Plus, Star, Settings, Clock, Download, PanelLeftOpen, PanelLeftClose } from "lucide-react";

export default function TopBar(props) {
  const { addTab, tab, onNavigate, toggleTheme, currentTheme, isBookmarked, onToggleBookmark, searchEngine, hideIcons, layoutMode, isSidebarOpen, onToggleSidebar } = props;
  const [url, setUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only update URL from tab if user is NOT focused on the input
    if (!isFocused && tab?.url) {
      setUrl(tab.url.replace(/^https?:\/\//, ""));
    } else if (!tab || !tab.url) {
      setUrl("");
    }
  }, [tab?.url, isFocused]); // Depend on tab.url specifically

  // When switching tabs, we force update even if focused (optional, but good for UX)
  useEffect(() => {
    if (tab?.url) {
      setUrl(tab.url.replace(/^https?:\/\//, ""));
    } else {
      setUrl("");
    }
  }, [tab?.id]); 

  const validateUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // Remove focus to trigger the effect update if needed
      try {
        let finalUrl = (url || "").trim();
        if (!finalUrl) return;

        const isDomainLike = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(finalUrl) ||
          /^localhost(:\d+)?(\/.*)?$/.test(finalUrl) ||
          /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/.*)?$/.test(finalUrl);

        if (validateUrl(finalUrl)) {
          // already valid
        } else if (isDomainLike) {
          finalUrl = "http://" + finalUrl;
          if (!finalUrl.includes('localhost') && !/^\d+\./.test(url)) {
            finalUrl = "https://" + finalUrl.replace(/^http:\/\//, '');
          }
        } else {
          const engineBase = searchEngine || "https://www.google.com/search?q=";
          finalUrl = engineBase + encodeURIComponent(finalUrl);
        }

        if (!tab) {
          addTab(finalUrl, finalUrl);
        } else {
          onNavigate(finalUrl);
        }
      } catch (error) {
        console.error("Error managing URL input:", error);
      }
    }
  };

  return (
    <div className="browser-top-bar">


      {/* Navigation Controls */}
      <div className="nav-controls">

        {/* Toggle Sidebar Button - Only visible if Sidebar Feature is Enabled (layoutMode === 'sidebar') */}
        {layoutMode === 'sidebar' && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="icon"
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Show Sidebar"}
            title={isSidebarOpen ? "Collapse Sidebar" : "Show Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose size={20} strokeWidth={1.5} /> : <PanelLeftOpen size={20} strokeWidth={1.5} />}
          </button>
        )}


        {!hideIcons && (
          <>
            <button
              onClick={() => addTab('browser://settings', 'Settings')}
              className="icon"
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => addTab('browser://history', 'History')}
              className="icon"
              aria-label="History"
              title="History"
            >
              <Clock size={18} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => addTab('browser://downloads', 'Downloads')}
              className="icon"
              aria-label="Downloads"
              title="Downloads"
            >
              <Download size={18} strokeWidth={1.5} />
            </button>
            <div className="divider-vertical" style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }}></div>
          </>
        )}

        <button
          className="icon"
          onClick={() => window.dispatchEvent(new CustomEvent('browser-go-back'))}
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <button
          className="icon"
          onClick={() => window.dispatchEvent(new CustomEvent('browser-go-forward'))}
          aria-label="Forward"
        >
          <ArrowRight size={20} strokeWidth={1.5} />
        </button>
        <button
          className="icon"
          onClick={() => window.dispatchEvent(new CustomEvent('browser-reload'))}
          aria-label="Reload"
        >
          <RotateCw size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Address bar */}
      <div className="address-bar-container">
        <input
          className="address-bar"
          value={url}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter address"
          style={{
            borderColor: "var(--border-color)"
          }}
        />
        {tab?.isLoading && <div className="loading-bar-overlay"></div>}
        {tab?.isLoading && <span className="loading-spinner"></span>}
        <button
          className="bookmark-btn"
          onClick={onToggleBookmark}
          title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
        >
          <Star size={16} fill={isBookmarked ? "currentColor" : "none"} color={isBookmarked ? "#FFD700" : "gray"} />
        </button>
      </div>

      {/* Window controls */}
      <div className="actions">

        {/* add tab */}
        {!layoutMode !== "sidebar" &&
          <button
            onClick={() => addTab('browser://newtab', 'New Tab')}
            className="icon"
            aria-label="New Tab"
            title="New Tab"
          >

            <Plus size={18} strokeWidth={1.5} />
          </button>
        }

        <button
          onClick={toggleTheme}
          className="icon"
          aria-label="Toggle Theme"
          title={currentTheme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {currentTheme === 'light' ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </button>
      </div>



      {/* Window controls - Hide if in Sidebar mode AND Sidebar is open (since sidebar has them) */}
      {
        (layoutMode !== 'sidebar' || !isSidebarOpen) && (
          <div className="window-controls">
            <span
              onClick={window.electronAPI.MinimizeBrowser}
              className="btn minimize"
              aria-label="Minimize"
              role="button"
            ></span>
            <span
              onClick={window.electronAPI.MaximizeBrowser}
              className="btn maximize"
              aria-label="Maximize"
              role="button"
            ></span>
            <span
              onClick={window.electronAPI.CloseBrowser}
              className="btn close"
              aria-label="Close"
              role="button"
            ></span>
          </div>
        )
      }
    </div>
  );
}
