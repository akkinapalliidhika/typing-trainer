// games.js — All game modules

/* ─── LEADERBOARD STORE ─────────────────────────────── */
const Leaderboard = (() => {
  const KEY = "tt_leaderboard";

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function addScore(game, user, score, wpm = null) {
    const all = getAll();
    all.push({ game, user, score, wpm, date: new Date().toLocaleDateString() });
    all.sort((a, b) => b.score - a.score);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  }

  function getTop(game, n = 10) {
    return getAll().filter(e => e.game === game).slice(0, n);
  }

  return { addScore, getTop };
})();

/* ─── HOME ──────────────────────────────────────────── */
function loadHome() {
  const user = Auth.getUser();
  const tiles = [
    { section: "typing",      icon: "📝", name: "Typing Trainer"  },
    { section: "scramble",    icon: "🔀", name: "Word Scramble"   },
    { section: "speed",       icon: "⚡", name: "Speed Typing"    },
    { section: "memory",      icon: "🧠", name: "Memory Sequence" },
    { section: "balloon",     icon: "🎈", name: "Balloon Game"    },
    { section: "leaderboard", icon: "🏆", name: "Leaderboard"     },
  ];
  UI.render(`
    <div class="card wide">
      <h1>Welcome back, ${user}! 👋</h1>
      <p>Choose a game below or pick from the sidebar. Track your scores on the Leaderboard.</p>
      <div class="home-grid">
        ${tiles.map(t => `
          <div class="home-tile" onclick="App.navigate('${t.section}')">
            <div class="tile-icon">${t.icon}</div>
            <div class="tile-name">${t.name}</div>
          </div>`).join("")}
      </div>
    </div>
  `);
}

/* ─── TYPING TRAINER ────────────────────────────────── */
function loadTyping() {
  let difficulty = "medium";
  let quote = "", startTime = null, timer = null;

  UI.render(`
    <div class="card">
      <h1>📝 Typing Trainer</h1>
      <div class="difficulty-tabs">
        <div class="diff-tab" data-d="easy">Easy</div>
        <div class="diff-tab active" data-d="medium">Medium</div>
        <div class="diff-tab" data-d="hard">Hard</div>
      </div>
      <div id="tt-display">Click <strong>Start</strong> to load a quote.</div>
      <div class="progress-wrap"><div class="progress-fill" id="tt-progress" style="width:0%"></div></div>
      <textarea id="tt-input" rows="3" disabled placeholder="Start typing here…"></textarea>
      <div class="stats-bar">
        <div class="stat-chip">⏱ <span id="tt-time">0</span>s</div>
        <div class="stat-chip">🎯 <span id="tt-acc">0</span>%</div>
        <div class="stat-chip">⚡ <span id="tt-wpm">0</span> WPM</div>
      </div>
      <button class="btn btn-primary" id="tt-start-btn">▶ Start</button>
      <div id="tt-feedback" class="feedback"></div>
    </div>
  `);

  // Difficulty tabs
  document.querySelectorAll(".diff-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".diff-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      difficulty = tab.dataset.d;
    });
  });

  document.getElementById("tt-start-btn").addEventListener("click", startTyping);
  document.getElementById("tt-input").addEventListener("input", onType);

  function startTyping() {
    const pool = DATA.quotes[difficulty];
    quote = pool[Math.floor(Math.random() * pool.length)];
    renderDisplay("");
    document.getElementById("tt-input").value = "";
    document.getElementById("tt-input").disabled = false;
    document.getElementById("tt-input").focus();
    document.getElementById("tt-feedback").textContent = "";
    document.getElementById("tt-progress").style.width = "0%";
    startTime = Date.now();
    clearInterval(timer);
    timer = setInterval(updateStats, 500);
  }

  function renderDisplay(typed) {
    let html = "";
    for (let i = 0; i < quote.length; i++) {
      const ch = quote[i] === " " ? "\u00a0" : quote[i];
      if (i < typed.length) {
        html += typed[i] === quote[i]
          ? `<span class="ch-correct">${ch}</span>`
          : `<span class="ch-wrong">${ch}</span>`;
      } else if (i === typed.length) {
        html += `<span class="ch-cursor">${ch}</span>`;
      } else {
        html += ch;
      }
    }
    document.getElementById("tt-display").innerHTML = html;
  }

  function onType() {
    const typed = document.getElementById("tt-input").value;
    renderDisplay(typed);
    const pct = Math.min(100, Math.round((typed.length / quote.length) * 100));
    document.getElementById("tt-progress").style.width = pct + "%";
    updateStats();
    if (typed === quote) finish(typed);
  }

  function updateStats() {
    const typed = (document.getElementById("tt-input") || {}).value || "";
    const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
    const correct = [...typed].filter((c, i) => c === quote[i]).length;
    const acc = typed.length ? Math.round((correct / typed.length) * 100) : 0;
    const wpm = Math.round((typed.trim().split(/\s+/).filter(Boolean).length / elapsed) * 60);
    document.getElementById("tt-time").textContent = Math.floor(elapsed);
    document.getElementById("tt-acc").textContent  = acc;
    document.getElementById("tt-wpm").textContent  = wpm;
  }

  function finish(typed) {
    clearInterval(timer);
    document.getElementById("tt-input").disabled = true;
    updateStats();
    const wpm = parseInt(document.getElementById("tt-wpm").textContent);
    const acc  = parseInt(document.getElementById("tt-acc").textContent);
    document.getElementById("tt-feedback").innerHTML =
      `<span class="success">✅ Done! ${wpm} WPM · ${acc}% accuracy</span>`;
    document.getElementById("tt-progress").style.width = "100%";
    Leaderboard.addScore("typing", Auth.getUser(), wpm, wpm);
  }
}

