import React, { useEffect, useRef, useState } from "react";
import NewTab from "./NewTab";
import FindBar from "./FindBar";
import Settings from "./Settings";
import History from "./History";
import Downloads from "./Downloads";
import { AD_BLOCKER_SCRIPT } from "../utils/AdBlockerScript";
import { WifiOff, SearchX, Lock, ShieldBan, TriangleAlert, Compass, Wrench } from "lucide-react";

export default function BrowserWindow({
  tab,
  onVisit,
  toggleTheme,
  currentTheme,
  children,
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
  onToggleLayout,
  onSmartNavigate,
}) {
  const webviewRef = useRef();
  const [error, setError] = useState(null);
  const [showFind, setShowFind] = useState(false);

  // Keep refs to latest props to access inside listeners without re-binding
  const tabRef = useRef(tab);
  const onVisitRef = useRef(onVisit);

  useEffect(() => {
    tabRef.current = tab;
    onVisitRef.current = onVisit;
  }, [tab, onVisit]);

  // Handle zoom separately
  useEffect(() => {
    if (webviewRef.current) {
      try { webviewRef.current.setZoomFactor(zoomLevel); } catch (e) { }
    }
  }, [zoomLevel]);

  // Listen for navigation events from TopBar
  useEffect(() => {
    const handleGoBack = () => {
      if (webviewRef.current && webviewRef.current.canGoBack()) {
        webviewRef.current.goBack();
      }
    };
    const handleGoForward = () => {
      if (webviewRef.current && webviewRef.current.canGoForward()) {
        webviewRef.current.goForward();
      }
    };
    const handleReload = () => {
      if (webviewRef.current) {
        webviewRef.current.reload();
      }
    };
    const handleToggleFind = () => setShowFind(prev => !prev);

    window.addEventListener('browser-go-back', handleGoBack);
    window.addEventListener('browser-go-forward', handleGoForward);
    window.addEventListener('browser-reload', handleReload);
    window.addEventListener('browser-find', handleToggleFind);

    return () => {
      window.removeEventListener('browser-go-back', handleGoBack);
      window.removeEventListener('browser-go-forward', handleGoForward);
      window.removeEventListener('browser-reload', handleReload);
      window.removeEventListener('browser-find', handleToggleFind);
    };
  }, []);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDidStartLoading = () => {
      setError(null);
      // Use ref to get latest URL
      if (tabRef.current && tabRef.current.url) {
        onVisitRef.current(tabRef.current.url, tabRef.current.title, true, tabRef.current.favicon);
      }
    };

    const handleDidStopLoading = () => {
      // Use authoritative URL from webview
      try {
        const currentUrl = webview.getURL();
        if (currentUrl) {
          onVisitRef.current(currentUrl, webview.getTitle(), false, tabRef.current?.favicon);
        }
        webview.setZoomFactor(zoomLevel);
      } catch (e) {
        console.error("Error in did-stop-loading:", e);
      }
    };

    const handlePageFaviconUpdated = (event) => {
      if (tabRef.current) {
        onVisitRef.current(tabRef.current.url, tabRef.current.title, false, event.favicons[0]);
      }
    };

    const handleDidFailLoad = (event) => {
      // Ignore ERR_ABORTED (-3) which usually happens when leading to a new page or user cancelled
      if (event.errorCode === -3) return;

      console.error("Error loading page:", event.errorDescription);
      setError({
        description: event.errorDescription,
        code: event.errorCode,
        url: event.validatedURL,
      });
      if (tabRef.current) {
        onVisitRef.current(event.validatedURL, "Error loading page", false, tabRef.current?.favicon);
      }
    };

    const handleDidNavigate = (event) => {
      if (event.url) {
        onVisitRef.current(event.url, webview.getTitle(), true, tabRef.current?.favicon);
      }
    };

    const handleDidNavigateInPage = (event) => {
      if (event.url) {
        onVisitRef.current(event.url, webview.getTitle(), false, tabRef.current?.favicon);
      }
    };

    const handleDidGetResponseDetails = (event) => {
      if (event.httpResponseCode >= 400 && tabRef.current) {
        const resourceType = event.resourceType ? event.resourceType.toLowerCase() : '';
        const isMainFrame = resourceType.includes('main');
        const isTabUrl = event.newURL === tabRef.current.url || event.originalURL === tabRef.current.url;

        if (isMainFrame || isTabUrl) {
          setError({
            code: event.httpResponseCode,
            description: event.statusText || "HTTP Error",
            url: event.newURL || tabRef.current.url
          });
        }
      }
    };

    const handleDomReady = () => {
      const scrollbarCSS = `
            ::-webkit-scrollbar { width: 10px; height: 10px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 5px; border: 2px solid transparent; background-clip: content-box; }
            ::-webkit-scrollbar-thumb:hover { background: #a8a8a8; border: 2px solid transparent; background-clip: content-box; }
            ::-webkit-scrollbar-corner { background: transparent; }
        `;
      webview.insertCSS(scrollbarCSS);
      try { webview.setZoomFactor(zoomLevel); } catch (e) { }

      if (adBlockEnabled) {
        webview.executeJavaScript(AD_BLOCKER_SCRIPT)
          .catch(err => console.error("AdBlock injection failed (likely navigation):", err));
      }
    };

    webview.addEventListener("did-start-loading", handleDidStartLoading);
    webview.addEventListener("did-stop-loading", handleDidStopLoading);
    webview.addEventListener("page-favicon-updated", handlePageFaviconUpdated);
    webview.addEventListener("did-fail-load", handleDidFailLoad);
    webview.addEventListener("did-get-response-details", handleDidGetResponseDetails);
    webview.addEventListener("did-navigate", handleDidNavigate);
    webview.addEventListener("did-navigate-in-page", handleDidNavigateInPage);
    webview.addEventListener("dom-ready", handleDomReady);

    const handleContextMenu = () => {
      window.electronAPI.openContextMenu(webview.getWebContentsId());
    };
    webview.addEventListener("context-menu", handleContextMenu);

    return () => {
      webview.removeEventListener("did-start-loading", handleDidStartLoading);
      webview.removeEventListener("did-stop-loading", handleDidStopLoading);
      webview.removeEventListener("page-favicon-updated", handlePageFaviconUpdated);
      webview.removeEventListener("did-fail-load", handleDidFailLoad);
      webview.removeEventListener("did-get-response-details", handleDidGetResponseDetails);
      webview.removeEventListener("did-navigate", handleDidNavigate);
      webview.removeEventListener("did-navigate-in-page", handleDidNavigateInPage);
      webview.removeEventListener("dom-ready", handleDomReady);
      webview.removeEventListener("context-menu", handleContextMenu);
    };
  }, []); // Empty dependency array = listeners bind ONCE on mount (for this webview instance)

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !tab) return;

    const updateTitle = () => {
      const title = webview.getTitle();
      if (title) onVisit(tab.url, title, false, tab.favicon);
    };

    const intervalId = setInterval(() => {
      const title = webview.getTitle();
      if (tab.title !== title) {
        onVisit(tab.url, title, false, tab.favicon);
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      webview.removeEventListener("did-finish-load", updateTitle);
      webview.removeEventListener("page-title-updated", updateTitle);
    };
  }, [tab]);

  // Handle internal page titles
  useEffect(() => {
    if (!tab) return;
    if (tab.url === 'browser://settings' && tab.title !== 'Settings') {
      onVisit(tab.url, 'Settings', false, null);
    } else if (tab.url === 'browser://history' && tab.title !== 'History') {
      onVisit(tab.url, 'History', false, null);
    } else if (tab.url === 'browser://downloads' && tab.title !== 'Downloads') {
      onVisit(tab.url, 'Downloads', false, null);
    }
  }, [tab]);

  return (
    <>
      {tab && children}
      <div className="webViewContainer flex-1" style={{ position: 'relative' }}>
        {showFind && <FindBar webviewRef={webviewRef} onClose={() => setShowFind(false)} />}
        {tab && tab.url && (
          tab.url.startsWith('browser://') ? (
            tab.url === 'browser://newtab' ? (
              <NewTab
                onNavigate={(url) => onSmartNavigate ? onSmartNavigate(url, url) : onVisit(url, url, true, null)}
                searchEngine={searchEngine}
              />
            ) : tab.url === 'browser://settings' ? (
              <Settings
                toggleTheme={toggleTheme}
                currentTheme={currentTheme}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                showBookmarksBar={showBookmarksBar}
                setShowBookmarksBar={setShowBookmarksBar}
                homepage={homepage}
                setHomepage={setHomepage}
                searchEngine={searchEngine}
                setSearchEngine={setSearchEngine}
                downloadPath={downloadPath}
                setDownloadPath={setDownloadPath}
                adBlockEnabled={adBlockEnabled}
                setAdBlockEnabled={setAdBlockEnabled}
                dntEnabled={dntEnabled}
                setDntEnabled={setDntEnabled}
                layoutMode={layoutMode}
                onToggleLayout={onToggleLayout}
              />
            ) : tab.url === 'browser://history' ? (
              <History onNavigate={(url) => onVisit(url, url, true, null)} />
            ) : tab.url === 'browser://downloads' ? (
              <Downloads />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: currentTheme === 'light' ? '#000' : '#fff' }}>
                <h1>Page Not Found</h1>
                <p>The internal page <code>{tab.url}</code> does not exist.</p>
              </div>
            )
          ) : (
          <>
            {error && (
                  <div className="error-overlay" role="alert">
                    <div className="error-content" data-code={error.code}>
                      <div className="error-icon">
                        {getErrorDetails(error.code, error.description).icon}
                      </div>
                      <h2>{getErrorDetails(error.code, error.description).title}</h2>
                      <p>{getErrorDetails(error.code, error.description).message}</p>
                      <p>URL: {error.url}</p>

                      <div className="error-tech-details">
                        Error Code: {error.code} ({error.description})
                      </div>

                      <button
                        onClick={() => {
                          if (webviewRef.current) {
                            setError(null);
                            webviewRef.current.reload();
                          }
                        }}
                      >
                        Retry
                      </button>
                    </div>
              </div>
            )}
            <webview
              ref={webviewRef}
              src={tab.url}
                  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
                  allowpopups="true"
              className="webview"
              style={{
                display: error ? "none" : "flex",
              }}
            ></webview>
          </>
            )
        )}
      </div>
    </>
  );
}
