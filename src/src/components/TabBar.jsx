import { X, Settings, Clock, Globe, File } from "lucide-react";

export default function TabBar({ tabs, activeTab, setActiveTab, closeTab, togglePinTab }) {
  const pinnedTabs = tabs.filter(t => t.isPinned);
  const regularTabs = tabs.filter(t => !t.isPinned);

  return (
    <div className="no-drag tab-bar">
      {pinnedTabs.length > 0 && (
        <div className="pinned-tabs-container">
          {pinnedTabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab pinned ${tab.id === activeTab ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => togglePinTab(tab.id)}
              title={tab.title}
            >
              {tab.favicon ? (
                <img src={tab.favicon} alt="" className="tab-favicon" onError={(e) => { e.target.style.display = 'none' }} />
              ) : tab.url === 'browser://settings' ? <Settings size={14} className="tab-icon" /> :
                tab.url === 'browser://history' ? <Clock size={14} className="tab-icon" /> :
                  <Globe size={14} className="tab-icon" />
              }
            </div>
          ))}
        </div>
      )}

      <div className="regular-tabs-container">
        {regularTabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            onContextMenu={(e) => { e.preventDefault(); togglePinTab(tab.id); }}
          >
            {tab.favicon ? (
              <img src={tab.favicon} alt="" className="tab-favicon" onError={(e) => { e.target.style.display = 'none' }} />
            ) : tab.url && tab.url.startsWith('browser://') ? (
              tab.url === 'browser://settings' ? <Settings size={14} className="tab-icon" /> :
                tab.url === 'browser://history' ? <Clock size={14} className="tab-icon" /> :
                  <File size={14} className="tab-icon" />
            ) : (
              <Globe size={14} className="tab-icon" />
            )}
            <span className="tab-title">{tab.title}</span>
            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label="Close Tab"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