/* ─── WORD SCRAMBLE ─────────────────────────────────── */
function loadScramble() {
  let answer = "", score = 0;

  UI.render(`
    <div class="card">
      <h1>🔀 Word Scramble</h1>
      <p>Unscramble the letters to reveal the hidden word.</p>
      <div id="ws-scrambled">Press "New Word" to start</div>
      <input type="text" id="ws-input" placeholder="Your answer…" disabled />
      <div class="stats-bar">
        <div class="stat-chip">🏅 Score: <span id="ws-score">0</span></div>
      </div>
      <button class="btn btn-primary" onclick="wsNew()">🔀 New Word</button>
      <button class="btn btn-success" onclick="wsCheck()">✔ Check</button>
      <div id="ws-feedback" class="feedback"></div>
    </div>
  `);

  document.getElementById("ws-input").addEventListener("keydown", e => {
    if (e.key === "Enter") wsCheck();
  });

  window.wsNew = function () {
    const pool = DATA.scrambleWords;
    answer = pool[Math.floor(Math.random() * pool.length)];
    let arr;
    do { arr = answer.split("").sort(() => Math.random() - 0.5); }
    while (arr.join("") === answer);
    document.getElementById("ws-scrambled").textContent = arr.join("").toUpperCase();
    document.getElementById("ws-input").value = "";
    document.getElementById("ws-input").disabled = false;
    document.getElementById("ws-input").focus();
    document.getElementById("ws-feedback").textContent = "";
  };

  window.wsCheck = function () {
    const input = document.getElementById("ws-input");
    if (input.disabled) return;
    if (input.value.trim().toLowerCase() === answer) {
      score++;
      document.getElementById("ws-score").textContent = score;
      document.getElementById("ws-feedback").innerHTML = `<span class="success">🎉 Correct! The word was "${answer}"</span>`;
      input.disabled = true;
      Leaderboard.addScore("scramble", Auth.getUser(), score);
    } else {
      document.getElementById("ws-feedback").innerHTML = `<span class="error">❌ Not quite — try again!</span>`;
    }
  };
}

