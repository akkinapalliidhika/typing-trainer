// ui.js — UI utilities: dark mode, sidebar, footer tips

const UI = (() => {
  const DARK_KEY = "tt_dark";
  const SECTIONS = [
    "home","typing","scramble","speed",
    "memory","balloon","leaderboard","tutorial","about","contact"
  ];

  let _onNavigate = null;

  function init(onNavigate) {
    _onNavigate = onNavigate;

    // Dark mode
    if (localStorage.getItem(DARK_KEY) === "true") document.body.classList.add("dark");
    document.getElementById("dark-toggle").addEventListener("click", toggleDark);

    // Sidebar
    document.querySelectorAll("#sidebar li").forEach(li => {
      li.addEventListener("click", () => {
        const section = li.dataset.section;
        setActive(section);
        if (_onNavigate) _onNavigate(section);
      });
    });

    // Rotating footer tips
    _rotateTips();
  }

  function toggleDark() {
    document.body.classList.toggle("dark");
    localStorage.setItem(DARK_KEY, document.body.classList.contains("dark"));
    document.getElementById("dark-toggle").textContent =
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  }

  function setActive(section) {
    document.querySelectorAll("#sidebar li").forEach(li => {
      li.classList.toggle("active", li.dataset.section === section);
    });
  }

  function _rotateTips() {
    const el = document.getElementById("footer-tip");
    let i = 0;
    setInterval(() => {
      el.style.opacity = "0";
      setTimeout(() => {
        i = (i + 1) % DATA.footerTips.length;
        el.textContent = DATA.footerTips[i];
        el.style.opacity = "1";
      }, 400);
    }, 6000);
    el.style.transition = "opacity 0.4s";
  }

  function render(html) {
    document.getElementById("right-panel").innerHTML = html;
  }

  return { init, setActive, render };
})();
