import React, { useState } from 'react';
import { Search, Youtube, Twitter, Github, Globe } from 'lucide-react';

export default function NewTab({ onNavigate, searchEngine }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    let url = query.trim();
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = `https://${url}`;
      } else {
        // Use the selected search engine, fallback to Google if undefined
        const engineBase = searchEngine || "https://www.google.com/search?q=";
        url = `${engineBase}${encodeURIComponent(url)}`;
      }
    }
    onNavigate(url);
  };

  const shortcuts = [
    { name: 'Google', url: 'https://google.com', icon: <Search size={24} /> },
    { name: 'YouTube', url: 'https://youtube.com', icon: <Youtube size={24} /> },
    { name: 'Twitter', url: 'https://twitter.com', icon: <Twitter size={24} /> },
    { name: 'GitHub', url: 'https://github.com', icon: <Github size={24} /> }
  ];

  return (
    <div className="new-tab-page">
      <div className="new-tab-content">
        <h1 className="logo">NetBrowser</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web or enter URL..."
            className="search-input"
            autoFocus
          />
        </form>

        <div className="shortcuts-grid">
          {shortcuts.map((site) => (
            <button
              key={site.name}
              className="shortcut-card"
              onClick={() => onNavigate(site.url)}
            >
              <span className="shortcut-icon">{site.icon}</span>
              <span className="shortcut-name">{site.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
