import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

export default function FindBar({ webviewRef, onClose }) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState({ activeMatchOrdinal: 0, matches: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();

    const handleFoundInPage = (event) => {
      // Event structure: { result: { activeMatchOrdinal, matches, requestId, ... } }
      if (event.result) {
        setMatches({
          activeMatchOrdinal: event.result.activeMatchOrdinal,
          matches: event.result.matches
        });
      }
    };

    const webview = webviewRef.current;
    if (webview) {
      webview.addEventListener('found-in-page', handleFoundInPage);
    }

    return () => {
      if (webview) {
        webview.stopFindInPage('clearSelection');
        webview.removeEventListener('found-in-page', handleFoundInPage);
      }
    };
  }, [webviewRef]);

  const handleSearch = (text) => {
    setQuery(text);
    if (!text) {
      webviewRef.current.stopFindInPage('clearSelection');
      setMatches({ activeMatchOrdinal: 0, matches: 0 });
      return;
    }
    webviewRef.current.findInPage(text);
  };

  const findNext = () => webviewRef.current.findInPage(query, { findNext: true, forward: true });
  const findPrev = () => webviewRef.current.findInPage(query, { findNext: true, forward: false });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) findPrev();
      else findNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="find-bar">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in page..."
      />
      <span className="match-count">
        {matches.matches > 0 ? `${matches.activeMatchOrdinal}/${matches.matches}` : '0/0'}
      </span>
      <div className="find-controls">
        <button className="icon" onClick={findPrev} title="Previous"><ArrowUp size={16} /></button>
        <button className="icon" onClick={findNext} title="Next"><ArrowDown size={16} /></button>
        <button className="icon close" onClick={onClose} title="Close"><X size={16} /></button>
      </div>
    </div>
  );
}