/* ─── SPEED TYPING ──────────────────────────────────── */
function loadSpeed() {
  let score = 0, timeLeft = 30, interval = null, currentWord = "";

  UI.render(`
    <div class="card">
      <h1>⚡ Speed Typing</h1>
      <p>Type each word and press <kbd>Enter</kbd>. 30 seconds — go!</p>
      <div id="st-word-display">—</div>
      <input type="text" id="st-input" placeholder="Type here and press Enter…" disabled autocomplete="off" />
      <div class="stats-bar">
        <div class="stat-chip">⏱ <span id="st-timer">30</span>s</div>
        <div class="stat-chip">🏅 Score: <span id="st-score">0</span></div>
      </div>
      <div class="progress-wrap"><div class="progress-fill" id="st-progress" style="width:100%"></div></div>
      <button class="btn btn-primary" id="st-start">▶ Start</button>
      <div id="st-feedback" class="feedback"></div>
    </div>
  `);

  document.getElementById("st-start").addEventListener("click", startSpeed);
  document.getElementById("st-input").addEventListener("keydown", e => {
    if (e.key !== "Enter" || interval === null || timeLeft <= 0) return;
    const val = document.getElementById("st-input").value.trim().toLowerCase();
    if (val === currentWord) {
      score++;
      document.getElementById("st-score").textContent = score;
      document.getElementById("st-feedback").innerHTML = `<span class="success">✔</span>`;
      nextWord();
    } else {
      document.getElementById("st-feedback").innerHTML = `<span class="error">✖ "${currentWord}"</span>`;
    }
    document.getElementById("st-input").value = "";
  });

  function startSpeed() {
    score = 0; timeLeft = 30;
    document.getElementById("st-score").textContent = 0;
    document.getElementById("st-input").disabled = false;
    document.getElementById("st-feedback").textContent = "";
    nextWord();
    clearInterval(interval);
    interval = setInterval(() => {
      timeLeft--;
      document.getElementById("st-timer").textContent = timeLeft;
      document.getElementById("st-progress").style.width = (timeLeft / 30 * 100) + "%";
      if (timeLeft <= 0) {
        clearInterval(interval); interval = null;
        document.getElementById("st-input").disabled = true;
        document.getElementById("st-word-display").textContent = "Time's up!";
        document.getElementById("st-feedback").innerHTML =
          `<span class="success">🏁 Final score: ${score}</span>`;
        Leaderboard.addScore("speed", Auth.getUser(), score);
      }
    }, 1000);
    document.getElementById("st-input").focus();
  }

  function nextWord() {
    const pool = DATA.speedWords;
    currentWord = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById("st-word-display").textContent = currentWord;
  }
}

/* ─── MEMORY SEQUENCE ───────────────────────────────── */
function loadMemory() {
  let seq = "", countdownTimer = null;

  UI.render(`
    <div class="card">
      <h1>🧠 Memory Sequence</h1>
      <p>Memorize the sequence, then type it from memory!</p>
      <div id="ms-seq">Press "Show Sequence"</div>
      <div id="ms-countdown"></div>
      <input type="text" id="ms-input" placeholder="Type the sequence here…" disabled autocomplete="off" />
      <div class="stats-bar">
        <div class="stat-chip">Level: <span id="ms-level">—</span></div>
      </div>
      <button class="btn btn-primary" onclick="msShow()">👁 Show Sequence</button>
      <button class="btn btn-success" onclick="msCheck()">✔ Check</button>
      <div id="ms-feedback" class="feedback"></div>
    </div>
  `);

  document.getElementById("ms-input").addEventListener("keydown", e => {
    if (e.key === "Enter") msCheck();
  });

  let level = 1;

  window.msShow = function () {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const len = 5 + level;
    seq = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    document.getElementById("ms-seq").textContent = seq;
    document.getElementById("ms-input").value = "";
    document.getElementById("ms-input").disabled = true;
    document.getElementById("ms-feedback").textContent = "";
    document.getElementById("ms-level").textContent = level;

    let t = 4;
    document.getElementById("ms-countdown").innerHTML =
      `<div class="countdown-ring">${t}</div>`;
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      t--;
      if (t <= 0) {
        clearInterval(countdownTimer);
        document.getElementById("ms-seq").textContent = "✏️ Type it now!";
        document.getElementById("ms-countdown").textContent = "";
        document.getElementById("ms-input").disabled = false;
        document.getElementById("ms-input").focus();
      } else {
        document.getElementById("ms-countdown").innerHTML = `<div class="countdown-ring">${t}</div>`;
      }
    }, 1000);
  };

  window.msCheck = function () {
    const input = document.getElementById("ms-input");
    if (input.disabled) return;
    if (input.value === seq) {
      level++;
      document.getElementById("ms-feedback").innerHTML =
        `<span class="success">🎉 Correct! Level up → ${level}</span>`;
      input.disabled = true;
      Leaderboard.addScore("memory", Auth.getUser(), level - 1);
    } else {
      document.getElementById("ms-feedback").innerHTML =
        `<span class="error">❌ Incorrect. The sequence was: ${seq}</span>`;
      level = 1;
      input.disabled = true;
    }
  };
}

