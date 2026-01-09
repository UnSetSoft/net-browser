import React from 'react';
import { Globe } from 'lucide-react';

export default function BookmarksBar({ bookmarks, onNavigate, onRemove }) {
  if (!bookmarks || bookmarks.length === 0) return null;

  return (
    <div className="bookmarks-bar">
      {bookmarks.map((b) => (
        <div 
          key={b.id} 
          className="bookmark-item" 
          onClick={() => onNavigate(b.url)}
          onContextMenu={(e) => {
             e.preventDefault();
             if(confirm(`Remove bookmark "${b.title}"?`)) {
                 onRemove(b.url);
             }
          }}
          title={b.url}
        >
          {b.favicon ? (
            <img src={b.favicon} alt="" className="bookmark-favicon" onError={(e) => {e.target.style.display='none'}} />
          ) : (
             <Globe size={14} className="bookmark-icon" />
          )}
          <span className="bookmark-title">{b.title}</span>
        </div>
      ))}
    </div>
  );
}
