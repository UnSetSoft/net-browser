import React, { useState } from "react";

import { X, Settings, Clock, Download, Globe, PanelLeftClose, Plus, Trash2 } from "lucide-react"; // Cleaned up unused icons

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  closeTab,
  togglePinTab,
  addTab,
  bookmarks,
  onNavigate,
  onRemoveBookmark
}) {
  const pinnedTabs = tabs.filter(t => t.isPinned);
  const regularTabs = tabs.filter(t => !t.isPinned);

  const active = tabs.find(t => t.id === activeTab);
  const [contextMenu, setContextMenu] = useState(null);

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.MinimizeBrowser();
  };
  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.MaximizeBrowser();
  };
  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.CloseBrowser();
  };

  const handleContextMenu = (e, bookmark) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      bookmark
    });
  };

  const handleRemoveBookmark = () => {
    if (contextMenu && onRemoveBookmark) {
      onRemoveBookmark(contextMenu.bookmark.url);
    }
    setContextMenu(null);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const renderTab = (tab) => (
    <div
      key={tab.id}
      className={`vertical-tab ${tab.id === activeTab ? 'active' : ''} ${tab.isPinned ? 'pinned-vertical' : ''}`}
      onClick={() => setActiveTab(tab.id)}
      onContextMenu={(e) => { e.preventDefault(); togglePinTab(tab.id); }}
    >
      <div className="vertical-tab-content">
        {tab.favicon ? (
          <img src={tab.favicon} className="tab-favicon" onError={(e) => e.target.style.display = 'none'} />
        ) : tab.url === 'browser://settings' ? <Settings size={14} className="tab-favicon-placeholder" /> :
          tab.url === 'browser://history' ? <Clock size={14} className="tab-favicon-placeholder" /> :
            tab.url === 'browser://downloads' ? <Download size={14} className="tab-favicon-placeholder" /> :
              <Globe size={14} className="tab-favicon-placeholder" />
        }
        <span className="vertical-tab-title">{tab.title || "New Tab"}</span>
      </div>

      {!tab.isPinned && (
        <button
          className="close-tab-btn"
          onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );

  return (
    <div className="sidebar-container" onClick={closeContextMenu}>
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="pinned-context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: 'auto',
            right: 10,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleRemoveBookmark}>
            <Trash2 size={14} />
            <span>Remove from Sidebar</span>
          </button>
        </div>
      )}

      {/* Window Controls and Toggle */}
      <div className="sidebar-header-row" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 16px', height: '52px', borderBottom: '1px solid var(--border-color)', WebkitAppRegion: 'drag' }}>
        <div className="window-controls" style={{ WebkitAppRegion: 'no-drag', height: '100%', display: 'flex', alignItems: 'center' }}>
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
      </div>

      {/* Pinned Icons Grid (Shortcuts/Bookmarks) */}
      <div className="sidebar-section-title" style={{ padding: '8px 16px 4px' }}>Shortcuts</div>
      <div className="pinned-grid">
        {bookmarks.slice(0, 8).map((b, i) => {
          let faviconUrl = b.favicon;
          if (!faviconUrl && b.url) {
            try {
              const domain = new URL(b.url).hostname;
              faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            } catch (e) {
              faviconUrl = null;
            }
          }
          return (
            <div
              key={i}
              className="pinned-item"
              onClick={() => onNavigate(b.url)}
              onContextMenu={(e) => handleContextMenu(e, b)}
              title={b.title}
            >
              {faviconUrl ? (
                <img src={faviconUrl} className="pinned-favicon" alt="" />
              ) : <div className="pinned-placeholder">{b.title.charAt(0).toUpperCase()}</div>}
            </div>
          );
        })}
      </div >

      <div className="sidebar-divider"></div>

      {/* Vertical Tab List */}
      <div className="vertical-tab-list">
        {pinnedTabs.length > 0 && (
          <>
            <div className="sidebar-section-title">Pinned Tabs</div>
            {pinnedTabs.map(renderTab)}
            <div className="sidebar-divider" style={{ margin: '8px 0' }}></div>
          </>
        )}

        <div className="sidebar-section-title">Open Tabs</div>
        {regularTabs.map(renderTab)}

        {/* Restore New Tab Button */}
        <button className="new-tab-btn-sidebar" onClick={() => addTab(
          'browser://newtab',
          'New Tab'
        )} title="New Tab">
          <Plus size={16} />
          <span>New Tab</span>
        </button>
      </div>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button onClick={() => addTab('browser://settings', 'Settings')} title="Settings">
          <Settings size={18} />
        </button>
        <button onClick={() => addTab('browser://history', 'History')} title="History">
          <Clock size={18} />
        </button>
        <button onClick={() => addTab('browser://downloads', 'Downloads')} title="Downloads">
          <Download size={18} />
        </button>
      </div>
    </div >
  );
}
