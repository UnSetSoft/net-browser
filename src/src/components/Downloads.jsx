import React, { useState, useEffect } from "react";
import { DownloadsManager } from "../utils/DownloadsManager";
import { Download, Folder, X, File, RotateCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    setDownloads(DownloadsManager.getDownloads());

    // Listen for real-time updates from App.jsx/IPC
    const handleUpdate = (e) => {
      setDownloads(e.detail);
    };
    window.addEventListener('downloads-updated', handleUpdate);
    return () => window.removeEventListener('downloads-updated', handleUpdate);
  }, []);

  const clearDownloads = () => {
    if (confirm("Clear download history? Files will not be deleted.")) {
      setDownloads(DownloadsManager.clearDownloads());
    }
  };

  const openFile = (path) => {
    if (window.electronAPI && window.electronAPI.openPath) {
        window.electronAPI.openPath(path);
    }
  };

  const showInFolder = (path) => {
    if (window.electronAPI && window.electronAPI.showInFolder) {
        window.electronAPI.showInFolder(path);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="history-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div className="empty-icon-bg" style={{ width: '48px', height: '48px', marginBottom: 0 }}>
                <Download size={24} color="var(--accent-color)" />
             </div>
             <h1 className="history-title-large" style={{ margin: 0 }}>Downloads</h1>
           </div>
           
           <button className="btn-danger" onClick={clearDownloads}>
              <Trash2 size={16} />
              Clear List
           </button>
        </div>

        <div className="history-list-v2">
          {downloads.length === 0 ? (
            <div className="empty-state">
                <div className="empty-icon-bg">
                  <Download size={32} />
                </div>
                <p>No downloads yet</p>
            </div>
          ) : (
            downloads.map((item) => (
              <div key={item.id} className="history-item-v2" style={{ cursor: 'default' }}>
                <div className="history-favicon-container">
                   <File size={16} color="var(--text-primary)" />
                </div>
                
                <div className="history-details">
                   <div className="history-title">{item.filename}</div>
                   <div className="history-url" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {item.state === 'progressing' && (
                          <>
                            <span style={{ color: 'var(--accent-color)' }}>Downloading...</span>
                            <span>{formatBytes(item.receivedBytes)} / {item.totalBytes ? formatBytes(item.totalBytes) : 'Unknown'}</span>
                          </>
                      )}
                      {item.state === 'completed' && (
                          <>
                            <CheckCircle size={12} color="var(--success-color)" />
                            <span>{formatBytes(item.totalBytes)}</span>
                            <span style={{ margin: '0 4px' }}>•</span>
                            <span 
                                className="link-action" 
                                onClick={() => showInFolder(item.path)}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Show in Folder
                            </span>
                          </>
                      )}
                      {(item.state === 'cancelled' || item.state === 'interrupted') && (
                          <>
                             <AlertTriangle size={12} color="var(--error-text)" />
                             <span style={{ color: 'var(--text-secondary)' }}>
                                {item.state === 'cancelled' ? 'Cancelled' : 'Interrupted'}
                             </span>
                          </>
                      )}
                   </div>
                   
                   {/* Progress Bar */}
                   {item.state === 'progressing' && item.totalBytes > 0 && (
                       <div style={{ 
                           height: '4px', 
                           background: 'var(--bg-secondary)', 
                           borderRadius: '2px', 
                           marginTop: '8px',
                           overflow: 'hidden',
                           maxWidth: '300px'
                       }}>
                           <div style={{
                               height: '100%',
                               width: `${(item.receivedBytes / item.totalBytes) * 100}%`,
                               background: 'var(--accent-color)',
                               transition: 'width 0.2s'
                           }}></div>
                       </div>
                   )}
                </div>

                <div className="history-actions" style={{ marginLeft: 'auto' }}>
                    {item.state === 'completed' && (
                        <button className="icon-btn" onClick={() => openFile(item.path)} title="Open File">
                            <Folder size={18} />
                        </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for Trash icon since it was missing in imports
function Trash2({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    )
}
