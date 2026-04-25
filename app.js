// app.js — Main entry point

const App = (() => {
  const ROUTES = {
    home:        loadHome,
    typing:      loadTyping,
    scramble:    loadScramble,
    speed:       loadSpeed,
    memory:      loadMemory,
    balloon:     loadBalloon,
    leaderboard: loadLeaderboard,
    tutorial:    loadTutorial,
    about:       loadAbout,
    contact:     loadContact,
  };

  function navigate(section) {
    clearInterval(window._balloonInterval);
    UI.setActive(section);
    const fn = ROUTES[section];
    if (fn) fn();
  }

  function init() {
    Auth.init();
    UI.init(navigate);
    navigate("home");
  }

  return { init, navigate };
})();

document.addEventListener("DOMContentLoaded", App.init);
