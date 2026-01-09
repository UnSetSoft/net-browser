export const AD_BLOCKER_SCRIPT = `
// YouTube Ad Skipper & Twitch Ad Muter
(function() {
  console.log("NetBrowser AdBlocker Active");

  const skipYouTubeAds = () => {
    // Click "Skip Ads" button
    const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
    if (skipBtn) {
      console.log("Skipping YouTube Ad...");
      skipBtn.click();
    }

    // Fast forward video ads if skipping is not available but it's an ad
    const adOverlay = document.querySelector('.ytp-ad-module, .ytp-ad-player-overlay');
    const video = document.querySelector('video');
    if (adOverlay && video && document.querySelector('.ad-showing')) {
        // Speed up to 16x to end it quickly
        video.playbackRate = 16;
        video.muted = true;
    }
    
    // Remove banner ads
    const banners = document.querySelectorAll('.ytd-banner-promo-renderer, .ytd-statement-banner-renderer, #masthead-ad');
    banners.forEach(b => b.style.display = 'none');
  };

  const skipTwitchAds = () => {
     // Twitch is harder, usually we just mute or hide overlays
     const adOverlay = document.querySelector('[data-test-selector="ad-banner-default-text"]');
     if (adOverlay) {
         // Try to find the video and mute it
         const video = document.querySelector('video');
         if (video) video.muted = true;
     }
  };

  // Run every 1 second
  setInterval(() => {
    if (window.location.hostname.includes('youtube.com')) {
      skipYouTubeAds();
    } else if (window.location.hostname.includes('twitch.tv')) {
      skipTwitchAds();
    }
  }, 1000);
})();
`;
