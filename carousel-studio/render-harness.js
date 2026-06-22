// Inlined into every generated slide. Each slide template builds a paused
// GSAP timeline and assigns it to window.__tl before this runs.
// Render mode (?render=1) freezes playback so render.js can seek frame by
// frame deterministically; without it, the timeline autoplays for live preview.
(function () {
  window.__FPS = window.__FPS || 30;
  window.__DURATION_S = window.__DURATION_S || 3;
  window.__TOTAL_FRAMES = Math.round(window.__DURATION_S * window.__FPS);

  var params = new URLSearchParams(location.search);
  window.__RENDER_MODE = params.get("render") === "1";

  window.__seekFrame = function (f) {
    if (window.__tl) window.__tl.seek(f / window.__FPS, false);
  };

  if (window.__tl) {
    if (window.__RENDER_MODE) {
      window.__tl.pause(0);
    } else {
      window.__tl.play(0);
    }
  }

  window.__renderReady = true;
})();