/* ─── BALLOON GAME ──────────────────────────────────── */
function loadBalloon() {
  UI.render(`
    <div class="card">
      <h1>🎈 Balloon Typing</h1>
      <p>Type the word on the balloon before it floats away!</p>
      <div id="balloon-area">
        <div id="balloon"><span id="balloon-word">start</span></div>
      </div>
      <input type="text" id="balloon-input" placeholder="Type the word above…" autocomplete="off" />
      <div class="stats-bar">
        <div class="stat-chip">🏅 Score: <span id="balloon-score">0</span></div>
      </div>
      <button class="btn btn-primary" id="balloon-reset">🔄 Reset</button>
      <div id="balloon-feedback" class="feedback"></div>
    </div>
  `);
  startBalloonGame();
  document.getElementById("balloon-reset").addEventListener("click", () => {
    clearInterval(window._balloonInterval);
    startBalloonGame();
  });
}

function startBalloonGame() {
  let score = 0, top = 150, area;

  const balloon     = document.getElementById("balloon");
  const wordEl      = document.getElementById("balloon-word");
  const inputEl     = document.getElementById("balloon-input");
  const scoreEl     = document.getElementById("balloon-score");
  const feedbackEl  = document.getElementById("balloon-feedback");

  area = document.getElementById("balloon-area");

  // Random horizontal position
  function reposition() {
    const maxLeft = area.offsetWidth - balloon.offsetWidth - 20;
    balloon.style.left = Math.max(10, Math.floor(Math.random() * maxLeft)) + "px";
  }

  function newWord() {
    const pool = DATA.balloonWords;
    wordEl.textContent = pool[Math.floor(Math.random() * pool.length)];
    top = area.offsetHeight - balloon.offsetHeight - 10;
    balloon.style.top = top + "px";
    reposition();
    feedbackEl.textContent = "";
  }

  scoreEl.textContent = 0;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  newWord();

  inputEl.oninput = () => {
    const typed = inputEl.value.trim().toLowerCase();
    if (typed === wordEl.textContent.toLowerCase()) {
      score++;
      scoreEl.textContent = score;
      inputEl.value = "";
      feedbackEl.innerHTML = `<span class="success">✔ +1</span>`;
      Leaderboard.addScore("balloon", Auth.getUser(), score);
      newWord();
    }
  };

  clearInterval(window._balloonInterval);
  window._balloonInterval = setInterval(() => {
    top -= 1.5;
    balloon.style.top = top + "px";
    if (top <= 0) {
      clearInterval(window._balloonInterval);
      inputEl.disabled = true;
      feedbackEl.innerHTML = `<span class="error">🎈 It flew away! Final score: ${score}</span>`;
    }
  }, 40);
}

