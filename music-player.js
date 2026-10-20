
(() => {
  "use strict";

  const MUSIC = {
    focus: {
      video: "dQw4w9WgXcQ",
      playlist: "RDdQw4w9WgXcQ"
    },
    night: {
      video: "XDpoBc8t6gE",
      playlist: "PLxlf2-hkG2GAXMSOYPeQIo25UdE0PmYkS"
    },
    gym: {
      video: "_Yhyp-_hX2s",
      playlist: "PLxlf2-hkG2GC9laS-47TWiuhHL-wXi-ey"
    }
  };

  const MOODS = {
    focus: {
      label: "☁️ Focus",
      description: "For focus and concentration."
    },
    night: {
      label: "🌙 Late Night",
      description: "For slow nights and deep thoughts."
    },
    gym: {
      label: "⚡ Gym",
      description: "For training and pushing forward."
    }
  };

  function init() {
    let root = document.getElementById("anar-music-root");

    if (!root) {
      root = document.createElement("div");
      root.id = "anar-music-root";
      document.body.appendChild(root);
    }

    root.innerHTML = `
      <button id="music-launcher" type="button"
        aria-label="Open Music Corner">
        🎧 Music Corner
      </button>

      <section id="music-panel" aria-label="Music Corner" hidden>
        <header class="music-header">
          <div class="music-heading">
            <p class="music-eyebrow">YOUR LITTLE SOUND SPACE</p>
            <h2>Music Corner 🎧</h2>
            <p id="music-description">
              For slow nights and deep thoughts.
            </p>
          </div>
          <button id="music-close" type="button"
            aria-label="Close Music Corner">×</button>
        </header>

        <div class="music-moods" aria-label="Choose a mood">
          ${Object.entries(MOODS).map(([key, mood]) => `
            <button type="button" class="music-mood"
              data-mood="${key}">
              ${mood.label}
            </button>
          `).join("")}
        </div>

        <div class="music-video">
          <iframe
            id="music-iframe"
            title="YouTube music player"
            width="100%"
            height="285"
            src=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>
        </div>

        <p class="music-note">
          Listen using YouTube's embedded player.
          Ads or video embedding restrictions may apply.
        </p>

        <footer class="music-footer">
          <span>● Made for your little corner of the internet</span>
          <button id="music-reset" type="button">Reset</button>
        </footer>
      </section>
    `;

    const panel = root.querySelector("#music-panel");
    const launcher = root.querySelector("#music-launcher");
    const iframe = root.querySelector("#music-iframe");
    const description = root.querySelector("#music-description");
    const moodButtons = root.querySelectorAll("[data-mood]");

    function selectMood(key) {
      const track = MUSIC[key];
      if (!track) return;

      description.textContent = MOODS[key].description;

      moodButtons.forEach(button => {
        const active = button.dataset.mood === key;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const params = new URLSearchParams({
        list: track.playlist,
        origin: window.location.origin
      });

      iframe.src =
        "https://www.youtube.com/embed/" +
        encodeURIComponent(track.video) +
        "?" + params.toString();
    }

    launcher.addEventListener("click", () => {
      panel.hidden = false;
      launcher.hidden = true;

      if (!iframe.getAttribute("src")) {
        selectMood("night");
      }
    });

    root.querySelector("#music-close").addEventListener("click", () => {
      panel.hidden = true;
      launcher.hidden = false;
      iframe.src = "";
    });

    moodButtons.forEach(button => {
      button.addEventListener("click", () => {
        selectMood(button.dataset.mood);
      });
    });

    root.querySelector("#music-reset").addEventListener("click", () => {
      selectMood("night");
    });

    const style = document.createElement("style");
    style.textContent = `
      #anar-music-root {
        font-family: inherit;
        color: #f4f0ff;
      }

      #music-launcher {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 9998;
        padding: 13px 20px;
        border: 1px solid #6d5ba8;
        border-radius: 999px;
        background: linear-gradient(135deg, #30234f, #594487);
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 25px #08061355;
      }

      #music-panel {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 9999;
        box-sizing: border-box;
        width: min(472px, calc(100vw - 30px));
        max-height: calc(100dvh - 32px);
        overflow-y: auto;
        padding: 15px;
        border: 1px solid #55417f;
        border-radius: 26px;
        background: #211a36;
        color: #eee8ff;
        box-shadow: 0 18px 55px #09061177;
      }

      #music-panel[hidden],
      #music-launcher[hidden] {
        display: none !important;
      }

      #music-panel .music-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 28px 24px;
        border: 1px solid #514080;
        border-radius: 25px;
        background: linear-gradient(120deg, #251b45, #514080);
      }

      #music-panel .music-eyebrow {
        margin: 0 0 8px;
        color: #c0aaff;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      #music-panel .music-heading h2 {
        margin: 0 0 10px;
        color: #fff;
        font-size: 28px;
      }

      #music-panel #music-description {
        margin: 0;
        color: #c9bfdf;
        line-height: 1.5;
      }

      #music-panel #music-close {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border: 1px solid #76649c;
        border-radius: 50%;
        background: #ffffff0b;
        color: #fff;
        font-size: 25px;
        cursor: pointer;
      }

      #music-panel .music-moods {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin: 18px 0;
      }

      #music-panel .music-mood {
        padding: 11px 15px;
        border: 1px solid #51416f;
        border-radius: 999px;
        background: transparent;
        color: #cfc4e8;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      #music-panel .music-mood.active {
        border-color: #b69bff;
        background: #b69bff;
        color: #211735;
      }

      #music-panel .music-video {
        overflow: hidden;
        border-radius: 18px;
        background: #100e16;
      }

      #music-panel .music-video iframe {
        display: block;
        width: 100%;
        height: 245px;
        border: 0;
      }

      #music-panel .music-note {
        color: #c1b6d8;
        font-size: 13px;
        line-height: 1.6;
      }

      #music-panel .music-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-top: 15px;
        border-top: 1px solid #48385f;
        color: #c1b6d8;
        font-size: 13px;
      }

      #music-panel #music-reset {
        border: 0;
        background: transparent;
        color: #cfc4e8;
        font: inherit;
        cursor: pointer;
      }

      @media (max-width: 480px) {
        #music-panel .music-header {
          padding: 22px 17px;
        }

        #music-panel .music-heading h2 {
          font-size: 24px;
        }

        #music-panel .music-video iframe {
          height: 220px;
        }
      }
    `;

    document.head.appendChild(style);
    selectMood("night");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
