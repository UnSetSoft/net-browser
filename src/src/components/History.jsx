import React, { useState, useEffect, useMemo } from "react";
import { HistoryManager } from "../utils/HistoryManager";
import { Clock, Trash2, Globe, Search, X } from "lucide-react";

export default function History({ onNavigate }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHistory(HistoryManager.getHistory());
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your browsing history?")) {
      setHistory(HistoryManager.clearHistory());
    }
  };

  const deleteItem = (e, id) => {
    e.stopPropagation();
    // Use functional update to ensure we are working with latest state if needed, 
    // though getting from Manager is safer source of truth.
    const updatedHistory = HistoryManager.deleteEntry(id);
    setHistory([...updatedHistory]); // Create updated reference to force re-render
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const lower = searchTerm.toLowerCase();
    return history.filter(item =>
      (item.title || "").toLowerCase().includes(lower) ||
      (item.url || "").toLowerCase().includes(lower)
    );
  }, [history, searchTerm]);

  const groupedHistory = useMemo(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filteredHistory.forEach(item => {
      const date = new Date(item.timestamp).toDateString();
      let label = date;
      if (date === today) label = "Today";
      else if (date === yesterday) label = "Yesterday";

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [filteredHistory]);

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="history-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="empty-icon-bg" style={{ width: '48px', height: '48px', marginBottom: 0 }}>
              <Clock size={24} color="var(--accent-color)" />
            </div>
            <h1 className="history-title-large" style={{ margin: 0 }}>History</h1>
          </div>

          <div className="history-actions">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search history"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search">
                  <X size={14} />
                </button>
              )}
            </div>
            <button className="btn-danger" onClick={clearHistory}>
              <Trash2 size={16} style={{ marginRight: '6px' }} />
              Clear Data
            </button>
          </div>
        </div>

        <div className="history-content">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-bg">
                <Clock size={32} />
              </div>
              <p>{searchTerm ? "No search results found" : "No history yet"}</p>
            </div>
          ) : (
            Object.keys(groupedHistory).map(dateLabel => (
              <div key={dateLabel} className="history-group">
                <h3 className="group-title">{dateLabel}</h3>
                <div className="history-list-v2">
                  {groupedHistory[dateLabel].map((item) => (
                    <div key={item.id} className="history-item-v2" onClick={() => onNavigate(item.url)}>
                      <div className="history-time-v2">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="history-favicon-container">
                        {item.favicon ? (
                          <img src={item.favicon} alt="" className="history-favicon" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <Globe size={16} className="history-favicon-placeholder" />
                        )}
                      </div>
                      <div className="history-details">
                        <div className="history-title">{item.title}</div>
                        <div className="history-url">{item.url}</div>
                      </div>
                      <button className="delete-item-btn" onClick={(e) => deleteItem(e, item.id)} title="Remove from history">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
