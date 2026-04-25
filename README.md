# Typing Trainer

This project is a dynamic and interactive Typing Trainer Web Application developed to help users improve their typing speed and accuracy. It provides a simple and user-friendly interface along with features like typing tests, performance tracking, and basic user authentication.
---

## Features

- **Typing Trainer** — Real-time character highlighting, WPM & accuracy stats, 3 difficulty levels
- **Word Scramble** — Unscramble shuffled words, persistent score
- **Speed Typing** — Type as many words as possible in 30 seconds
- **Memory Sequence** — Memorise and recall random alphanumeric sequences; levels increase in length
- **Balloon Typing** — Type the word on the rising balloon before it escapes
- **Leaderboard** — Persistent top scores per game via `localStorage`
- **Dark Mode** — Toggle with one click; preference saved across sessions
- **Rotating Tips** — Footer cycles through typing tips automatically

---

##  Project Structure

```
typing-trainer/
├── index.html          # Main entry point
├── css/
│   └── style.css       # All styles (light + dark theme, responsive)
├── js/
│   ├── data.js         # Static data: quotes, word lists, tips
│   ├── auth.js         # Login / logout (session-based)
│   ├── ui.js           # Dark mode, sidebar routing, helpers
│   ├── games.js        # All game logic + leaderboard module
│   └── app.js          # Router & initialisation
├── assets/
│   ├── keyboard.webp   # Header background image
│   └── typing.webp     # Tutorial keyboard diagram
└── README.md
```

---

## Getting Started

No build step required. Just open in a browser:

```bash
# Option 1 — Open directly
open index.html

# Option 2 — Serve locally (recommended to avoid asset path issues)
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:8000`.

**Demo credentials:**
- Username: `Idhika`
- Password: `password`

---

## Games Guide

| Game | Objective | Scoring |
|------|-----------|---------|
| Typing Trainer | Type the displayed quote accurately | WPM recorded |
| Word Scramble | Unscramble the word | +1 per correct word |
| Speed Typing | Type words in 30s | Count of correct words |
| Memory Sequence | Recall a hidden sequence | Levels increase length |
| Balloon Game | Type word before balloon escapes | +1 per word |

---

## Customisation

All game content lives in `js/data.js`:

- Add quotes → `DATA.quotes.easy / medium / hard`
- Add scramble words → `DATA.scrambleWords`
- Add speed words → `DATA.speedWords`
- Add balloon words → `DATA.balloonWords`

To change login credentials, edit `js/auth.js`:
```js
const VALID_USERNAME = "Idhika";
const VALID_PASSWORD = "password";
```

---

## Tech Stack

- HTML5, CSS3 (CSS Variables, Grid, Flexbox)
- Vanilla JavaScript (ES6+, no dependencies)
- Google Fonts: Inter + JetBrains Mono
- `localStorage` for leaderboard and dark mode preference

---

## Author

**Akkinapalli Idhika**  
B.Tech CSE-AI · Amrita Vishwa Vidyapeetham  
[GitHub](https://github.com) · [LinkedIn](https://linkedin.com