/* ─── LEADERBOARD ───────────────────────────────────── */
function loadLeaderboard() {
  const games = [
    { key: "typing",  label: "Typing Trainer", unit: "WPM"  },
    { key: "speed",   label: "Speed Typing",   unit: "words" },
    { key: "scramble",label: "Word Scramble",  unit: "pts"  },
    { key: "balloon", label: "Balloon Game",   unit: "pts"  },
    { key: "memory",  label: "Memory Sequence",unit: "lvl"  },
  ];

  const tables = games.map(g => {
    const rows = Leaderboard.getTop(g.key);
    const body = rows.length
      ? rows.map((r, i) => `
          <tr>
            <td class="${i < 3 ? `rank-${i+1}` : ''}">
              ${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i+1}
            </td>
            <td>${r.user}</td>
            <td><strong>${r.score}</strong> ${g.unit}</td>
            <td>${r.date}</td>
          </tr>`).join("")
      : `<tr><td colspan="4" style="color:var(--text-2);text-align:center;">No scores yet</td></tr>`;

    return `
      <div class="card" style="margin-bottom:16px;">
        <h2>${g.label}</h2>
        <table class="lb-table">
          <thead><tr><th>#</th><th>Player</th><th>Score</th><th>Date</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </div>`;
  }).join("");

  UI.render(`<div style="max-width:600px;margin:0 auto;">${tables}</div>`);
}

/* ─── TUTORIAL ──────────────────────────────────────── */
function loadTutorial() {
  UI.render(`
    <div class="card wide">
      <h1>📖 Typing Tutorial</h1>
      <div class="tutorial-grid">
        <div>
          <img src="assets/typing.webp" alt="Keyboard layout" />
        </div>
        <div>
          <h2>Tips for Better Typing</h2>
          <ul class="tutorial-tips">
            <li>Sit up straight — posture affects speed.</li>
            <li>Home row: <strong>A S D F</strong> (left) &amp; <strong>J K L ;</strong> (right).</li>
            <li>Never look at your keyboard — trust your fingers!</li>
            <li>Use all 10 fingers, not just two.</li>
            <li>Start slow and focus on zero errors.</li>
            <li>Speed will naturally follow accuracy.</li>
          </ul>
        </div>
      </div>
      <h2 style="margin-top:20px;">Practice Sentences</h2>
      <ul class="tutorial-tips">
        ${DATA.tutorialSentences.map(s => `<li>${s}</li>`).join("")}
      </ul>
      <textarea placeholder="Type here to practice any sentence…" rows="4" style="margin-top:14px;"></textarea>
    </div>
  `);
}

/* ─── ABOUT ─────────────────────────────────────────── */
function loadAbout() {
  UI.render(`
    <div class="card">
      <h1>ℹ️ About Typing Trainer</h1>
      <p><strong>Typing Trainer</strong> is a beginner-friendly web app for improving your typing skills through interactive games and real-time feedback.</p>
      <h2 style="margin-top:16px;">Features</h2>
      <ul class="tutorial-tips">
        <li>5 unique games: Trainer, Scramble, Speed, Memory, Balloon</li>
        <li>Persistent leaderboard with localStorage</li>
        <li>Dark mode for late-night sessions</li>
        <li>Real-time WPM and accuracy tracking</li>
        <li>Three difficulty levels for Typing Trainer</li>
        <li>No installation — pure HTML/CSS/JS</li>
      </ul>
      <p style="margin-top:14px;">Created as a student project at Amrita Vishwa Vidyapeetham · June 2025</p>
    </div>
  `);
}

/* ─── CONTACT ───────────────────────────────────────── */
function loadContact() {
  UI.render(`
    <div class="card">
      <h1>📬 Contact Us</h1>
      <p>Have feedback or questions? Reach out:</p>
      <ul class="tutorial-tips contact-info" style="margin-top:12px;">
        <li>Email: <a href="mailto:fun.typing@email.com">fun.typing@email.com</a></li>
        <li>GitHub: <a href="https://github.com" target="_blank">github.com/typing-trainer</a></li>
        <li>Address: Amrita Vishwa Vidyapeetham, Amaravathi</li>
      </ul>
    </div>
  `);
}
