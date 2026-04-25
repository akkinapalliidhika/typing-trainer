// auth.js — Login / logout logic

const Auth = (() => {
  const VALID_USERNAME = "Idhika";
  const VALID_PASSWORD = "password";
  const SESSION_KEY = "tt_user";

  let currentUser = null;

  function init() {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      currentUser = saved;
      _showApp();
    }

    document.getElementById("login-btn").addEventListener("click", tryLogin);
    document.getElementById("logout-btn").addEventListener("click", logout);
    ["username", "password"].forEach(id =>
      document.getElementById(id).addEventListener("keydown", e => {
        if (e.key === "Enter") tryLogin();
      })
    );
  }

  function tryLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorEl  = document.getElementById("login-error");

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      currentUser = username;
      sessionStorage.setItem(SESSION_KEY, username);
      errorEl.textContent = "";
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
      _showApp();
    } else {
      errorEl.textContent = "❌ Invalid username or password.";
      document.getElementById("password").value = "";
      document.getElementById("password").focus();
    }
  }

  function logout() {
    currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    document.getElementById("main-container").style.display = "none";
    document.getElementById("login-overlay").style.display  = "flex";
    clearInterval(window._balloonInterval);
  }

  function _showApp() {
    document.getElementById("login-overlay").style.display  = "none";
    document.getElementById("main-container").style.display = "flex";
    document.getElementById("header-user").textContent = `👤 ${currentUser}`;
  }

  function getUser() { return currentUser; }

  return { init, getUser };
})();
